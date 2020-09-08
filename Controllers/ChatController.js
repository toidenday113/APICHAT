const Chat = require('../Models/Chat');
const fs = require("fs");

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

// Send chat char
module.exports.createChatChar = function (req, res) {
	if (!req.body.sender || !req.body.receiver || !req.body) {
		return res.status(400).end('invalid input');
	}

	let mChat = new Chat();
	mChat.sender = req.body.sender;
	mChat.receiver = req.body.receiver;
	mChat.content = req.body.content;
	mChat.image = '';

	mChat.save(function (err) {
        if(err){
            return res.json({ message: 'Send not success' });
        }
    });
	return res.end(JSON.stringify(mChat));
};

// Send chat images;
module.exports.createChatImage = function (req, res) {
	if (!req.body.sender || !req.body.receiver || !req.body || req.files.image) {
		return res.status(400).end('invalid input');
    }

    let pathFile = "/images/users/"+randomValueBase64(10)+".png";
    fs.writeFile("public"+pathFile, req.files.image.data, function(err){
        if(err){
            pathFile = "";
        }
    });

	let mChat = new Chat();
	mChat.sender = req.body.sender;
	mChat.receiver = req.body.receiver;
	mChat.content = "";
	mChat.image = pathFile;

	mChat.save(function (err) {
		return res.json({ message: 'Send not success' });
	});
	return res.json({ message: 'Send success' });
};

// list chat user
module.exports.listChat = function(req, res){
    try {
        
        Chat.find(
            {
                $or:[
                    {sender: req.body.sender, receiver:req.body.receiver},
                    {sender: req.body.receiver, receiver:req.body.sender}
                ]
            }, 
            function(err, chat){
                console.log(chat);
                return res.end(JSON.stringify(chat));
        });
    } catch (error) {
        
    }
};
