const mongoose = require('mongoose');

const MessengerGroupSchema = new mongoose.Schema({
  idGroup: String,
  sender: String,
  content: String,
  image: String,
});
module.exports = mongoose.model('MessengerGroup', MessengerGroupSchema);
