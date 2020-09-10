

module.exports = function (app, passport, io) {

  app.post('/chat/listChat', isLoggedIn, ChatController.listChat);
  app.post('/chat/chatChar', isLoggedIn, ChatController.createChatChar);
  app.post('/chat/chatImage', isLoggedIn, ChatController.createChatImage);
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.end('Not logged in');
}
