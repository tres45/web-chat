var firebase = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://web-chat-228de.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");

// ref.child('Rooms').push({
//     name: 'General chat',
//     isGroup: true,
//     roomId: '0'
// });

function getRef(table, keyName, keyValue) {
    return ref.child(table).orderByChild(keyName).equalTo(keyValue)
        .once("value").then(function(snapshot) {
        let _ref;
        snapshot.forEach(function(childSnapshot) {
            _ref = childSnapshot.ref;
            return true;
        });
        return _ref;
    });
}

function NewMessage(message) {
    ref.child('messageList').push(message);
    getRef('Rooms', 'roomId', message.toRoom).then(_ref => {
        _ref.child('messageList').push({
            idx: message.id
        });
    });
}

function createRoom(room) {
    let _ref = ref.child('Rooms').push({
        name: room.name,
        isGroup: room.isGroup,
        roomId: room.roomId,
        unread: 0
    });
    if (room.userList) {
        room.userList.forEach((user) => {
            _ref.child('userList').push({
                name: user
            });
        });
    }
}

function updateUsersRoomList(room) {
    let _ref = ref.child('Users');
    room.userList.forEach((user) => {
        getRef('Users', 'name', user).then(_ref => {
            _ref.child('roomList').push({
                roomId: room.roomId
            });
        });
    });
}

function changeRoom(data) {
    getRef('Users', 'name', data.user).then(_ref => {
        _ref.update({
            'currentRoom': data.toRoom
        });
    });
    // TODO: remove unread msg from room
}

function createUser(name) {
    let _ref = ref.child('Users').push({
        name: name,
        currentRoom: ''
    });
    _ref.child('roomList').push('0');
    _ref.child('roomList').push(name);
    getRef('Rooms', 'roomId', '0').then(_ref => {
        _ref.child('userList').push(name);
    });
}

function resetUserCurRoom(name) {
    getRef('Users', 'name', name).then(_ref => {
        _ref.update({
            'currentRoom': ''
        });
    });
}

FbStorage = {
    dbCreateUser: createUser,
    dbResetUserCurRoom: resetUserCurRoom,
    dbNewMessage: NewMessage,
    dbCreateRoom: createRoom,
    dbChangeRoom: changeRoom,
    dbUpdateUsersRoomList: updateUsersRoomList
};
module.exports = FbStorage;
