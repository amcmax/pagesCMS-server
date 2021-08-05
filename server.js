const express = require('express')
const { ApolloServer } = require('apollo-server-express');
const { createServer } = require('http');
const resolvers = require('./resolvers');
const typeDefs = require('./schema');
require('dotenv').config()
const path = require('path');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');

const app = express()

// const RedisStore = connectRedis(session)

// const redisClient = redis.createClient({
//   host: 'localhost',
//   port: 6379
// })

// redisClient.on('error', function (err) {
//   console.log('Could not establish a connection with redis. ' + err);
// });
// redisClieconst redisClient = redis.createClient({
//   //   host: 'localhost',
//   //   port: 6379
//   // })nt.on('connect', function (err) {
//   console.log('Connected to redis successfully');
// });

// app.use(session({
//   store: new RedisStore({ client: redisClient }),
//   secret: 'secret$%^134',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//       secure: false,
//       httpOnly: false,
//       maxAge: 1000 * 60 * 10
//   }
// }))

app.use(express.static(path.join(__dirname, 'clients/chatbot/build')));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  playground: {
      endpoint: 'http://localhost:5000/graphql',
      settings: {
          'editor.theme': 'light'
      }
  },
  subscriptions: {
    path: '/subscriptions',
    onConnect: async (connectionParams, webSocket) => {
      console.log('Websocket connection...');
      console.log(connectionParams);
    },
  },
})

server.applyMiddleware({ app })

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.once('open', ()=>{
    console.log("Connected to MongoDB")
}).then( (res) => {
    httpServer.listen(5000, () => {
        console.log('Server is running on port 5000')
    })
})