const express = require('express');
const { check } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const app = express();
const {
  getRegister,
  getLogin,
  getDashboard,
  register,
  login,
  change_password,
  getProfile,
  checkAuth,
  checkLogin,
  logout,
  getMessages,
  sendMessage,
} = require('../controller/authCtrl');
app.get('/', checkLogin, getLogin);
app.get('/register', getRegister);
app.get('/dashboard', checkAuth, getDashboard);
app.get('/logout', logout);
app.post('/profile', [check('_id').exists()], getProfile);

app.post(
  '/register',
  [
    check('email')
      .isEmail()
      .withMessage('must be an email'),
    check('name').exists(),
    check('password').exists(),
  ],
  register,
);
app.post(
  '/',
  [
    check('email')
      .isEmail()
      .withMessage('must be an email'),
    check('password').exists(),
  ],
  login,
);
app.put(
  '/changePassword',
  [check('_id').exists(), check('oldPassword').exists(), check('newPassword').exists()],
  change_password,
);
app.post('/getMessages', getMessages);
app.post('/send_message', sendMessage);

module.exports = app;
