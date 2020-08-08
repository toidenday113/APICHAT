const BASE_URL = 'mongodb://localhost:27020/DataChat?replSet=rs1';
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const PORT = 3000 || process.env.port;

/*=============*/
const Passport = require('passport');
const mongoose = require('mongoose');
const BodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');

// Connection mongodb
mongoose.connect(
	BASE_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	err => {
		if (err) throw err;
		console.log('Connection mongodb success');
	}
);

// Use
app.use(cookieParser());
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
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

console.clear();
// Config
require('./Config/ConfigPassport')(Passport);
require('./Routers/RouterUser')(app, Passport);

// run server
server.listen(PORT, () => {
	console.log('Server running - Port: ' + server.address().port);
});
