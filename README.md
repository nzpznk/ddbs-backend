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
