'use strict';

const express     = require('express');
const session     = require('express-session');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const auth        = require('./app/auth.js');
const routes      = require('./app/routes.js');
const mongo       = require('mongodb').MongoClient;
const passport    = require('passport');
const cookieParser= require('cookie-parser')
const app         = express();
const http        = require('http').Server(app);
const sessionStore= new session.MemoryStore();
const cors = require('cors');
const passportSocketIo = require('passport.socketio')
app.use(cors());


fccTesting(app); //For FCC testing purposes

app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'pug')

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  key: 'express.sid',
  store: sessionStore,
}));


mongo.connect(process.env.DATABASE, (err, db) => {
    if(err) console.log('Database error: ' + err);
  
    auth(app, db);
    routes(app, db);
      
    http.listen(process.env.PORT || 3000);

  var currentUsers= 0;
  
  
    
  //initiate socket on server
  const io = require('socket.io')(http); 
  
  //socket.io with passport to decode user socket info; creates a socket.req.user object
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser, //from cookie-parser package
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore //from new express-session.MemoryStore()
  }))
  
  //.on listens for connection from client to server
  io.on('connection' /*give the connection event a name*/, function(socket) /*contains data about client*/
        {
    function incrementUsers() {
  ++currentUsers;
  /*emits from server to client*/ io.emit('user' /*name of connection*/, {name: socket.request.user.name, currentUsers: currentUsers, connected: true} /*data to emit*/);
  }
    incrementUsers();

    socket.on('chat message', (message) => {
      io.emit('chat message', {name: socket.request.user.name, message}
      )});
    
    socket.on('disconnect' /*disconncection occurs after connection*/, ()=>{
      --currentUsers;
      io.emit('user', {name: socket.request.user.name, currentUsers, connected: false})});
    

    
})
  
  
  
  
  
  

  
  
});
