const User = require('../user');

const findAll = async () => {
  let result = await User.find().lean();
  return result;
};

const findOneByEmail = async email => {
  let result = await User.findOne({ email: email }).lean();
  return result;
};

const findOneById = async id => {
  let result = await User.findById(id).lean();
  return result;
};

const validEmailPassword = async (email, password) => {
  let result = await User.findOne({
    email,
    password,
  }).lean();
  return result;
};

const insert = async (name, email, password) => {
  let result = await User.create({
    name,
    email,
    password,
  });
  return result;
};

const updatePassword = async (id, password) => {
  let result = await User.findOneAndUpdate({ _id: id }, { password: password }, { new: true }).lean();
  return result;
};

const getAllUsers = async () => {
  let result = await User.find().lean();
  return result;
};

const getAllExceptOne = async id => {
  let result = await User.find({ _id: { $nin: [id] } }).lean();
  return result;
};

const changeStatus = async (id, status) => {
  let result = await User.findOneAndUpdate({ _id: id }, { status: status }, { new: true }).lean();
  return result;
};
module.exports = {
  findAll,
  findOneByEmail,
  findOneById,
  insert,
  validEmailPassword,
  updatePassword,
  getAllUsers,
  getAllExceptOne,
  changeStatus,
};
