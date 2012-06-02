var socket = io.connect(config.ip);
  
socket.on('new', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.ip + "</span>: " + data.message + "</div>");
    scrollToBottom();
});

socket.on('new_image', function (data) {
    $('#transcript').append("<div class='rec_message'><span class='other'>" + data.ip + "</span>: <img OnLoad='scrollToBottom();' src='" + data.image + "' /></div>");
});

function send_message() {
  if($('#message').val()!="") {
      var message = $('#message').val().replace(/<(?:.|\n)*?>/gm, '');
      $('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: " + message + "</div>");
      $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
      $('#message').val("");
      scrollToBottom();
      socket.emit('message', message);
    }
}

function scrollToBottom() {
  $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
}