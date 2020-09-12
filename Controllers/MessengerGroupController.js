const MessengerGroup = require('../Models/MessengerGroup');
const logger = require('../Utils/logger');
const randomValueName = require('../Utils/randomValueName');
const fs = require('fs');
module.exports = function () {
  return {
    //Create messenger text
    CreateText: function (req, res) {
      if (!req.body.idGroup || !req.body.sender || !req.body.content) {
        return res.status(400).end('invalid input');
      }
      let messenger = new MessengerGroup();
      messenger.idGroup = req.body.idGroup;
      messenger.sender = req.body.sender;
      messenger.content = req.body.content;
      messenger.image = '';
      messenger.save(function (err) {
        if (err) {
          return res.status(400).end('Save messenger error');
          logger.error(`Error save messenger group: ${err}`);
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(messenger));
    },
    // Create messenger Image
    CreateImage: function (req, res) {
      if (!req.body.idGroup || !req.body.sender || !req.body.content) {
        return res.status(400).end('invalid input');
      }

      let pathFile = '/images/groups/' + randomValueName.Create(10) + '.png';
      fs.writeFile('public' + pathFile, req.body.files.image.data, function (
        err
      ) {
        if (err) {
          pathFile = '';
        }
      });

      let messenger = new MessengerGroup();
      messenger.idGroup = req.body.idGroup;
      messenger.sender = req.body.sender;
      messenger.content = '';
      messenger.image = pathFile;
      messenger.save(function (err) {
        if (err) {
          return res.status(400).end('Save messenger error');
          logger.error(`Error save messenger group: ${err}`);
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(messenger));
    },
    // List messenger for one group
    ListMessenger: function (req, res) {},
    // Delete all messenger of one group
    DeleteAll: function (req, res) {},
    //Delete one messenger of one Group
    DeleteOne: function (req, res) {},
  };
};
