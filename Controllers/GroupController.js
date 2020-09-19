const Group = require('../Models/Group');
const User = require('../Models/User');
const crypto = require('crypto');
const fs = require('fs');
const logger = require('../Utils/logger');
module.exports = function (io) {
  return {
    // Create Group
    CreateGroup: function (req, res) {
      if (!req.body.admin || !req.body.name) {
        return res.status(400).end('Can not Create');
      }

      var pathFile = '/images/groups/' + randomValueBase64(11) + '.png';
      fs.writeFile('public' + pathFile, req.files.avatar.data, function (err) {
        if (err) {
          pathFile = '';
          logger.error('Create file Avatar group Error');
        }
      });

      let mGroup = new Group();
      mGroup.name = req.body.name;
      mGroup.avatar = pathFile;
      mGroup.admin = req.body.admin;
      var s = req.body.mUser.replace(/\[/g, '');
      s = s.replace(/\]/g, '');
      s = s.replace(/ /g, '');
      s = s.split(',');
      //console.log(Array.from(s));
      s.forEach(user => {
        mGroup.mUser.push({ idUser: user });
      });
      mGroup.save();
      MemberGroup(s, mGroup._id);
      io.emit('newGroup', JSON.stringify(mGroup));
      return res.end(JSON.stringify(mGroup));
    },
    // Join User Group
    JoinGroup: function (req, res) {
      if (!req.body.idGroup || !req.body.user) {
        return res.status(400).end('invalid input');
      }
      Group.findOne(
        {
          _id: req.body.idGroup,
        },
        function (err, group) {
          if (err || !group) {
            logger.error(`Error query one group`);
            return res.status(400).end('error query group');
          }
          if (group) {
            req.body.user.forEach(element => {
              group.mUser.push({ idUser: element });
              User.findOne(
                {
                  _id: element,
                },
                function (err, u) {
                  if (!err || u) {
                    u.mGroup.push({ idGroup: req.body.idGroup });
                    u.save();
                  }
                }
              );
            });
            group.save(function (err) {
              if (err) {
                logger.error(`Error save user join group: ${err}`);
              }
            });
          }
          return res.json({ message: 'ok' });
        }
      );
    },
    // List Group
    ListGroup: function (req, res) {
      if (!req.body.idUser) {
        return res.status(404).end('Not input');
      }
      Group.find(
        {
          'mUser.idUser': req.body.idUser,
        },
        function (err, group) {
          if (err) {
            return res.status(404).end('Not group');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(group));
        }
      );
    },
    // Update Avatar group
    UpdateAvatarGroup: function (req, res) {
      if (!req.body.idGroup) {
        return res.status(400).end('invalid input');
      }
      Group.findOne(
        {
          _id: req.body.idGroup,
        },
        function (err, group) {
          if (err) {
            logger.error(`error find info group`);
            return res.status(400).end('error find info group');
          }
          try {
            if (fs.existsSync('public' + group.avatar)) {
              fs.unlink('public' + group.avatar);
            }
          } catch (e) {
            logger.error(`Error check file avatar group: ${e}`);
          }
          let pathFile = '/images/groups/' + randomValueBase64(11) + '.png';
          fs.writeFile('public' + pathFile, req.files.avatar.data, function (
            err
          ) {
            if (err) {
              pathFile = '';
              logger.error(`Error write file avatar group: ${err}`);
            }
          });
          group.avatar = pathFile;
          group.save(function (err) {
            if (err) {
              logger.error(`Error save info avatar group: ${err}`);
              return res.status(400).end('error info avatar group');
            }
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(group));
        }
      );
    },
    // Update information group
    UpdateNameGroup: function (req, res) {
      if (!req.body.idGroup || !req.body.name) {
        return res.status(400).end('invalid input');
      }
      Group.findOne(
        {
          _id: req.body.idGroup,
        },
        function (err, group) {
          if (err || !group) {
            logger.error(`error find info group: ${err}`);
            return res.status(400).end('error edit name group');
          }
          if (group) {
            group.name = req.body.name;
            group.save();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(group));
          }
        }
      );
    },
    // Delete Group
    DeleteOne: function (req, res) {
      if (!req.body.idGroup || !req.body.admin) {
        return res.status(400).end('invalid input');
      }
      Group.DeleteOne(
        {
          _id: req.body.idGroup,
          admin: req.body.admin,
        },
        function (err) {
          if (err) {
            logger.error(`Error delete  group: ${err}`);
            return res.status(400).end('error');
          }
        }
      );
      return res.status(200).json({ message: 'ok' });
    },
    // User Out group
    OutGroup: function (req, res) {
      if (!req.body.idGroup || !req.body.idUser) {
        return res.status(400).end('invalid input');
      }
      Group.updateOne(
        {
          _id: req.body.idGroup,
          'mUser.idUser': req.body.idUser,
        },
        { $pull: { mUser: { idUser: req.body.idUser } } },
        function (err, group) {
          if (err) {
            logger.error(`error out group: ${err}`);
            return res.status(400).end('error out group');
          }
          if (!group) {
            return res.status(400).end('Not found Info group');
          }
          if (group) {
            return res.status(200).json({ message: 'ok' });
          }
        }
      );
    },
    // List User member groups
    ListUserMemberGroup: function (req, res) {
      if (!req.body.idGroup) {
        return res.status(400).end('invalid input');
      }
      User.find(
        {
          'mGroup.idGroup': req.body.idGroup,
        },
        function (err, user) {
          if (err) {
            logger.error(`Error list user member group: ${err}`);
            return res.status(400).end('error list user member group');
          }
          if (!user) {
            return res.status(400).end('not found user');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(user));
        }
      );
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

function MemberGroup(arrUser, idGroup) {
  arrUser.forEach(u => {
    User.findOne({ _id: u }, function (err, user) {
      if (err) {
        logger.error('Error add user Join Group');
        return;
      }
      user.mGroup.push({ idGroup: idGroup });
      user.save();
    });
  });
}
