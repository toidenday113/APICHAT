const nodemailer = require("nodemailer");

module.exports = {}
let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "toidenday113@gmail.com", // generated ethereal user
      pass: "Hoangkha007", // generated ethereal password
    },
  });
  module.exports.SendCode = function(email,code){
    transporter.sendMail({
        from: "Dev Chat", // sender address
        to: email, // list of receivers
        subject: "Code validate reset password", // Subject line
        html: "<p>Here is the code to enter into the application</p><b>"+code+"</b>", // html body
      });
  } 