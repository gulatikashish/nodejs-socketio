const Chat = require('../chat');
const Message = require('../message');
const moment = require('moment');
const getMessage = async (user_id, login_id) => {
  try {
    let chat_id;
    if (user_id < login_id) {
      chat_id = `${user_id}:${login_id}`;
    } else {
      chat_id = `${login_id}:${user_id}`;
    }
    let result = [];
    let rest = await Chat.findOne({ chat_id: chat_id });
    if (rest) {
      result = await Message.find({ chat_id: rest._id })
        .populate('sender_id')
        .lean();
    }
    return result;
  } catch (err) {
    console.log(err);
  }
};

const insertMessage = async (sender_id, receiver_id, message) => {
  try {
    let chat_id;
    if (sender_id < receiver_id) {
      chat_id = `${sender_id}:${receiver_id}`;
    } else {
      chat_id = `${receiver_id}:${sender_id}`;
    }
    let rest = await Chat.findOne({ chat_id: chat_id });
    if (!rest) {
      rest = await Chat.create({
        chat_id,
        sender_id,
      });
    }
    let result = await Message.create({
      sender_id: sender_id,
      message: message,
      chat_id: rest._id,
    });
    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getMessage,
  insertMessage,
};
