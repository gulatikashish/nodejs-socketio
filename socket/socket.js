const { server } = require('../app');
const io = require('socket.io')(server);
//listen on every connection
const connect = function() {
  console.log('--------------------------------', io);
  io.on('connection', socket => {
    console.log('==========');
    console.log('New user connected');

    //default username
    socket.username = 'Anonymous';

    //listen on change_username
    socket.on('change_username', data => {
      socket.username = data.username;
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
};
module.exports = { connect };
