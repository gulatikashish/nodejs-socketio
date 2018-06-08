const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator/check');
const {
  findOneByEmail,
  findOneById,
  insert,
  updatePassword,
  getAllExceptOne,
  changeStatus,
} = require('../models/services/userDbService');

const { encrypt, decrypt } = require('../common/services');

const getLogin = async (req, res) => {
  return res.render('login');
};

const getRegister = async (req, res) => {
  return res.render('register');
};

const getDashboard = async (req, res) => {
  let data = await getAllExceptOne(req.session.data.id);
  await data.map(d => {
    if (d.status == false) {
      d.status = 'offline';
    } else {
      d.status = 'online';
    }
    return d;
  });
  return res.render('chat', { data: data });
};

const login = async (req, res) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(422).json({ errors: errors.mapped() });
    // }
    let { email, password } = req.body;
    let check = await findOneByEmail(email);
    if (!check) {
      return res.render('login', { danger: 'No Such Email Exist' });
    }
    let encPassword = await decrypt(password, check.password);
    if (!encPassword) {
      return res.render('login', { danger: 'Invalid Credentials' });
    }
    req.session.data = { id: check._id };
    await changeStatus(check._id, 1);
    return res.redirect('/dashboard');
  } catch (error) {
    return res.render('login', { danger: error.message });
  }
};

const register = async (req, res) => {
  try {
    let { name, email, password, cpassword } = req.body;
    if (password !== cpassword) {
      return res.render('register', { danger: 'password and confirm password does not match' });
    }
    let check = await findOneByEmail(email);
    if (check) {
      return res.render('register', { danger: 'Email Already In Use' });
    }
    let encpassword = encrypt(password);
    let user = await insert(name, email, encpassword);
    return res.render('login', { success: 'Registration Sucess', data: user });
  } catch (error) {
    return res.render('register', { danger: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const { _id } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    const user = await findOneById(_id);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: 'NO Such Id Exist',
      });
    }
    return res.status(200).send({
      success: true,
      message: 'User Data',
      data: user,
    });
  } catch (error) {
    return res.status(501).send({
      success: false,
      message: error.message,
    });
  }
};

const change_password = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.mapped() });
    }
    let { _id, oldPassword, newPassword } = req.body;
    let user = await findOneById(_id);
    if (!user) {
      return res.status(401).send({
        success: false,
        message: 'No Such Id Exist',
      });
    }
    let checkPassword = await decrypt(oldPassword, user.password);
    if (checkPassword) {
      let encpassword = encrypt(newPassword);
      await updatePassword(_id, encpassword);
      return res.status(200).send({
        success: true,
        message: 'Password Upadted',
      });
    } else {
      return res.status(401).send({
        success: false,
        message: 'Incorrect Password',
      });
    }
  } catch (error) {
    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const checkAuth = async (req, res, next) => {
  if (req.session.data) {
    next();
  } else {
    return res.redirect('/');
  }
};

const checkLogin = async (req, res, next) => {
  if (req.session.data === undefined) {
    next();
  } else {
    return res.redirect('/dashboard');
  }
};

const logout = async (req, res) => {
  if (req.session.data) {
    await changeStatus(req.session.data.id, 0);
    delete req.session.data;
    return res.redirect('/');
  }
  return res.redirect('/');
};

module.exports = {
  getLogin,
  getRegister,
  getDashboard,
  getProfile,
  login,
  register,
  change_password,
  checkAuth,
  checkLogin,
  logout,
};
