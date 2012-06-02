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

// Routes

app.listen(port);

// TODO: FILTER INPUT

io.sockets.on('connection', function (socket) {

  socket.on('message', function (data) {
    if (data.length > max_text) {
      data = "This message was too long.";
    } else {
    	data = data.replace(/<(?:.|\n)*?>/gm, '');
    }
    var user = socket.handshake.address;
    socket.broadcast.emit('new', { "message": data, "ip": user.address });
  });
  
  socket.on('image', function (data) {
    if (data.length > max_image) {
      data = "This image was too large.";
      var user = socket.handshake.address;
      socket.broadcast.emit('new', { "message": data, "ip": user.address });
    } else {
    	data = data.replace(/<(?:.|\n)*?>/gm, '');
      var user = socket.handshake.address;
      socket.broadcast.emit('new_image', { "image": data, "ip": user.address });
    }
  });
  
});