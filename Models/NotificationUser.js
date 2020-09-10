const mongoose = require('mongoose');

const NotificationUserSchema = new mongoose.Schema({
	sender: String,
	receiver: String,
	chatActive: Number,
});

module.exports = mongoose.model('NotificationUser', NotificationUserSchema);