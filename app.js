const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const Router = require('koa-router');
const mongoose = require('mongoose');

// connect with mongodb
mongoose.connect('mongodb://localhost/douban', { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

const app = new Koa();

app.use(bodyParser())

router = new Router();
router.get('/', async (ctx, next) => {
    ctx.body=`exciting`
});
router.get('/user', async (ctx, next) => {
    console.log(ctx.request);
})

app.use(router.routes())
app.use(serve('./static'))

app.listen(3000, ()=>{
    console.log('server is running at localhost:3000')
});
