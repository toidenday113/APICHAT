const MessengerGroup = require('../Models/MessengerGroup');
const logger = require('../Utils/logger');
const randomValueName = require('../Utils/randomValueName');
const fs = require('fs');
module.exports = function (io) {
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
          logger.error(`Error save messenger group: ${err}`);
          return res.status(400).end('Save messenger error');
        }
      });
      io.emit('newMessengerGroup', JSON.stringify(messenger));
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
          logger.error(`Error save messenger group: ${err}`);
          return res.status(400).end('Save messenger error');
        }
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(messenger));
    },
    // List messenger for one group
    ListMessenger: function (req, res) {
      if (!req.body.idGroup) {
        return res.status(400).end('invalid input');
      }
      MessengerGroup.find(
        {
          idGroup: req.body.idGroup,
        },
        function (err, result) {
          if (err) {
            logger.error(`Error messenger: ${err}`);
            return res.status(400).end('error query messenger');
          }
          return res.status(200).end(JSON.stringify(result));
        }
      );
    },
    // Delete all messenger of one group
    DeleteAll: function (req, res) {
      if (!req.body.id) {
        return res.status(400).end('invalid input');
      }
      MessengerGroup.deleteMany(
        {
          idGroup: req.body.idGroup,
        },
        function (err) {
          if (err) {
            logger.error(`Error delete messenger: ${err}`);
            return res.status(400).end('error #400');
          }
        }
      );
      return res.status(200).json({ message: 'ok' });
    },
    //Delete one messenger of one Group
    DeleteOne: function (req, res) {
      if (!req.body.id) {
        return res.status(400).end('invalid input');
      }
      MessengerGroup.deleteOne(
        {
          _id: req.body.id,
        },
        function (err) {
          if (err) {
            logger.error(`Error delete one messenger: ${err}`);
            return res.status(400).end('error delete messenger');
          }
        }
      );
      return res.status(200).json({ message: 'ok' });
    },
  };
};
