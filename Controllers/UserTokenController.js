const UserToken = require('../Models/UserToken');

module.exports.AddToken =function (req, res) {
      if (!req.body.idUser || !req.body.tokenNotify) {
        return res.status(400).end('no input');
      }

      UserToken.findOne(
        {
          idUser: req.body.idUser,
        },
        function (err, userToken) {
          if (!err) {
            if (userToken == null) {
              let mUserToken = new UserToken();
              mUserToken.idUser = req.body.idUser;
              mUserToken.tokenNotify = req.body.tokenNotify;
              mUserToken.save();
              res.json({ message: 'add token success' });
            } else {
              userToken.tokenNotify = req.body.tokenNotify;
              userToken.save();
              res.json({ message: 'update token success' });
            }
          }
        }
      );
    };
