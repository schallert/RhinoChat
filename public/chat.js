jQuery(function ($) {
	$("#prompt").modal();
});

var max_text = 20000; // This check also occurs server-side.
var password = "_Rhino_"; // Change this if room is protected

var socket = io.connect();

// Action upon recieving a new chat message.
socket.on('new', function (data) {
    var plaintext = sjcl.decrypt(password, data.message);
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.nickname +
      "</span>: " + plaintext + "</div>");
    scrollToBottom();
});

// Action upon recieving a new image.
socket.on('new_image', function (data) {
    var max_width = 0.9 * window.innerWidth; 
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.nickname + 
      "</span>: <img OnLoad='scrollToBottom();' style='max-width: " + max_width + 
      "px;' src='" + data.image + "' /></div>");
});

// Action upon the joining of a new user.
socket.on('new_user', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.nickname +
      " joined</span></div>");
    scrollToBottom();
});

// Action upon the leaving of a new user.
socket.on('dead_user', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.nickname +
      " left</span></div>");
    scrollToBottom();
});

function send_message() {
  var message = $('#message').val();
  if(message!="") {
    message = message.replace(/<(?:.|\n)*?>/gm, '');
    $('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: " + message + "</div>");
    $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
    $('#message').val("");
    if(message.length > max_text) {
      message = "The message was too large to send.";
      $('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: " + message + "</div>");
    } else {
      var ciphertext = sjcl.encrypt(password, message);
      socket.emit('message', ciphertext);
    }
    scrollToBottom();
  }
}

function set_nick() {
	var nickname = $('#nickname').val();
	socket.emit('nickname', nickname);
}

function set_pass() {
  if($('#password').val() != "") {
	  password = $('#password').val();
  }
}

function scrollToBottom() {
  $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
}