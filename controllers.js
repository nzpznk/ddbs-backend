const Router = require('koa-router');
const mime = require('mime-types');
const fs = require('fs');
const {hdfs_conf} = require()
const {User, Article, Read} = require('./models');
const router = new Router({prefix: '/api'});

var WebHDFS = require('webhdfs');

var hdfs = WebHDFS.createClient();

// given user id or name, return user data.
router.post('/user', async (ctx, next) => {
    const id = ctx.request.body.id;
    if (id === undefined) {
        const name = ctx.request.body.name;
        if (name === undefined) {
            ctx.body = []
        } else {
            let res = await User.get_by_name(name);
            ctx.body = res;
        }
    } else {
        ctx.body = await User.get_by_id(id);
    }
});

// given user uid, return read article list.
router.post('/readlist', async (ctx, next) => {
    // get parameter: userid
    const userid = ctx.request.body.userid;

    // query Read table to get user read article id list;
    aidlist = await Read.get_user_reads(userid);
    if (aidlist.length == 0) {
        ctx.body = []
        return;
    }

    // async search article detail, then add detail to read record;
    let tasklist = []
    for (let x of aidlist) {
        tasklist.push((async () => {
            x['article'] = (await Article.get_by_aid(x.aid))[0];
            return x;
        })());
    }
    let res = await Promise.all(tasklist);
    ctx.body = res;
});

router.get('/image/:filename', async(ctx, next) => {
    const filename = ctx.params.filename;
    const mat = filename.match(/image\_a(?<aid>[0-9]+)\_([0-9]+)\.jpg/);
    if (mat == null) {
        console.log('image: '+filename+' does not exist.');
    }
    const aid = mat.groups.aid;
    const fpath = '/article/article'+aid+'/'+filename;
    ctx.response.set('content-type', mime.lookup(filename));
});

router.get('/video/:filename', async(ctx, next) => {

});

router.post('/article/:aid', async(ctx, next) => {

});

// supported queries:
/**
 * search user by id/name
 * search article by id/title/date-time
 * given userid, join with read table, article table, return articles read by user, sort by date(latest->earlist)
 * insert a read record when a user read an article
 * update a read record when a user agree/share/comment an article
 * insert(when not exist)/update(when exist) a be-read record(of an article), when user read/share/comment/agree an article
 * search top-5 daily/weekly/monthly popular articles(by read?agree?share?comment?) using be-read table
 */


// function search_article_by_title(article_name) {
// }

// function search_article_by_date(date_st, date_ed) {
// }

// function insert_read_record() {
// }


// module.exports = {
//     search_user_name : async (ctx, next) => {
//         condition = ctx.request.query;
//         if (condition === undefined) {
//             ctx.body = []
//         } else {
            
//             ctx.body
//         }
//     }
// }

module.exports = {router};