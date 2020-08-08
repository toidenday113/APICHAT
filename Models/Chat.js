const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
	sender: String,
	receiver: String,
	content: String,
	image: String,
});

module.exports = mongoose.model('Chat', ChatSchema);
