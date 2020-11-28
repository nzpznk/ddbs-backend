mongoose = require('mongoose');

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

module.exports = {userSchema, articleSchema, readSchema, beReadSchema, rankSchema}
