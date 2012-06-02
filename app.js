
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
  // Doesn't work
  app.use(express.limit('2mb'));
});

// Routes

app.listen(1500);

// TODO: FILTER INPUT

io.sockets.on('connection', function (socket) {
  socket.on('message', function (data) {
  	data = data.replace(/<(?:.|\n)*?>/gm, '');
    var user = socket.handshake.address;
	socket.broadcast.emit('new', { "message": data, "ip": user.address });
  });
  socket.on('image', function (data) {
  	data = data.replace(/<(?:.|\n)*?>/gm, '');
    var user = socket.handshake.address;
	socket.broadcast.emit('new_image', { "image": data, "ip": user.address });
  });
});