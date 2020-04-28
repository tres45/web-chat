let socketIo = require('socket.io');

let io = socketIo();
let webChatSocket = {};

io.on('connection', function(socket) {
  console.log('A user connected');

  socket.on('new-message', (message) => {
    console.log(message);
    io.emit(message);
  });
});

webChatSocket.sendNotification = function() {
  io.sockets.emit('hello', {msg: 'Hello World!'});
}

webChatSocket.io = io;

module.exports = webChatSocket;