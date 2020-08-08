const User = require('../Models/User');
const passport = require('passport');

module.exports = {};

// User register
module.exports.create = (req, res) => {
	if (!req.body.username || !req.body.email || !req.body.password) {
		return res.status(400).end('invalid input');
	}
	//var checkInsert = true;
	User.findOne({ username: req.body.username }, (err, user) => {
		if (user) {
			//checkInsert = false;
			return res.status(400).end('user already exists');
		} else {
			User.findOne({ email: req.body.email }, (err, user) => {
				if (user) {
					return res.status(400).end('Email already exists');
				} else {
					let newUser = new User();
					newUser.name = req.body.name;
					newUser.avatar = req.body.avatar;
					newUser.email = req.body.email;
					newUser.username = req.body.username;
					newUser.status = 'offline';
					newUser.password = newUser.generateHash(req.body.password);
					newUser.mGroup = [];

					newUser.save(err => {
						if (err) {
							return res.status(400).end({ message: 'register not success' });
						}
					});

					res.writeHead(200, { 'Content-Type': 'application/json' });
					newUser = newUser.toObject();
					delete newUser.password;
					res.end(JSON.stringify(newUser));
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
			return res
				.status(400)
				.json({ SERVER_RESPONSE: 0, SERVER_MESSAGE: 'Wrong Credentials' });
		}

		req.logIn(user, err => {
			if (err) {
				return res.next(err);
			} else {
				return res.json({
					SERVER_RESPONSE: 1,
					SERVER_MESSAGE: 'Login success',
				});
				console.log("thanhf cong");
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
	User.findById(req.user.id, (err, user) => {
		if (user) {
			if (user.username != req.user.username) {
				return res.status(400).end('Modifying other user');
			} else {
				user.name = req.body.name ? req.body.name : user.name;
				user.email = req.body.email ? req.body.email : user.email;
				user.avatar = req.body.avatar ? req.body.avatar : user.avatar;
				user.status = req.body.status ? req.body.status : user.status;
				user.username = req.body.username ? req.body.username : user.username;
				user.password = req.body.password
					? user.generateHash(req.body.password)
					: user.password;

				user.save();

				res.writeHead(200, { 'Content-Type': 'application/json' });
				user = user.toObject();
				delete user.password;
				res.end(JSON.stringify(user));
			}
		} else {
			return res.status(400).end('User not found');
		}
	});
};

// Delete user
module.exports.delete = (req, res) => {
	User.remove({ _id: req.user.id }, err => {
		res.end('Delete');
	});
};
