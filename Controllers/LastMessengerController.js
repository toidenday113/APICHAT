const User = require('../Models/User');
const Group = require('../Models/Group');
const LastMessenger = require('../Models/LastMessenger');
const logger = require('../Utils/logger');

module.exports = {};

module.exports.CreateLastMessenger = function (
	sender,
	receiver,
	content,
	status
) {
	LastMessenger.findOne(
		{
			$or: [
				{ idSender: sender, idReceiver: receiver },
				{ idSender: receiver, idReceiver: sender },
			],
		},
		function (err, result) {
			if (err) {
				logger.error(`Error Last messenger ${err}`);
				return res.status(400).end('Error Last messenger');
			}
			if (!result) {
				let mLastMessenger = new LastMessenger();
				mLastMessenger.idSender = sender;
				mLastMessenger.idReceiver = receiver;
				mLastMessenger.lastMessenger = content;
				mLastMessenger.status = status;
				mLastMessenger.save();
			} else {
				result.lastMessenger = content;
				result.save();
			}
		}
	);
};

module.exports.ListLastMessenger = function (req, res) {
	LastMessenger.find(
		{
			$or: [{ idSender: req.body.idUser }, { idReceiver: req.body.idUser }],
		},
		function (err, result) {
			if (err || !result) {
				loggers.error(`Error list last messenger: ${err}`);
				return res.status(400).end('Error list last messenger');
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			return res.end(JSON.stringify(result));
		}
	);
};
module.exports.DeleteOne = function (req, res) {
	LastMessenger.deleteOne(
		{
			$or: [
				{ idSender: req.body.sender, idReceiver: req.body.receiver },
				{ idSender: req.body.receiver, idReceiver: req.body.sender },
			],
		},
		function (err) {
			if (err) {
				loggers.error(`Error delete last messenger: ${err}`);
				return res.status(400).end('Error delete last messenger');
			}
		}
	);
	return res.status(200).json({ message: 'ok' });
};

module.exports.DeleteMessengerUser = function (sender, receiver) {
	LastMessenger.deleteOne(
		{
			$or: [
				{ idSender: sender, idReceiver: receiver },
				{ idSender: receiver, idReceiver: sender },
			],
		},
		function (err) {
			if (err) {
				loggers.error(`Error delete last messenger: ${err}`);
				return res.status(400).end('Error delete last messenger');
			}
		}
	);
};
