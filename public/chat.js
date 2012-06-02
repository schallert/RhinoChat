var max_text = 20000; // This check also occurs server-side.

var socket = io.connect(config.ip);
  
socket.on('new', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.ip + "</span>: " + data.message + "</div>");
    scrollToBottom();
});

socket.on('new_image', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.ip + "</span>: <img OnLoad='scrollToBottom();' src='" + data.image + "' /></div>");
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
      socket.emit('message', message);
    }
    scrollToBottom();
  }
}

function scrollToBottom() {
  $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
}