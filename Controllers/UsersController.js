const User = require('../Models/User');
const passport = require('passport');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {};

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
// User register
module.exports.create = function (req, res) {
  if (!req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).end('invalid input');
  }

  User.findOne({ username: req.body.username }, function (err, user) {
    if (user) {
      return res.json({ message: 'user already exists' });
    } else {
      User.findOne({ email: req.body.email }, function (err, email) {
        if (email) {
          return res.json({ message: 'Email already exists' });
        } else {
          var pathFile = "/images/"+ randomValueBase64(12)+".png";
          fs.writeFile("public"+pathFile, req.files.avatar.data, function(err){
              if(err) pathFile ="";
          });

          let nUser = new User();
          nUser.name = req.body.name;
          nUser.avatar = pathFile;
          nUser.email = req.body.email;
          nUser.username = req.body.username;
          nUser.password = nUser.generateHash(req.body.password);
          nUser.status = 'offline';
          nUser.mGroup = [];

          nUser.save(function (err) {
            if (err) {
              return res.status(400).json({ message: 'register not success' });
            }
          });

          //res.writeHead(200, { 'Content-Type': 'application/json' });
          nUser = nUser.toObject();
          delete nUser.password;
          //  res.end({ message: 'success', username: req.body.username });
          res.json({ message: 'success', username: req.body.username });
        }
      });
    }
  });
};

// User Login
module.exports.login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.next(err);
    }
    if (!user) {
      return res
        .json({_id: "", SERVER_MESSAGE: 'Wrong Credentials' });
    }

    req.logIn(user, err => {
      if (err) {
        return res.next(err);
      } else {
        user = user.toObject();
        delete user.password;
        delete user.__v;
        
        console.log(user);
        return res.end(JSON.stringify(user));
      }
      
    });
  })(req, res, next);
  console.log('login: ' + JSON.stringify(req.body));
};

// Load profile
module.exports.me = (req, res) => {
  User.findOne({ username: req.user.username }, (err, user) => {
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      user = user.toObject();
      delete user.password;
      delete user.__v;
      res.end(JSON.stringify(user));
    } else {
      return res.status(400).end('User not found');
    }
  });
};

// User Update
module.exports.update = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    if (user) {
      if (user.username != req.user.username) {
        return res.status(400).end('Modifying other user');
      } else {
        user.name = req.body.name ? req.body.name : user.name;
        user.email = req.body.email ? req.body.email : user.email;
        user.avatar = req.body.avatar ? req.body.avatar : user.avatar;
        user.status = req.body.status ? req.body.status : user.status;
        user.username = req.body.username ? req.body.username : user.username;
        user.password = req.body.password
          ? user.generateHash(req.body.password)
          : user.password;

        user.save();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        user = user.toObject();
        delete user.password;
        res.end(JSON.stringify(user));
      }
    } else {
      return res.status(400).end('User not found');
    }
  });
};

// Delete user
module.exports.delete = (req, res) => {
  User.remove({ _id: req.user.id }, err => {
    res.end('Delete');
  });
};

module.exports.listUser = function (req, res) {
  User.find({}, '_id name username email avatar status', function (err, user) {
    if (user) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(user));
    }
  });
};
