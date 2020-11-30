const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const serve = require('koa-static');
const mongoose = require('mongoose');
const { router } = require('./controllers');

// connect with mongodb
mongoose.connect('mongodb://localhost/douban', { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'database connection error'));
db.once('open', () => { console.log('connection with database established.'); });

const app = new Koa();

app.use(bodyParser())

app.use(router.routes())
app.use(serve('./static'))

app.listen(3000, ()=>{
    console.log('server is running at localhost:3000')
});
