let socketIo = require('socket.io');

let io = socketIo();
let webChatSocket = {};

/*
MessageList = [
  {
    fromUser: string;
    toRoom: string;
    message: string;
    id: int;
  }
];
Users = {
  name: {
    socketId: string;
    roomList: RoomId[];
    currentRoom: string
    connected: boolean;
    ureadMessages: idx[];
    newRoom: RoomId[];
  }
};
roomCounter: int;
Rooms = {
  roomId: {
    name: string;
    userList: name[];
    messageList: idx[];
    isGroup: boolean;
  }
}
*/

let Users = {};
let MessageList = [];
let Rooms = {
  '0': {
      name: "General chat",
      userList: [],
      messageList: [],
      isGroup: true
  }
};
let roomCounter = Object.keys(Rooms).length;

io.on('connection', function(socket) {

  socket.on('new-connection', (userName) => {
    newConnection(userName, socket);
  });

  socket.on('new-message', (message) => {
    newMessage(message, socket);
  });

  socket.on('change-room', (data) => {
    changeRoom(data, socket);
  });

  socket.on('disconnect', function() {
    discconectBySocketId(socket.id);
  });

});

function newConnection(userName, socket) {
  connectUser(userName, socket);
  let data = [];

  Users[userName].roomList.forEach((roomId) => {
    let messageList = [];
    Rooms[roomId].messageList.forEach((idx) => {
      let message = MessageList[idx];
      message.isUnread = false;
      messageList.push(message);
    });

    if ('ureadMessages' in Users[userName]) {
      let unreadList = Users[userName].ureadMessages;
      if (unreadList.length > 0) {
        unreadList.forEach((idx) => {
          let addedIdx = room.messageList.indexOf(idx)
          messageList[addedIdx].isUnread = true;
          unreadList.splice(unreadList.indexOf('idx'), 1);
        });
      }
    }

    roomData = Object.assign({}, Rooms[roomId]);
    roomData.messageList = messageList;
    data.push(roomData);
  });

  socket.emit('load-data', data);
}

function newMessage(message, socket) { // TODO: unread if disconected
  console.log("[new-message]:", message);
  message.id = MessageList.length;
  MessageList.push(message);
  Rooms[message.toRoom].messageList.push(message.id);
  socket.broadcast.to(message.toRoom).emit('new-message', message);
}

function discconectByName(name) {
  Object.keys(Users).forEach((userName) => {
    if (userName === name) {
      Users[userName].socketId = -1;
      Users[userName].connected = false;
      console.log('User', userName, 'disconnected');

      return;
    }
  });
}

function discconectBySocketId(id) {
  Object.keys(Users).forEach((userName) => {
    if (Users[userName].socketId === id) {
      Users[userName].socketId = -1;
      Users[userName].connected = false;
      console.log('User', userName, 'disconnected');

      return;
    }
  });
}

function connectUser(userName, socket) {
  if (!(userName in Users)) {
    createRoom(userName, userName, [userName]);
    if (Rooms['0'].userList.indexOf(userName) === -1) {
      Users[userName] = {};
      Rooms['0'].userList.push(userName);
      Users[userName].roomList = ['0'];
      Users[userName].roomList.push(userName);
      // TODO: push msg from group chat to user group chat
    }
  }
  else {
    socket.leave(Users[userName].currentRoom);
  }

  socket.join(userName);
  Users[userName].currentRoom = userName;
  Users[userName].socketId = socket.id;
  Users[userName].connected = true;
  console.log("User", userName, "connected");
}

function createRoom(roomId, roomName, userList) {
  if (!roomId) {
    roomId = roomCounter++;
  }
  if (roomId in Rooms) {
    return null;
  } else {
    Rooms[roomId] = {
      name: roomName,
      userList: userList,
      messageList: [],
      isGroup: (userList.length > 2)
    };
  }

  return roomId;
}

function changeRoom(data, socket) {
  socket.leave(data.curRoom);
  socket.join(data.toRoom);
  Users[data.user].currentRoom = data.toRoom;
}

webChatSocket.io = io;
module.exports = webChatSocket;