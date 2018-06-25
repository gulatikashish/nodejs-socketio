const express = require('express');
const path = require('path');
const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const hbs = require('express-handlebars');
const session = require('express-session');
const users = require('./routes/authRoute');
const config = require('./config');
const db = require('./db');
const { getName } = require('./controller/authCtrl');
const port = config.port;
const app = express();
const helpers = require('handlebars-helpers')();
let userIdarr = [];
app.use(cors());
app.use(
  session({
    secret: 'ilovescotchscotchyscotchscotch', // session secret
    resave: true,
    saveUninitialized: true,
  }),
);
db.connect();

// view engine setup
app.locals.baseUrl = 'http://localhost:3000/';
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  hbs({
    extname: '.hbs',
    layoutsDir: __dirname + '/views',
    // partialsDir: __dirname + '/views/partials',
    // defaultLayout: 'admin',
    helpers: helpers,
  }),
);
app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', users);
const server = app.listen(port, (err, data) => {
  if (err) {
    throw err;
  } else {
    console.log(`----- SERVER STARTED AT ${port} -----`);
  }
});

const io = require('socket.io')(server);
let room_id;
let userName;

io.on('connection', socket => {
  console.log(socket.id);
  socket.on('userId', data => {
    userIdarr.push(data.userId);
    socket.userId = data.userId;
    socket.userName = data.userName;
    console.log(socket.userName);
    io.sockets.emit('change_status', { id: data.userId, status: 'online', socket_id: socket.id });
  });
  socket.on('roomId', data => {
    socket.join(data);
    room_id = data;
  });
  socket.userName = userName;
  socket.on('message', async data => {
    let obj = await getName(data);
    console.log('data', data);
    console.log('arr', userIdarr);
    io.sockets.in(room_id).emit('send', obj);
  });
  socket.on('typing', data => {
    io.sockets.emit('typing', data);
  });

  socket.on('logout', data => {
    io.sockets.emit('change_status', { id: data, status: 'offline' });
  });

  socket.on('new_message', data => {
    io.sockets.emit('new_message', { message: data.message, username: socket.username });
  });

  socket.on('typing', data => {
    socket.broadcast.emit('typing', { username: socket.username });
  });

  socket.on('sendNotification', data => {
    console.log(data);
  });
  socket.on('disconnect', () => {
    console.log('===', socket.id, socket.userName);
    io.sockets.emit('change_status', { id: socket.userId, status: 'offline' });

    // if (addedUser) {
    //   --numUsers;

    //   // echo globally that this client has left
    //   socket.broadcast.emit('user left', {
    //     username: socket.username,
    //     numUsers: numUsers
    //   });
    // }
  });
});

module.exports = server;
