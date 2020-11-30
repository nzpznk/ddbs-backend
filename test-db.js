const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/douban', { useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

const userSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    uid: String, 
    name: String, 
    gender: String, 
    email: String, 
    phone: String, 
    dept: String, 
    grade: String, 
    language: String, 
    region: String, 
    role: String, 
    preferTags: String, 
    obtainedCredits: String
}, {collection: 'user'});

const articleSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    aid: String, 
    title: String, 
    category: String, 
    abstract: String, 
    articleTags: String, 
    authors: String, 
    language: String, 
    text: String, 
    image: String, 
    video: String
}, {collection: 'article'});

const readSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    uid: String, 
    aid: String, 
    readTimeLength: String, 
    readSequence: String, 
    readOrNot: String, 
    aggreeOrNot: String, 
    commentOrNot: String, 
    commentDetail: String, 
    shareOrNot: String
}, {collection: 'read'});

const beReadSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    aid: String, 
    readNum: String, 
    readUidList: String, 
    commentNum: String, 
    commentUidList: String, 
    agreeNum: String, 
    agreeUidList: String, 
    shareNum: String, 
    shareUidList: String
});

const rankSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    temporalGranularity: String, 
    articleAidList: String
});


const User = mongoose.model('User', userSchema);
const Article = mongoose.model('Article', articleSchema);
const Read = mongoose.model('Read', readSchema);
x1 = User.find({uid: '35'}, (err, res) => {
    console.log('... test user search ...')
    if (err) return console.error(err);
    console.log(res);
});

x2 = Article.find({aid:'24'}, (err, res) => {
    console.log('... test article search ...');
    if (err) return console.error(err);
    console.log(res);
});

x3 = Read.find({readOrNot: '1'}, (err, res)=>{
    console.log('... search three read records ...');
    if (err) return console.error(err);
    console.log(res);
}).limit(3);

(async()=>{
await Promise.all([x1, x2, x3]);
let ttt = await User.find({uid: '35'});
console.log(ttt);
mongoose.disconnect();
})();
