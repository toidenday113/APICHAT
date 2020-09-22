const User = require('../Models/User');
const passport = require('passport');
const fs = require('fs');
const crypto = require('crypto');
const logger = require('../Utils/logger');
const email = require('../ConfigEmail/ConfigSendEmail');

module.exports = {};

function randomValueBase64(len) {
	return crypto
		.randomBytes(Math.ceil((len * 3) / 4))
		.toString('base64') // convert to base64 format
		.slice(0, len) // return required number of characters
		.replace(/\+/g, '0') // replace '+' with '0'
		.replace(/\//g, '0') // replace '/' with '0'
		.replace(/\[/g, '1')
		.replace(/\]/g, '1');
}

function createFileImage(req) {
	if (req.body.avatarOld) {
		fs.exists('public' + req.body.avatarOld, function (exists) {
			if (exists) {
				fs.unlink('public' + req.body.avatarOld, function (err) {});
			}
		});
	}

	var pathFile = '/images/' + randomValueBase64(12) + '.png';
	fs.writeFile('public' + pathFile, req.files.avatar.data, function (err) {
		if (err) {
			pathFile = '';
		}
	});
	return pathFile;
}
// User register
module.exports.create = function (req, res) {
	if (!req.body.username || !req.body.email || !req.body.password) {
		return res.status(400).end('invalid input');
	}

	User.findOne({ username: req.body.username }, function (err, user) {
		if (user) {
			return res.json({ message: 'user already exists' });
		} else {
			User.findOne({ email: req.body.email }, function (err, email) {
				if (email) {
					return res.json({ message: 'Email already exists' });
				} else {
					var pathFile = '/images/' + randomValueBase64(12) + '.png';
					fs.writeFile('public' + pathFile, req.files.avatar.data, function (
						err
					) {
						if (err) pathFile = '';
					});

					let nUser = new User();
					nUser.name = req.body.name;
					nUser.avatar = pathFile;
					nUser.email = req.body.email;
					nUser.username = req.body.username;
					nUser.password = nUser.generateHash(req.body.password);
					nUser.status = 'offline';
					nUser.mGroup = [];

					nUser.save(function (err) {
						if (err) {
							return res.status(400).json({ message: 'register not success' });
						}
					});

					//res.writeHead(200, { 'Content-Type': 'application/json' });
					nUser = nUser.toObject();
					delete nUser.password;
					//  res.end({ message: 'success', username: req.body.username });
					res.json({ message: 'success', username: req.body.username });
				}
			});
		}
	});
};

// User Login
module.exports.login = (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) {
			return res.next(err);
		}
		if (!user) {
			logger.info(`Login Fail: ${req.body.username}`);
			return res.json({ _id: '', SERVER_MESSAGE: 'Wrong Credentials' });
		}

		req.logIn(user, err => {
			if (err) {
				return res.next(err);
			} else {
				user = user.toObject();
				delete user.password;
				delete user.__v;
				delete user.friend;
				logger.info(`Login success: ${user.username}`);
				res.writeHead(200, { 'Content-Type': 'application/json' });
				return res.end(JSON.stringify(user));
			}
		});
	})(req, res, next);
	console.log('login: ' + JSON.stringify(req.body));
};

// Load profile
module.exports.me = (req, res) => {
	User.findOne({ username: req.user.username }, (err, user) => {
		if (user) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			user = user.toObject();
			delete user.password;
			delete user.__v;
			res.end(JSON.stringify(user));
		} else {
			return res.status(400).end('User not found');
		}
	});
};

// User Update
module.exports.update = (req, res) => {
	try {
		User.findById(req.user.id, (err, user) => {
			if (user) {
				if (user.username != req.user.username) {
					return res.status(400).end('Modifying other user');
				} else {
					user.name = req.body.name ? req.body.name : user.name;
					user.email = req.body.email ? req.body.email : user.email;
					user.avatar = req.files.avatar ? createFileImage(req) : user.avatar;
					user.status = req.body.status ? req.body.status : user.status;
					user.username = req.body.username ? req.body.username : user.username;
					user.password = req.body.password
						? user.generateHash(req.body.password)
						: user.password;

					user.save();
					logger.info(`Update profile success`);
					res.writeHead(200, { 'Content-Type': 'application/json' });
					user = user.toObject();
					delete user.password;
					res.end(JSON.stringify(user));
				}
			} else {
				return res.status(400).end('User not found');
			}
		});
	} catch (error) {
		logger.error(`Update profile ${error}`);
	}
};

// Delete user
module.exports.delete = (req, res) => {
	User.remove({ _id: req.user.id }, err => {
		res.end('Delete');
	});
};

module.exports.listUser = function (req, res) {
	User.find(
		{
			$or: [{ friend: [] }, { 'friend.status': 'request' }],
		},
		'_id name username email avatar status friend  mGroup',
		function (err, user) {
			if (user) {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				return res.end(JSON.stringify(user));
			}
		}
	);
};
// Update password;
module.exports.updatePassword = function (req, res) {
	try {
		User.findOne({ _id: req.user.id }, (err, user) => {
			if (user.validPassword(req.body.passwordOld)) {
				user.password = user.generateHash(req.body.passwordNew);
				user.save();
				res.json({ validate: 1, message: 'success' });
			} else {
				res.json({ validate: 0, message: 'Password not Right' });
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(user));
		});
	} catch (error) {
		logger.error(`TryCatch updatePassword file UsersController.js`);
	}
};

module.exports.validateEmail = function (req, res) {
	try {
		User.findOne({ email: req.body.Email }, (err, user) => {
			if (!user) {
				res.json({ validateEmail: 0 });
			} else {
				email.SendCode(req.body.Email, req.body.code);
				res.json({ validateEmail: 1 });
			}
		});
	} catch (error) {}
};

module.exports.resetPassword = function (req, res) {
	try {
		User.findOne({ email: req.body.email }, (err, user) => {
			if (user) {
				user.password = user.generateHash(req.body.passNew);
				user.save();
				res.json({ resetPass: 1, message: 'Password recovery is successful' });
			}
		});
	} catch (error) {
		logger.error(`resetPassword`);
	}
};

module.exports.updateName = function (req, res) {
	try {
		User.findById(req.user.id, (err, user) => {
			if (user) {
				user.name = req.body.name ? req.body.name : user.name;
				user.save();
				user = user.toObject();
				delete user.password;
				delete user.__v;
				res.end(JSON.stringify(user));
			}
		});
	} catch (error) {}
};
module.exports.updateStatus = function (req, res) {
	try {
		User.findById(req.user.id, (err, user) => {
			if (user) {
				user.status = req.body.status ? req.body.status : 'offline';
				user.save();
				user = user.toObject();
				delete user.password;
				delete user.__v;
				res.writeHead(200, { 'Content-Type': 'application/json' });
				return res.end(JSON.stringify(user));
			}
		});
	} catch (error) {}
};

module.exports.getReceiver = function (req, res) {
	User.findOne({ _id: req.body.idReceiver }, (err, user) => {
		if (user) {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			user = user.toObject();
			delete user.password;
			delete user.__v;
			res.end(JSON.stringify(user));
		} else {
			return res.status(400).end('User not found');
		}
	});
};
