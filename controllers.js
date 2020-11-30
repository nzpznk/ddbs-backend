const { userSchema, articleSchema, readSchema, beReadSchema, rankSchema } = require('./schema')
const mongoose = require('mongoose');

User = mongoose.model('User', userSchema);
Article = mongoose.model('Article', articleSchema);
Read = mongoose.model('Read', readSchema);
BeRead = mongoose.model('BeRead', beReadSchema);
Rank = mongoose.model('Rank', rankSchema);

// supported queries:
/**
 * search user by id
 * search article by id
 * search article by title
 * search article by date-time
 * given userid, join with read table, article table, return articles read by user, sort by date(latest->earlist)
 * insert a read record when a user read an article
 * update a read record when a user agree/share/comment an article
 * insert(when not exist)/update(when exist) a be-read record(of an article), when user read/share/comment/agree an article
 * search top-5 daily/weekly/monthly popular articles(by read?agree?share?comment?) using be-read table
 */

function search_user_by_id(user_id) {

}

function search_article_by_id(article_id) {

}

function search_article_by_title(article_name) {

}

function search_article_by_date(date_st, date_ed) {

}

function search_read_articles_of_user(user_id) {

}

function insert_read_record()


module.exports = {
    search_user_name : async (ctx, next) => {
        condition = ctx.request.query;
        if (condition === undefined) {
            ctx.body = []
        } else {
            
            ctx.body
        }
    }
}
