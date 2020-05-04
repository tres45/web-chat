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
    unreadMessages: idx[];
  }
};
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

// Init local db
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

// Use socket io
io.on('connection', function(socket) {

  socket.on('new-connection', (userName) => {
    try {
      newConnection(userName, socket);
    } catch (e) {
    }
  });

  socket.on('new-message', (message) => {
    try {
      newMessage(message, socket);
    } catch (e) {
    }
  });

  socket.on('change-room', (data) => {
    try {
      changeRoom(data, socket);
    } catch (e) {
    }
  });

  socket.on('add-contact', (data) => {
    try {
      addContact(data, socket);
    } catch (e) {
    }
  });

  socket.on('add-group', (data) => {
    try {
      addGroup(data, socket);
    } catch (e) {
    }
  });

  socket.on('disconnect', function() {
    try {
      discconectBySocketId(socket.id);
    } catch (e) {
    }
  });

});

function newConnection(userName, socket) {
  // Update user status
  connectUser(userName, socket);

  // Collect data for account
  let data = [];
  Users[userName].roomList.forEach((roomId) => {
    // Collect all messages
    let messageList = [];
    Rooms[roomId].messageList.forEach((idx) => {
      let message = MessageList[idx];
      message.isUnread = false;
      messageList.push(message);
    });

    // Mark specific message as unread
    if ('unreadMessages' in Users[userName]) {
      let unreadList = Users[userName].unreadMessages;
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

  // Send account data to client
  socket.emit('load-data', data);
}

function newMessage(message, socket) {
  // Update messages
  message.id = MessageList.length;
  MessageList.push(message);
  Rooms[message.toRoom].messageList.push(message.id);

  // TODO: Fix open 2+ session with same account without bugs
  socket.broadcast.to(message.toRoom).emit('new-message', message);

  // Mark message as unread if user inside another chat or disconnect at this moment
  Rooms[message.toRoom].userList.forEach((userName) => {
    if (userName !== message.fromUser) {
      if (Users[userName].connected && Users[userName].currentRoom !== message.toRoom) {
        Users[userName].unreadMessages.push(message.id);

        // Send new message to client by socket id
        io.to(Users[userName].socketId).emit('new-message', message);
      } else if (!Users[userName].connected) {
        Users[userName].unreadMessages.push(message.id);
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
    // Create new room for new user
    createRoom(userName, userName, [userName], false);

    if (Rooms['0'].userList.indexOf(userName) === -1) {
      Users[userName] = {};
      Rooms['0'].userList.push(userName);
      Users[userName].roomList = ['0'];
      Users[userName].roomList.push(userName);
      Users[userName].unreadMessages = [];
    }
  }
  else {
    socket.leave(Users[userName].currentRoom);
  }
  // Join user to himself room
  socket.join(userName);

  Users[userName].currentRoom = '';
  Users[userName].socketId = socket.id;
  Users[userName].connected = true;
}

// Create group room or simple ike a contact
function createRoom(roomId, roomName, userList, isGroup) {
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
      isGroup: isGroup,
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

  // Remove unread messages from target room
  let count = 0;
  let unreadList = Users[data.user].unreadMessages;
  for (let i = 0; i < Users[data.user].unreadMessages.length; i++) {
    if (Rooms[data.toRoom].messageList.indexOf(unreadList[i]) !== -1) {
      unreadList.splice(i, 1);
      i--;
      count++;
    }
  }
}

// Create contact room, not group chat
function addContact(data, socket) {
  if (!data.isGroup) {
    if (data.userList[0] === data.userList[1]) {
      socket.emit('contact-not-found', false);
    } else if (data.userList[1] in Users) {
      let newId = createRoom(null, data.name, data.userList, false);
      data.roomId = newId;
      data.userList.forEach((user) => {
        Users[user].roomList.push(newId);

        io.to(Users[user].socketId).emit('contact-added', data);
      });
    } else {
      socket.emit('contact-not-found', true);
    }
  }
}

// Create group chat
function addGroup(data, socket) {
  if (data.isGroup) {
    let newId = createRoom(null, data.name, data.userList, true);
    data.roomId = newId;
    data.userList.forEach((user) => {
      Users[user].roomList.push(newId);

      io.to(Users[user].socketId).emit('group-added', data);
    });
  }
}

webChatSocket.io = io;
module.exports = webChatSocket;
