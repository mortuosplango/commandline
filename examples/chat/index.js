// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('../..')(server);
var port = process.env.PORT || 3000;
var password;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
  password = process.argv[2];
  //console.log(password);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var numUsers = 0;
var users = [];

io.on('connection', function (socket) {
  var addedUser = false;

  //console.log("user connected");
  socket.emit('password option', password );

  // when the client emits 'new message', this listens and executes
  socket.on('new C message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new C message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new S message', function (data) {
    // we tell the client to execute 'new message'
/*
    socket.broadcast.emit('new S message', {
      username: data.username,
      message: data.message
    });
    */
    //console.log(data);
    data = JSON.parse(data);
    //console.log(data);

    socket.broadcast.emit('new S message', JSON.stringify({
      username: data.username,
      message: data.message
    }));
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    users.push(username);
    console.log(users);

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', JSON.stringify({
      numUsers: numUsers,
      userList: users
    }));
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', JSON.stringify({
      username: socket.username,
      numUsers: numUsers,
      userList: users
    }));
  });
/*
  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });
*/
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

    //if (users.length > numUsers ) {
    users.splice(users.indexOf(socket.username), 1);
    console.log(users);
    //}

    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
