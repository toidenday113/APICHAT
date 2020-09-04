//const BASE_URL = 'mongodb://localhost:27020/DataChat?replSet=rs1';
const BASE_URL = 'mongodb://localhost:27022/AppChat?replSet=rsapp';
const express = require('express');
const app = express();
app.use(express.static('public'));
const server = require('http').createServer(app);
const PORT = 3000;

/*=============*/
const Passport = require('passport');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

// Connection mongodb
mongoose.connect(
  BASE_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) throw err;
    console.log('Connection mongodb success');
  }
);

// Use

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

// Config
try {
  require('./Config/ConfigPassport')(Passport);
  require('./Routers/RouterUser')(app, Passport);
} catch (error) {
  console.log("Server log: error");
}


// run server
server.listen(PORT, function () {
  console.log('Server running - Port: ' + server.address().port);
});
