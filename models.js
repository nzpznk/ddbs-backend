const { userSchema, articleSchema, readSchema, beReadSchema, rankSchema } = require('./schema')
const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const { redis_conf } = require('./config');

const redis_client = redis.createClient(redis_conf);
const client = {
    set: promisify(redis_client.set).bind(redis_client), 
    get: promisify(redis_client.get).bind(redis_client), 
    hmget: promisify(redis_client.hmget).bind(redis_client), 
    hmset: promisify(redis_client.hmset).bind(redis_client), 
    hget: promisify(redis_client.hget).bind(redis_client), 
    hset: promisify(redis_client.hset).bind(redis_client)
};

async function cached_search_with_cond_and_key(key, cond, mongo_model, expire_time) {
    let res_dat = await client.get(key);
    if (res_dat === null) {
        console.log(key + ' not in cache');
        res_dat = await mongo_model.find(cond).catch((err) => console.log(err));
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
    
    async get_by_id(id) {
        const key = this.name + '@id@' + id;
        return await cached_search_with_cond_and_key(key, {'id': id}, this.mongo_model, this.expire_time);
    }

    async get_by_name(name) {
        const key = this.name + '@name@' + name;
        return await cached_search_with_cond_and_key(key, {'name': name}, this.mongo_model, this.expire_time);
    }
}

// class Article {

// }


(async ()=>{
    mongoose.connect('mongodb://localhost/douban', { useNewUrlParser: true, useUnifiedTopology: true});
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'database connection error'));
    db.once('open', () => { console.log('connection with database established.'); });
    const umodel = new User();
    console.log(await umodel.get_by_id('u35'));
    console.log(await umodel.get_by_id('not in db'));
    console.log(await umodel.get_by_name('user95'));
    console.log(await umodel.get_by_name('u35'));
})();
