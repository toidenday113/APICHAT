const NotificationUser = require('../Models/NotificationUser');

module.exports = function (io) {
  return {
    CheckNotification: function (req, res) {
      if (!req.body.sender || !req.body.receiver) {
        return res.status(400).end('invalid input');
      }

      NotificationUser.findOne(
        {
          $or: [
            { sender: req.body.sender, receiver: req.body.receiver },
            { sender: req.body.receiver, receiver: req.body.sender },
          ],
        },
        function (err, result) {
          if (err) {
            console.log('error');
            return res.status(400).end('error');
          }
          if (result === null) {
            let mNotificationUser = new NotificationUser();
            mNotificationUser.sender = req.body.sender;
            mNotificationUser.receiver = req.body.receiver;
            mNotificationUser.chatActive = 1;
            mNotificationUser.save(function (err) {
              if (err) {
                return res.status(400).end('error');
              } else {
                return res.end(JSON.stringify(mNotificationUser));
              }
            });
          } else {
            return res.end(JSON.stringify(result));
          }
        }
      );
    }, //End CheckNotification

    UpdateNotify: function (req, res) {
      if (!req.body.sender || !req.body.receiver || !req.body.chatActive) {
        return res.status(400).end('invalid input');
      }

      NotificationUser.findOne(
        {
          $or: [
            { sender: req.body.sender, receiver: req.body.receiver },
            { sender: req.body.receiver, receiver: req.body.sender },
          ],
        },
        function (err, result) {
            if(result.chatActive === 2){
                result.chatActive = (result.chatActive - 1);
            }

            if(result.chatActive === 1 && parseInt(req.body.chatActive,10) ===0){
              result.chatActive = (result.chatActive - 1);
            }

            if(result.chatActive ===1 || result.chatActive===0){
                result.chatActive = (parseInt(result.chatActive,10) + parseInt(req.body.chatActive,10));
            }
          result.save();
          res.end(JSON.stringify(result));
        }
      );
    },
  };
};