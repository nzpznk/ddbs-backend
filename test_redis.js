const redis = require('redis');
const { promisify } = require('util');
const { redis_conf } = require('./config');

const client = redis.createClient(redis_conf);

const getAsync = promisify(client.get).bind(client);
const hmgetAsync = promisify(client.hmget).bind(client);

client.on("error", function(error) {
    console.error(error);
});

client.once("connect", ()=>{
    console.log('connected with redis.');
});
  
// client.set("key", "value", 'EX', 5, redis.print);
(async () => {
    console.log(await getAsync("key"));
})();
// client.hmset('user', 'u31', '{a:3, b:5}', 'EX', 10, redis.print);
// client.hmset('user', 'u32', 'emmmm', 'EX', 20, redis.print);
// client.hmget('user', 'u31', console.log);
// client.hmget('user', 'u32', console.log);
(async () => {
    console.log(await hmgetAsync('user', 'u31'));
    console.log(await hmgetAsync('user', 'u32'));
})();

// client.quit((err,reply)=>{
//     if (err) {console.log(err);}
//     else {
//         console.log('exit successfully, ' + reply);
//     }
// });
