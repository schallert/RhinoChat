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
var max_text = 20000;
var max_image = 3000000;

var user_list = [];

// Routes

app.listen(port);

// TODO: FILTER INPUT

io.sockets.on('connection', function (socket) {  
  
  socket.on('nickname', function (data) {
  	socket.set('nickname', data);
    user_list.push(data);
  	socket.broadcast.emit('new_user', { "nickname": data });
  }); // End nickname
  
  socket.on('message', function (data) {
    if (data.length > max_text) {
      data = "This message was too long.";
    } else {
    	data = data.replace(/<(?:.|\n)*?>/gm, '');
    }
    
    socket.get('nickname', function (err, name) {
      socket.broadcast.emit('new', { "message": data, "nickname": name });
      socket.broadcast.emit('list', { "userlist": user_list });
    });
  }); // End message
  
  socket.on('image', function (data) {
    if (data.length > max_image) {
      data = "This image was too large.";
      socket.get('nickname', function (err, name) {
       socket.broadcast.emit('new', { "message": data, "nickname": name });
      });
    } else {
      data = data.replace(/<(?:.|\n)*?>/gm, '');
      socket.get('nickname', function (err, name) {
       socket.broadcast.emit('new_image', { "image": data, "nickname": name })
      });
    }
  }); // End image
  
  socket.on('disconnect', function () {
   socket.get('nickname', function (err, name) {
     user_list.splice(user_list.lastIndexOf(name), 1); //remove this index
     socket.broadcast.emit('dead_user', { "nickname": name });
     socket.broadcast.emit('list', { "userlist": user_list });
   });
  }); // End disconnect
  
}); // End socket.io 