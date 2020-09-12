//const BASE_URL = 'mongodb://localhost:27020/DataChat?replSet=rs1';
const BASE_URL = 'mongodb://localhost:27022/AppChat?replSet=rsapp';
const express = require('express');
const app = express();
app.use(express.static('public'));
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const PORT = 3000;

/*=============*/
const Passport = require('passport');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const logger = require('./Utils/logger');
const admin = require("firebase-admin");
const serviceAccount = require("./Config/serviceAccountKey.json");

//Config Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://devchat-7209d.firebaseio.com"
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
  const ChatController = require('./Controllers/ChatController')(admin,io);
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
const GroupController = require("./Controllers/GroupController")(io);
app.post("/group/CreateGroup", isLoggedIn, GroupController.CreateGroup);
app.post("/group/joinGroup", isLoggedIn, GroupController.JoinGroup);
app.post("/group/list", isLoggedIn, GroupController.ListGroup);
/**End Group */



/**Add Token Notification */
const UserTokenController = require("./Controllers/UserTokenController");
app.post("/notification/addToken", isLoggedIn, UserTokenController.AddToken);
//logger.error("loi notification");
/**End Add Token */

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
