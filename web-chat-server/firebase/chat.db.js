var firebase = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://web-chat-228de.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");

// ref.child('Rooms').child('0').set({
//     name: 'General chat',
//     isGroup: true,
//     roomId: '0'
// });

FbStorage = {
    dbNewMessage: function (message) {
        ref.child('messageList').push(message);
    },
    dbCreateRoom: function (room) {
        let _ref = ref.child('Rooms').child(room.roomId);
        _ref.set({
            name: room.roomName,
            isGroup: room.isGroup,
            roomId: room.roomId,
            unread: 0
        });
        if (room.userList) {
            room.userList.forEach((user) => {
                _ref.child('userList').push(user);
            });
        }
    },
    dbCreateUser: function (name) {
        let _ref = ref.child('Users').child(name);
        _ref.set({
            currentRoom: ''
        });
        _ref.child('roomList').push('0');
        _ref.child('roomList').push(name);
        ref.child('Rooms').child('0').child('userList').push(name);
    }
};

module.exports = FbStorage;
