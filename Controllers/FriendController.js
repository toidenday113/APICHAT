const User = require('../Models/User');
const UserToken = require('../Models/UserToken');
const logger = require('../Utils/logger');

module.exports = function (io, admin) {
  return {
    // Kết bạn
    requestFriend: function (req, res) {
      if (!req.body.sender || !req.body.receiver) {
        return res.status(400).end('invalid input');
      }
      User.findOne(
        {
          _id: req.body.sender,
        },
        function (err, userSender) {
          if (err) {
            return res.status(400).end('not found user');
          }
          if (userSender) {
            userSender.friend.push({
              idUser: req.body.receiver,
              status: 'request',
            });
            userSender.save();
          }
          User.findOne(
            {
              _id: req.body.receiver,
            },
            function (err, userReceiver) {
              if (err) {
                return res.status(400).end('not found user');
              }
              if (userReceiver) {
                userReceiver.friend.push({
                  idUser: req.body.sender,
                  status: 'request',
                });
                userReceiver.save();
              }
            }
          ); // End User receiver
          sendNotifyRequestFriend(admin, req.body.receiver);
          return res.json({ message: 'ok' });
        }
      );
    },
    ApplyFriend: function (req, res) {
      if (!req.body.sender || !req.body.receiver) {
        return res.status(400).end('invalid input');
      }
      User.updateOne(
        {
          _id: req.body.sender,
        },{
          "$set":{
            "friend.$.status": "ok"
          }
        },function (err){
          if(err){
            logger.error(`error update friend ${err}`);
            return res.status(400).end('error update friend');
          }
        }
      );
      User.updateOne(
        {
          _id: req.body.receiver,
        },{
          "$set":{
            "friend.$.status": "ok"
          }
        },function (err){
          if(err){
            logger.error(`error update friend ${err}`);
            return res.status(400).end('error update friend');
          }
        }
      );
    },
    // List friend
    ListRequestFriend: function (req, res) {
      User.find({
        $or:[
          {friend:[]},
          {"friend.status": "request"}
        ]
       
      },
        function (err, result) {
          if (err) {
            logger.error(`error list user friend ${err}`);
            return res.status(400).end('error list user friend');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(result));
        });

    },
  };
};
function sendNotifyRequestFriend(admin, receiver) {
  UserToken.findOne(
    {
      idUser: receiver,
    },
    function (err, result) {
      if (err) {
        logger.error(`error get token: ${err}`);
        return res.status(400).end('error get token');
      }
      if (result) {
        const message = {
          data: {
            requestFriend: 'ok',
          },
          token: result.tokenNotify,
        };
        admin
          .messaging()
          .send(message)
          .then(response => {
            logger.info(`send notification successful`);
          })
          .catch(error => {
            logger.error(`send notification error`);
          });
      }
    }
  );
}
