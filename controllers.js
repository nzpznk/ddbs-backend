const Router = require('koa-router');
const mime = require('mime-types');
const {hdfs_conf} = require('./config');
const {User, Article, Read} = require('./models');
const router = new Router({prefix: '/api'});

var WebHDFS = require('webhdfs');

var hdfs = WebHDFS.createClient(hdfs_conf);

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
    let aidlist = await Read.get_user_reads(userid);
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

router.post('/article', async(ctx, next) => {
    const aid = ctx.request.body.aid;
    ctx.body = (await Article.get_by_aid(aid))[0];
});

router.get('/image/:filename', async(ctx, next) => {
    console.log('image getting...');
    const filename = ctx.params.filename;
    const mat = filename.match(/image\_a(?<aid>[0-9]+)\_([0-9]+)\.jpg/);
    if (mat == null) {
        console.log('image: '+filename+' does not exist.');
        ctx.response.status = 404;
    }
    const aid = mat.groups.aid;
    const fpath = '/articles/article'+aid+'/'+filename;
    ctx.response.set('content-type', mime.lookup(filename));
    let imagesrc = hdfs.createReadStream(fpath);
    imagesrc.on('error', (err) => {
        console.log('[hdfs read error]', err);
    });
    ctx.body = imagesrc;
});

router.get('/video/:filename', async(ctx, next) => {
    console.log('video getting...');
    const filename = ctx.params.filename;
    const mat = filename.match(/video\_a(?<aid>[0-9]+)\_video\.flv/);
    if (mat == null) {
        console.log('video: '+filename+' does not exist.');
        ctx.response.status = 404;
    }
    const aid = mat.groups.aid;
    const fpath = '/articles/article'+aid+'/'+filename;
    ctx.response.set('content-type', mime.lookup(filename));
    let videosrc = hdfs.createReadStream(fpath);
    videosrc.on('error', (err) => {
        console.log('[hdfs read error]', err);
    });
    ctx.body = videosrc;
});

router.get('/text/:aid', async (ctx, next) => {
    console.log('text getting...');
    const instr = ctx.params.aid;
    const mat = instr.match(/(?<aid>[0-9]+)/);
    if (mat == null) {
        console.log('text: '+instr+' does not exist.');
        ctx.response.status = 404;
    } else {
        const aid = mat.groups.aid;
        const fpath = '/articles/article'+aid+'/text_a'+aid+'.txt';
        let textsrc = hdfs.createReadStream(fpath);
        let dat = await new Promise((resolve, reject) => {
            textsrc.on('error', (err) => {
                console.log('[hdfs read error]');
                resolve('file not exist');
            });
            textsrc.on('data', (chunk) => {
                let dat = chunk.toString();
                console.log('text get finished');
                resolve(dat);
            });
        });
        ctx.body = dat;
    }
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