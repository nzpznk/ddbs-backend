const mongoose = require('mongoose');
const { readSchema } = require('./schema');

const conn_finish = mongoose.connect('mongodb://localhost/douban', { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

(async() => {
    await conn_finish;
    const ReadModel = mongoose.model('BeRead', readSchema);
    const pipeline = [
        {
            $group: {
                _id : '$aid',
                aid : { $first: '$aid' },
                category: { $first: '$category' },
                readNum : { $sum: { $toInt: '$readOrNot' }},
                commentNum  : { $sum: { $toInt: '$commentOrNot' }},
                agreeNum    : { $sum: { $toInt: '$agreeOrNot' }},
                shareNum    : { $sum: { $toInt: '$shareOrNot' }},
                readUidList : { $addToSet: { $cond: [ {$eq: ['$readOrNot', '1']}, '$uid', '$noval'] }},
                commentUidList  : { $addToSet: { $cond: [{ $eq: ['$commentOrNot', '1'] }, '$uid', '$noval'] } },
                agreeUidList    : { $addToSet: { $cond: [{ $eq: ['$agreeOrNot'  , '1'] }, '$uid', '$noval'] } },
                shareUidList    : { $addToSet: { $cond: [{ $eq: ['$shareOrNot'  , '1'] }, '$uid', '$noval'] } }
            }
        },
        { $unset: '_id' },
        { $merge: {
            into: 'beread',
            on: ['category', 'aid'],
            whenMatched: replace,
            whenNotMatched: insert
        } }
    ]
    ReadModel.aggregate(pipeline);
    await mongoose.disconnect();
})();
