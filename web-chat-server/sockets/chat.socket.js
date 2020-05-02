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
    roomId: int;
  }
}
*/

let Users = {};
let MessageList = [];
let Rooms = {
  '0': {
      name: 'General chat',
      userList: [],
      messageList: [],
      isGroup: true,
      roomId: '0'
  }
};
let roomCounter = Object.keys(Rooms).length;
// TODO nickname
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

  socket.on('add-contact', (data) => {
    addContact(data, socket);
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
      for (let i = 0; i < unreadList.length; i++) {
        let idx = unreadList[i];
        let addedIdx = Rooms[roomId].messageList.indexOf(idx);
        if (addedIdx === -1) {
          continue;
        }
        messageList[addedIdx].isUnread = true;
      }
    }
    let roomData = Object.assign({}, Rooms[roomId]);
    roomData.messageList = messageList;
    data.push(roomData);
  });

  socket.emit('load-data', data);
}

function newMessage(message, socket) {
  message.id = MessageList.length;
  MessageList.push(message);
  console.log('[new-message]:', message);
  Rooms[message.toRoom].messageList.push(message.id);

  socket.broadcast.to(message.toRoom).emit('new-message', message);

  Rooms[message.toRoom].userList.forEach((userName) => {
    if (userName !== message.fromUser) {
      if (Users[userName].connected && Users[userName].currentRoom !== message.toRoom) {
        Users[userName].ureadMessages.push(message.id);

        io.to(Users[userName].socketId).emit('new-message', message);
      } else if (!Users[userName].connected) {
        Users[userName].ureadMessages.push(message.id);
      }
    }
  });
}

function discconectBySocketId(id) {
  Object.keys(Users).forEach((userName) => {
    if (Users[userName].socketId === id) {
      Users[userName].socketId = -1;
      Users[userName].connected = false;
      Users[userName].currentRoom = '';
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
      Users[userName].ureadMessages = [];
    }
  }
  else {
    socket.leave(Users[userName].currentRoom);
  }
  socket.join(userName);

  Users[userName].currentRoom = '';
  Users[userName].socketId = socket.id;
  Users[userName].connected = true;
  console.log('User', userName, 'connected');
}

function createRoom(roomId, roomName, userList) {
  if (!roomId) {
    roomId = roomCounter++;
    roomId = roomId.toString();
  }
  if (roomId in Rooms) {
    return null;
  } else {
    Rooms[roomId] = {
      name: roomName,
      userList: userList,
      messageList: [],
      isGroup: (userList.length > 2),
      roomId: roomId,
      unread: 0
    };
  }
  return roomId;
}

function changeRoom(data, socket) {
  socket.leave(data.curRoom);
  socket.join(data.toRoom);
  Users[data.user].currentRoom = data.toRoom;

  let unreadList = Users[data.user].ureadMessages;
  for (let i = 0; i < Users[data.user].ureadMessages.length; i++) {
    if (Rooms[data.toRoom].messageList.indexOf(unreadList[i]) !== -1) {
      unreadList.splice(i, 1);
      i--;
    }
  }
}

function addContact(data, socket) {
  if (!data.isGroup) {
    if (data.userList[0] === data.userList[1]) {
      socket.emit('contact-not-found', false);
    } else if (data.userList[1] in Users) {
      let newId = createRoom(null, data.name, data.userList);
      data.roomId = newId;
      data.userList.forEach((user) => {
        Users[user].roomList.push(newId);

        io.to(Users[user].socketId).emit('contact-added', data);
      });
    } else {
      socket.emit('contact-not-found', true);
    }
  }

  // TODO: emit added
}

webChatSocket.io = io;
module.exports = webChatSocket;
