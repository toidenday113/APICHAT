const mongoose = require('mongoose');

const LastMessengerSchema = new mongoose.Schema({
  idSender: String,
  idReceiver: String,
  lastMessenger: String,
  status: String,
});

module.exports = mongoose.model('LastMessenger', LastMessengerSchema);
