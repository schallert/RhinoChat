/**
 * Module dependencies.
 */
 var express = require('express')
 var app = module.exports = express.createServer();
 var io = require('socket.io').listen(app);

// Configuration
app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

var port = 1500;
var max_message = 20000;
var max_file = 3000000;

var room_members_list = [];

// Routes

app.listen(port);

io.sockets.on('connection', function (socket) {  

  socket.on('room', function (room) {
    socket.join(room);
    socket.set('room', room);
    if(room_members_list[room] == undefined)
      room_members_list[room] = [];
  }); // End room

  socket.on('nickname', function (data) {
    socket.set('nickname', data);

    socket.get('room', function (err, room) {
      socket.broadcast.to(room).emit('new_user', { "nickname": data });
      io.sockets.clients(room, function (list) {
        io.sockets.in(room).emit('list', { "userlist": list });
      });
      room_members_list[room].push(data);
    });
  }); // End nickname
  
  socket.on('message', function (data) {
    if (data.length > max_message) {
      data = "This message was too long.";
    } else {
      data = data.replace(/<(?:.|\n)*?>/gm, '');
    }
    
    socket.get('nickname', function (err, name) {
      socket.get('room', function (err, room) {
        socket.broadcast.to(room).emit('new', { "message": data, "nickname": name });
      });
    });

    console.log("ROOM VAR BELOW");
    console.log(room_members_list);

  }); // End message
  
  socket.on('file', function (data) {
    if (data.length > max_file) {
      data = "This file was too large.";
      socket.get('nickname', function (err, name) {
        socket.get('room', function (err, room) {
          socket.broadcast.to(room).emit('new', { "message": data, "nickname": name });
        });
      });
    } else {
      data = data.replace(/<(?:.|\n)*?>/gm, '');
      socket.get('nickname', function (err, name) {
        socket.get('room', function (err, room) {
          socket.broadcast.to(room).emit('new_file', { "file": data, "nickname": name })
        });
      });
    }
  }); // End file
  
  socket.on('disconnect', function () {
    socket.get('nickname', function (err, name) {
      socket.get('room', function (err, room) {
        //remove the entry at index containing that name
        room_members_list[room].splice(room_members_list[room].lastIndexOf(name), 1);

        socket.broadcast.to(room).emit('dead_user', { "nickname": name });
        io.sockets.in(room).emit('list', { "userlist": room_members_list[room] });
        socket.leave(room);
      });
    });
  }); // End disconnect
  
}); // End socket.io 
