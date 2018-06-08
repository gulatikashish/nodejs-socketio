const mongoose = require('mongoose');
const config = require('../config');
const mongoURI = process.env.MONGOLAB_URI || config.mongoURI;
mongoose.Promise = global.Promise;

var connect = function() {
  return mongoose.connect(
    mongoURI,
    function(err) {
      if (err) {
        console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
        setTimeout(connect, 5000);
      } else {
        // mongoose.connection.db.dropDatabase();
      }
    },
  );
};

mongoose.connection.on('open', function() {
  console.log('Database Connected');
});
module.exports = { connect };
