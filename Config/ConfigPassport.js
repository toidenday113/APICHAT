var LocalStrategy = require('passport-local').Strategy;
var User = require('../Models/User');

module.exports = function (passport) {
	
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	passport.use(
		new LocalStrategy(function (username, password, done) {
			const UsernameOrEmail = (username.includes("@")) ? {email:username}: {username:username};
			User.findOne(UsernameOrEmail, function (err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, { message: 'Incorrect username.' });
				}
				if (!user.validPassword(password)) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, user);
			});
		})
	);
};
