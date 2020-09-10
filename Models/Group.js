const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    name:String,
    avatar: String,
    admin: String,
    mUser:[{idUser: String}]
});

module.exports = mongoose.model('Group', GroupSchema);