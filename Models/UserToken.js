const mongoose = require('mongoose');

const UserTokenSchema = new mongoose.Schema({
  idUser: String,
  tokenNotify: String,
});

module.exports = mongoose.model('UserToken', UserTokenSchema);
