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

var user_list = [];

// Routes

app.listen(port);

io.sockets.on('connection', function (socket) {  

  socket.on('room', function (room) {
        socket.join(room);
        socket.set('room', room);
  }); // End room

  socket.on('nickname', function (data) {
  	socket.set('nickname', data);
    	user_list.push(data);

	socket.get('room', function (err, room) {
	  	socket.broadcast.to(room).emit('new_user', { "nickname": data });
    		io.sockets.in(room).emit('list', { "userlist": user_list });
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
	     socket.leave(room);
	     user_list.splice(user_list.lastIndexOf(name), 1); //remove this index
	     socket.broadcast.to(room).emit('dead_user', { "nickname": name });
	     socket.broadcast.to(room).emit('list', { "userlist": user_list });
	});
   });
  }); // End disconnect
  
}); // End socket.io 
