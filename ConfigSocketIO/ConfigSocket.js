module.exports = function (io) {
  let users = [];
  io.on('connection', socket => {
    console.log(`user connection: ${socket.id}`);
  });
};
