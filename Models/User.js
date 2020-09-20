const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const md5 = require('md5');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: String,
	username: String,
	password: String,
	email: String,
	avatar: String,
	status: String,
	mGroup: [{ idGroup: String }],
	friend: [
		{
			idUser: String,
			status: String,
		},
	],
});

UserSchema.methods.generateHash = function (password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
UserSchema.methods.validPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};
module.exports = mongoose.model('User', UserSchema);
