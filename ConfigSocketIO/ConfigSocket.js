module.exports = function (io) {
  let users = [];
  io.on('connection', socket => {
    console.log(`user connection: ${socket.id}`);
    socket.on("user_connect", (username)=>{
      users[username] =socket.id;
      console.log(users);
    });
  });
};
