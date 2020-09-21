//const BASE_URL = 'mongodb://localhost:27020/DataChat?replSet=rs1';
const BASE_URL = 'mongodb://localhost:27022/AppChat?replSet=rsapp';
//const BASE_URL ='mongodb+srv://khatran:69kHooRe8olluKZh@cluster0.kmopb.mongodb.net/DevChat';
const express = require('express');
const app = express();
app.use(express.static('public'));
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const PORT = process.env.PORT || 3000;

/*=============*/
const Passport = require('passport');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('session-memory-store')(session);
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const logger = require('./Utils/logger');
const admin = require('firebase-admin');
const serviceAccount = require('./Config/serviceAccountKey.json');

//Config Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://devchat-7209d.firebaseio.com',
});

// Connection mongodb
mongoose.connect(
  BASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) throw err;
    console.log('Connection mongodb success');
  }
);

/* App Use */
app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'dev',
    resave: true,
    saveUninitialized: true,
    store: new MemoryStore({ expires: 60 * 60 * 30 }), // 12 day
  })
);
app.use(Passport.initialize());
app.use(Passport.session());
app.use(flash());
app.use(fileupload());

console.clear();
/**END USE */

// Config Router
try {
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.end('Not logged in');
  }

  require('./Config/ConfigPassport')(Passport);
  require('./Routers/RouterUser')(app, Passport);

  /**  CHAT */
  const ChatController = require('./Controllers/ChatController')(admin, io);
  app.post('/chat/chatChar', isLoggedIn, ChatController.createChatChar);
  app.post('/chat/listChat', isLoggedIn, ChatController.listChat);
  app.post('/chat/chatImage', isLoggedIn, ChatController.createChatImage);
  /** END CHAT*/

  /**Check NotificationUser */
  const NotifyUserController = require('./Controllers/NotificationUserController')(
    io
  );
  app.post(
    '/notification/check',
    isLoggedIn,
    NotifyUserController.CheckNotification
  );
  app.post(
    '/notification/updateNotify',
    isLoggedIn,
    NotifyUserController.UpdateNotify
  );
  /** End NotificationUser */

  /** Group */
  const GroupController = require('./Controllers/GroupController')(io);
  app.post('/group/CreateGroup', isLoggedIn, GroupController.CreateGroup);
  app.post('/group/joinGroup', isLoggedIn, GroupController.JoinGroup);
  app.post('/group/list', isLoggedIn, GroupController.ListGroup);
  app.post(
    '/group/updateAvatar',
    isLoggedIn,
    GroupController.UpdateAvatarGroup
  );
  app.post('/group/updateName', isLoggedIn, GroupController.UpdateNameGroup);
  app.post('/group/deleteGroup', isLoggedIn, GroupController.DeleteOne);
  app.post('/group/outGroup', isLoggedIn, GroupController.OutGroup);
  app.post(
    '/group/listUseMember',
    isLoggedIn,
    GroupController.ListUserMemberGroup
  );
  /**End Group */

  /** MESSENGER GROUP */
  const MessengerGroup = require('./Controllers/MessengerGroupController')(io);
  app.post('/messengerGroup/list', isLoggedIn, MessengerGroup.ListMessenger);
  app.post('/messengerGroup/chatText', isLoggedIn, MessengerGroup.CreateText);
  app.post('/messengerGroup/chatImage', isLoggedIn, MessengerGroup.CreateImage);
  app.post('/messengerGroup/deleteAll', isLoggedIn, MessengerGroup.DeleteAll);
  app.post('/messengerGroup/deleteOne', isLoggedIn, MessengerGroup.DeleteOne);
  /** END  */

  /**Add Token Notification */
  const UserTokenController = require('./Controllers/UserTokenController');
  app.post('/notification/addToken', isLoggedIn, UserTokenController.AddToken);
  //logger.error("loi notification");
  /**End Add Token */

  /** Request Friend */
  const Friend = require('./Controllers/FriendController')(io, admin);
  app.post('/friend/requestFriend', isLoggedIn, Friend.requestFriend);
  app.post('/friend/applyFriend', isLoggedIn, Friend.ApplyFriend);
  app.get('/friend/listRequestFriend', isLoggedIn, Friend.ListRequestFriend);
  app.post('/friend/listFriend', isLoggedIn, Friend.ListFriend);
  /** End Request Friend */

  /** LAST MESSENGER */
  const LastMessenger = require('./Controllers/LastMessengerController.js');
  app.post(
    '/lastChat/listMessenger',
    isLoggedIn,
    LastMessenger.ListLastMessenger
  );
  /** END LAST MESSENGER */

  // Socket IO
  io.on('connection', socket => {
    let users = [];

    console.log(`user connection: ${socket.id}`);
    socket.on('user_connect', username => {
      users[username] = socket.id;
      console.log(users);
    });
  });
} catch (error) {
  logger.error(`TryCatch file server.js: ${error}`);
}

// run server
server.listen(PORT, function () {
  console.log('Server running - Port: ' + server.address().port);
});
