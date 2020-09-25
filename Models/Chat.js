const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
	sender: String,
	receiver: String,
	content: String,
	image: String,
	updatedAt: { type: Date, default: Date.now },
	createAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Chat', ChatSchema);
