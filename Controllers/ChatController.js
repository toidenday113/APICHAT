const Chat = require('../Models/Chat');
const NotifyUser = require('../Models/NotificationUser');
const UserToken = require('../Models/UserToken');
const fs = require('fs');
const crypto = require('crypto');
const LastMessenger = require('../Controllers/LastMessengerController');
const logger = require('../Utils/logger');

module.exports = function (admin, io) {
  return {
    // Create Messenger String
    createChatChar: function (req, res) {
      if (!req.body.sender || !req.body.receiver || !req.body.content) {
        return res.status(400).end('invalid input');
      }

      let mChat = new Chat();
      mChat.sender = req.body.sender;
      mChat.receiver = req.body.receiver;
      mChat.content = req.body.content;
      mChat.image = '';

      mChat.save(function (err) {
        if (err) {
          console.log('loi');
          return res.json({ message: 'Send not success' });
        } else {
          console.log(JSON.stringify(mChat));
        }
      });

	  io.emit('newMessenger', JSON.stringify(mChat));
      SendNotification(req, res, mChat, admin);
      LastMessenger.CreateLastMessenger(
        mChat.sender,
        mChat.receiver,
        mChat.content,
        'user'
      );
      return res.end(JSON.stringify(mChat));
    },

    // Create messenger image
    createChatImage: function (req, res) {
      if (!req.body.sender || !req.body.receiver || !req.files.image) {
        console.log('loix');
        return res.status(400).end('invalid input');
      }

      let pathFile = '/images/users/' + randomValueBase64(10) + '.png';
      fs.writeFile('public' + pathFile, req.files.image.data, function (err) {
        if (err) {
          pathFile = '';
        }
      });

      let mChat = new Chat();
      mChat.sender = req.body.sender;
      mChat.receiver = req.body.receiver;
      mChat.content = '';
      mChat.image = pathFile;

      mChat.save(function (err) {
        if (err) {
          return res.json({ message: 'Send not success' });
        }
      });
	  io.emit('newMessenger', JSON.stringify(mChat));
      SendNotification(req, res, mChat, admin);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(mChat));
    },

    // List messenger of user
    listChat: function (req, res) {
      try {
        let perPage = 20,
          page =
            parseInt(req.body.page, 10) > 0
              ? parseInt(req.body.page, 10) * perPage
              : 0;
        Chat.find(
          {
            $or: [
              { sender: req.body.sender, receiver: req.body.receiver },
              { sender: req.body.receiver, receiver: req.body.sender },
            ],
          },
          {},
          { skip: page, limit: perPage, sort: { _id: -1 } },
          function (err, chat) {
            if (err) {
              logger.error(`Error list messenger ${err}`);
              return res.status(400).end('Error messenger ');
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(chat));
          }
        );
      } catch (error) {}
    },

    // Delete All messenger
    DeleteAll: function (req, res) {
      Chat.deleteMany(
        {
          $or: [
            { sender: req.body.sender, receiver: req.body.receiver },
            { sender: req.body.receiver, receiver: req.body.sender },
          ],
        },
        function (err) {
          if (err) {
            logger.error(`Delete messenger error: ${err}`);
            return res.status(400).end('delete messenger error');
          }
        }
      );

      io.emit('refresh_delete', 'ok');
      return res.status(200).json({ message: 'ok' });
    },
    DeleteOne: function (req, res) {
      Chat.deleteOne(
        {
          _id: req.body.id,
        },
        function (err) {
          if (err) {
            logger.error(`delete one error: ${err}`);
            return res.status(400).end('delete one error');
          }
        }
      );

      io.emit('refresh_delete', 'ok');
      return res.status(200).json({ message: 'ok' });
    },
  };
};

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

function SendNotification(req, res, content, admin) {
  let mContent = content.toObject();
  NotifyUser.findOne(
    {
      $or: [
        { sender: req.body.sender, receiver: req.body.receiver },
        { sender: req.body.receiver, receiver: req.body.sender },
      ],
    },
    function (err, result) {
      if (!err || !result) {
        if (result.chatActive == 1) {
          UserToken.findOne(
            {
              idUser: mContent.receiver,
            },
            function (err, result) {
              const message = {
                data: {
                  idUser: mContent.sender,
                },
                token: result.tokenNotify,
              };
              admin
                .messaging()
                .send(message)
                .then(response => {
                  console.log('send notify messenger success');
                })
                .catch(error => {
                  console.log('send notify loi');
                });
            }
          );
        }
      }
    }
  );
}
