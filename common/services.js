const bcrypt = require('bcrypt');
const encrypt = string => {
  let salt = bcrypt.genSaltSync(10);
  let crypted = bcrypt.hashSync(string, salt);
  return crypted;
};
const decrypt = async (password, hash) => {
  const hashedPassword = new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, function(err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hashedPassword;
};
module.exports = {
  encrypt,
  decrypt,
};
