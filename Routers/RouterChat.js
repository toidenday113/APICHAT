const ChatController = require('../Controllers/ChatController');

module.exports = function (app, passport) {
    
	app.post('/chat/listChat', isLoggedIn, ChatController.listChat);
	app.post('/chat/chatChar', isLoggedIn, ChatController.createChatChar);
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.end('Not logged in');
}
