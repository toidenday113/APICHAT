const Group = require('../Models/Group');
const crypto = require('crypto');
const fs = require('fs');
module.exports = function () {
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
			console.log(Array.from(s));
			s.forEach(user => {
				mGroup.mUser.push({ idUser: user });
			});
            mGroup.save();
            return res.end(JSON.stringify(mGroup));
		},
		// Join User Group
		JoinGroup: function (req, res) {
			req.body.user.forEach(element => {
				console.log(element);
			});
			return res.end('sdfsdf');
		},
		//List Group
		ListGroup: function (req, res) {
            if(!req.body.idUser){
               return res.status(404).end("Not input");
            }
			Group.find(
                {
                    "mUser.idUser": req.body.idUser
                }, 
                function (err, group) {
                    if(err){
                        return res.status(404).end("Not group");
                    }
                    return res.end(JSON.stringify(group));
                });
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
