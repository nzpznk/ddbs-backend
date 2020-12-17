const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const mongoose = require('mongoose');
const { router } = require('./controllers');
const { mongo_conf } = require('./config')

// connect with mongodb
mongoose.connect(mongo_conf['url'], { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

const app = new Koa();

app.use(bodyParser())

app.use(router.routes())
app.use(serve('./static'))

app.listen(9933, ()=>{
    console.log('server is running at localhost:9933')
});
