const { userSchema, articleSchema, readSchema, beReadSchema, rankSchema } = require('./schema')
const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const { redis_conf } = require('./config');
const { title } = require('process');

const redis_client = redis.createClient(redis_conf);
const client = {
    set: promisify(redis_client.set).bind(redis_client), 
    get: promisify(redis_client.get).bind(redis_client), 
    hmget: promisify(redis_client.hmget).bind(redis_client), 
    hmset: promisify(redis_client.hmset).bind(redis_client), 
    hget: promisify(redis_client.hget).bind(redis_client), 
    hset: promisify(redis_client.hset).bind(redis_client)
};

async function cached_search_with_cond_and_key(key, cond, proj, mongo_model, expire_time) {
    let res_dat = await client.get(key);
    if (res_dat === null) {
        console.log(key + ' not in cache');
        res_dat = await mongo_model.find(cond, proj).lean().catch((err) => console.log(err));
        client.set(key, JSON.stringify(res_dat), 'EX', expire_time);
        return res_dat;
    } else {
        console.log(key + ' cache hit')
        return JSON.parse(res_dat);
    }
}

function get_random(l, r) {
    return Math.floor(Math.random() * (r-l)) + l;
}


class User {
    constructor() {
        this.mongo_model = mongoose.model('User', userSchema);
        this.name = "user";
        this.expire_time = get_random(30, 60);
    }
    
    async get_by_uid(uid) {
        const key = this.name + '@uid@' + uid;
        const proj = {'_id': 0};
        this.expire_time = get_random(30, 60);
        return (await cached_search_with_cond_and_key(key, {'uid': uid}, proj, this.mongo_model, this.expire_time))[0];
    }

    async get_by_name(name) {
        const key = this.name + '@name@' + name;
        const proj = {'_id': 0};
        this.expire_time = get_random(30, 60);
        return await cached_search_with_cond_and_key(key, {'name': name}, proj, this.mongo_model, this.expire_time);
    }
}

class Article {
    constructor() {
        this.mongo_model = mongoose.model('Article', articleSchema);
        this.name = "article";
        this.expire_time = get_random(60, 120);
    }
    async get_by_aid(aid) {
        const key = this.name + '@aid@' + aid;
        const proj = {};
        this.expire_time = get_random(60, 120);
        return await cached_search_with_cond_and_key(key, {'aid': aid}, proj, this.mongo_model, this.expire_time);
    }
    async get_by_title() {
        const key = this.name + '@title@' + title;
        const proj = {};
        this.expire_time = get_random(60, 120);
        return await cached_search_with_cond_and_key(key, {'title': title}, proj, this.mongo_model, this.expire_time);
    }
    async get_by_date_time() {}
    async get_random_aidlist(num) {
        return (await this.mongo_model.aggregate([
            { $sample: {size: num} }, 
            { $project: {aid: 1} }, 
            { $group: {_id:'randomly', articleAidList: {$push: '$aid'}} },
            { $set: {temporalGranularity: 'randomly'} },
            { $project: {_id: 0} }
        ]))[0];
    }
}

/**
 * cache data:
 * read|userread|user_id: list of user read articles;
 * // read|read|user_id|article_id: a read schema record;
 */
class Read {
    constructor() {
        this.mongo_model = mongoose.model('Read', readSchema);
        this.name = 'read';
        this.expire_time = get_random(120, 180);
    }
    async get_user_reads(user_id) {
        return (await this.mongo_model.aggregate([
            { $match: {uid: user_id} },
            { $group: {
                _id: user_id,
                readlist: { $addToSet: { $cond: [{$eq: ['$readOrNot','1']}, '$aid', '$noval'] } },
                commentlist: { $addToSet: { $cond: [{$eq: ['$commentOrNot','1']}, '$aid', '$noval'] } },
                sharelist: { $addToSet: { $cond: [{$eq: ['$shareOrNot','1']}, '$aid', '$noval'] } },
                agreelist: { $addToSet: { $cond: [{$eq: ['$agreeOrNot','1']}, '$aid', '$noval'] } }
            } }
        ]))[0];
    }
    // async get_read_record(user_id, article_id) {
    //     const key = this.name + '@read@' + user_id + '@' + article_id;
    //     const cond = {'uid': user_id, 'aid': article_id};
    //     return await cached_search_with_cond_and_key(key, cond, {}, this.mongo_model, this.expire_time);
    // }
    // async insert_user_read(user_id, article_id) {
    //     let read_record = await this.get_read_record(user_id, article_id);
    //     if (read_record.length > 0) { // read record in cache, update read_time & read_or_not

    //         await this.mongo_model.updateOne({_id: read_record[0]['_id']}, {'timestamp': Date.now(), 'readOrNot': 1});
    //     } else {
    //         read_record = new this.mongo_model({
    //             uid: user_id,
    //             aid: article_id, 
    //             readOrNot: 1
    //         });
    //         await read_record.save();
    //     }
    //     return 'insert_user_read finished';
    // }
    // async get_user_shares(user_id) {
    // }
    // async get_user_comments(user_id, article_id) {
    // }
}

class BeRead {
    constructor() {
        this.mongo_model = mongoose.model('BeRead', beReadSchema);
        this.name = 'beread';
        this.expire_time = get_random(60, 120);
    }
    async get_article_stats(aid) {
        const key = this.name + "@articlestat@" + aid;
        const cond = {aid: aid};
        const proj = {};
        this.expire_time = get_random(60, 120);
        return await cached_search_with_cond_and_key(key, cond, proj, this.mongo_model, this.expire_time);
    }
}

class Rank {
    constructor() {
        this.mongo_model = mongoose.model('Rank', rankSchema);
        this.name = 'rank';
        this.expire_time = get_random(60, 120);
    }
    async get_rank_by_granularity(granularity) {
        const key = this.name + '@granularity@' + granularity;
        const cond = { temporalGranularity: granularity };
        const proj = { _id: 0, shardTag: 0 };
        this.expire_time = get_random(60, 120);
        return cached_search_with_cond_and_key(key, cond, proj, this.mongo_model, this.expire_time);
    }
}

module.exports = {
    User: new User(),
    Article: new Article(), 
    Read: new Read(), 
    BeRead: new BeRead(), 
    Rank: new Rank()
}
