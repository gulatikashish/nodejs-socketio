const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  sender_id: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver_id: { type: Schema.Types.ObjectId, ref: 'User' },
  sender_name: { type: String },
  receiver_name: { type: String },
  messages: [
    {
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      body: { type: String },
      time: { type: String, default: moment().format() },
    },
  ],
  timestamp: { type: String, default: moment().format() },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
