const mongoose = require('mongoose');
const { beReadSchema, articleSchema } = require('./schema');
const { mongo_conf } = require('./config')

const conn_finish = mongoose.connect(mongo_conf.url, { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

(async() => {
    await conn_finish;
    const ArticleModel = mongoose.model('Article', articleSchema);
    const max_min_time = (await ArticleModel.aggregate([{"$group":{_id: "max_time", max_value:{ $max: "$timestamp"}, min_value: { $min: "$timestamp"}}}]))[0];
    
    const max_time = Number(max_min_time.max_value);
    const min_time = Number(max_min_time.min_value);
    const step = Math.ceil((max_time - min_time) / 30);
    const tlist = [(max_time - step), (max_time - step * 7), (max_time - step * 30)];
    const tmplist = ['tmpdailylist', 'tmpweeklylist', 'tmpmonthlylist']
    const tasklist = tlist.map(function(v, i, arr) {
        const pipeline = [
            { $match: {timestamp: { $gte: String(v), $lt: String(max_time) }} },
            { $project: { aid: 1, category: 1 } },
            { $out: { db: 'db', coll: tmplist[i] } }
        ];
        return (async () => {
            await ArticleModel.aggregate(pipeline);
        })();
    });
    await Promise.all(tasklist); // generate intermediate temp collection of daily, weekly, monthly articles

    const ttlist = tmplist.map(function (temptabname, i, arr) {
        const BeReadModel = mongoose.model('BeRead', beReadSchema);
        const glist = ['daily', 'weekly', 'monthly'];
        const pipeline = [
            { $lookup: {                                // be-read left join tmp-article-list
                    from: temptabname,
                    localField: "aid",
                    foreignField: "aid",
                    as: "briefinfo" } },
            { $match: { briefinfo: { $ne: [] } } },     // filter out be-read documents which is not in the period
            { $set: {readScore: {$add: [{$toInt: '$readNum'}, {$toInt: '$commentNum'}, {$toInt: '$agreeNum'}, {$toInt: '$shareNum'}]}} },
            { $sort: {readScore: -1} },                 // sort by readNum+commentNum+agreeNum+shareNum
            { $limit: 10 },                             // get top-10
            { $project: {briefinfo: 1} },               // we only need aid and category
            { $unwind: '$briefinfo' },                  // remove redundant []
            { $group: {                                 // cateArray for computing shardTag
                _id: glist[i],
                articleAidList: { $push: '$briefinfo.aid' },
                cateArray: { $addToSet: '$briefinfo.category'}} },
            { $set: {
                temporalGranularity: glist[i],
                timestamp: String(Date.parse(new Date())),
                shardTag: { $cond: {if: {$eq:[{$size:'$cateArray'}, 2]}, then: "0", 
                                    else: {$cond: {
                                        if: {$eq: [{$arrayElemAt: ['$cateArray',0]}, 'science']}, then: "1",
                                        else: "2"}
                                    }
                            }
                }
            }},
            { $project: {cateArray: 0, _id: 0} },
            { $merge: {
                into: 'rank',
                on: ['shardTag', 'timestamp', 'temporalGranularity'],
                whenMatched: 'replace',
                whenNotMatched: 'insert'
            } }
        ];
        return BeReadModel.aggregate(pipeline);
    });
    await Promise.all(ttlist); // generate daily, weekly, monthly hottest ranklist in parallel.
    await mongoose.disconnect();
})();
