const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  chat_id: { type: Schema.Types.ObjectId, ref: 'Chat' },
  timestamp: { type: String, default: moment().format() },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
