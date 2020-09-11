const Friend = require('../Models/Friend');
const logger = require('../Utils/logger');

module.exports = function () {
  return {
    // Request add friend
    AddFriend: function (req, res) {
      if (!req.body.sender || !req.body.receiver || !req.body.status) {
        logger.error('Request Friend Error input');
        return res.status(400).end('invalid input');
      }

      let mFriend = new Friend();
      mFriend.sender = req.body.sender;
      mFriend.receiver = req.body.receiver;
      mFriend.status = req.body.status;

      mFriend.save(function (err) {
        if (err) {
          logger.error('Request Friend Error');
          return res.status(400).end('Save error!');
        }
      });
      return res.end(JSON.stringify(mFriend));
    },

    // List Friend
    ListFriend: function (req, res) {
      if (!req.body.sender || !req.body.receiver) {
        logger.error('List Friend Error input');
        return res.status(400).end('invalid input');
      }
      Friend.find(
        {
          sender: req.body.sender,
          status: req.body.status,
        },
        function (err, friend) {
          if (err) {
            logger.error('list friend Error');
            return res.status(400).end('not list friend');
          }
          return res.end(JSON.stringify(friend));
        }
      );
    },

    CancelFriend: function (req, res) {
      Friend.deleteOne(
        {
          $or: [
            { sender: req.body.sender, receiver: req.body.receiver },
            { sender: req.body.receiver, receiver: req.body.sender },
          ],
        },
        function (err, resultDelete) {
          if (err) {
            return res.status(400).end('Not friend');
          }
          if (resultDelete == 1) {
            return res.json({ message: 'ok' });
          }
        }
      );
    },

    //
    AcceptFriend: function (req, res) {
      Friend.findOne(
        {
          $or: [
            { sender: req.body.sender, receiver: req.body.receiver },
            { sender: req.body.receiver, receiver: req.body.sender },
          ],
        },
        function (err, friend) {
            
        }
      );
    },
  };
};
