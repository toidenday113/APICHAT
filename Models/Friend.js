const mongoose = require('mongoose');

const FriendSchema = new mongoose.Schema({
    sender:String,
    receiver: String,
    status: String,
});

module.exports = mongoose.model('Friend', FriendSchema);