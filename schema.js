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
    timestamp: {type: String, default: Date.now()}, 
    uid: String, 
    aid: String, 
    readTimeLength: {type: String, default: 0}, 
    readSequence: {type: String, default: 0}, 
    readOrNot: {type: String, default: 0}, 
    aggreeOrNot: {type: String, default: 0}, 
    commentOrNot: {type: String, default: 0}, 
    commentDetail: {type: String, default: ""}, 
    shareOrNot: {type: String, default: 0}
}, {collection: 'read'});

const beReadSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    aid: String, 
    readNum: String, 
    readUidList: String, 
    commentNum: String, 
    commentUidList: Array, 
    agreeNum: String, 
    agreeUidList: Array, 
    shareNum: String, 
    shareUidList: Array
});

const rankSchema = new mongoose.Schema({
    id: String, 
    timestamp: String, 
    temporalGranularity: String, 
    articleAidList: String
});

module.exports = {userSchema, articleSchema, readSchema, beReadSchema, rankSchema}
