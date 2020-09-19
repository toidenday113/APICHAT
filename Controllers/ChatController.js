const Chat = require('../Models/Chat');
const NotifyUser = require('../Models/NotificationUser');
const UserToken = require('../Models/UserToken');
const fs = require('fs');
const crypto = require('crypto');
const LastMessenger = require('../Controllers/LastMessengerController');

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

      SendNotification(req, res, mChat, admin);
      io.emit('newMessenger', JSON.stringify(mChat));
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
      SendNotification(req, res, mChat, admin);
      io.emit('newMessenger', JSON.stringify(mChat));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(mChat));
    },

    // List messenger of user
    listChat: function (req, res) {
      try {
        let perPage = null,
          page = req.body.page > 0 ? req.body.page : 0;
        Chat.find(
          {
            $or: [
              { sender: req.body.sender, receiver: req.body.receiver },
              { sender: req.body.receiver, receiver: req.body.sender },
            ],
          },
          {},
          { skip: page, limit: perPage },
          function (err, chat) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(chat));
          }
        );
      } catch (error) {}
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
      if (!err) {
        if (result.chatActive == 1) {
          UserToken.findOne(
            {
              idUser: mContent.receiver,
            },
            function (err, result) {
              const message = {
                notification: {
                  title: 'Dev',
                  body: mContent.receiver,
                },
                token: result.tokenNotify,
              };
              admin
                .messaging()
                .send(message)
                .then(response => {
                  console.log('send notify success');
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
