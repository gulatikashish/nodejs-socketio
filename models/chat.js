const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  chat_id: {
    type: String,
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  time: { type: String, default: moment().format() },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
