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
//listen on every connection
io.on('connection', socket => {
  console.log('New user connected', socket.id);
  socket.on('socketid', data => {
    io.sockets.emit('socketid', { socket_id: socket.id });
  });
  //default username
  socket.username = 'Anonymous';
  socket.on('message', async data => {
    let obj = await getName(data);
    io.emit('send', obj);
  });
  socket.on('typing', data => {
    console.log('---', data);
    io.sockets.emit('typing', data);
  });
  //listen on change_username
  socket.on('userId', data => {
    io.sockets.emit('change_status', { id: data, status: 'online', socket_id: socket.id });
  });
  socket.on('logout', data => {
    io.sockets.emit('change_status', { id: data, status: 'offline' });
  });

  //listen on new_message
  socket.on('new_message', data => {
    //broadcast the new message
    io.sockets.emit('new_message', { message: data.message, username: socket.username });
  });

  //listen on typing
  socket.on('typing', data => {
    socket.broadcast.emit('typing', { username: socket.username });
  });
});

module.exports = server;
