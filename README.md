# ddbs-backend

## Design

- models.js
    * user, article, read model object.
    * using redis to cache query result. first query redis

- controllers.js
    * /api/user POST {'id': 'u25', 'name': 'user25'}, return user data
    * /api/readlist POST {'userid': '25'}, return articles which the user have read.
    * /api/add_read POST
    * /api/agree POST
    * /api/share POST
    * /api/comment POST
    * /api/top5articles POST

## Populate BeRead collection with Read table

We use mongodb aggregate pipeline to populate the BeRead table.
BeRead table is sharded using 'category' field. According to mongodb manual, when merging the aggregate result in to a sharded table using ```$merge```, the ```$on``` field should contain shard keys, and the output collection should have index on fields contained in ```$on```.

- database config example:

```
sh.enableSharding("db");     // Sharding must be enabled in the database
sh.shardCollection(
   "db.beread",      // Namespace of the collection to shard
   { category: 1 }                 // Shard key
);
db.beread.createIndex( { aid: 1, category: 1 }, { unique: true } )
```


## Upload articles folder using webhdfs

### network configure

server is also deployed on docker.

use ```docker network ls``` to check existing docker networks. In following output, 
docker-hadoop_default is the network used by hdfs.

we should use ```docker run -itd --network=docker-hadoop_default <image_name>``` to create a new 
container which share network with hdfs, so that the server can communicate with hdfs using webhdfs api.

```
NETWORK ID          NAME                    DRIVER              SCOPE
64c51ff0f82e        bridge                  bridge              local
9d76c7e9175d        docker-hadoop_default   bridge              local
9b1933529b38        host                    host                local
3438f49b4383        none                    null                local
```

- copy files to name node of hadoop
- at name node 
    ```hadoop fs -put <local_data_folder> <HDFS directory>```


## server app(using koa) docker

we also deploy koa server on docker. we use docker image node:14.15. when running the image, it should be 
added to the network of hdfs using ```--network=docker-hadoop_default```. the server expose 9933 port to provide 
restful api.

```docker run -itd --network=docker-hadoop_default --name=server0 -p 127.0.0.1:9933:9933 node:14.15```