jQuery(function ($) {
	$("#prompt").modal();
});

var max_text = 20000; // This check also occurs server-side.
window.password = "_Rhino_"; // Change this if room is protected

var socket = io.connect();

// Action upon recieving a new chat message.
socket.on('new', function (data) {
    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
    var pt_message = sjcl.decrypt(window.password, data.message);
    var parsed_pt_message = parseMessage(pt_message);

    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      "</span>: " + parsed_pt_message + "</div>");
    scrollToBottom();
});

// Action upon recieving a new file.
socket.on('new_file', function (data) {
    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
    var pt_file = sjcl.decrypt(window.password, data.file);


    var max_width = 0.9 * window.innerWidth; 
    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname + 
      "</span>: <img OnLoad='scrollToBottom();' style='max-width: " + max_width + 
      "px;' src='" + pt_file + "' /></div>");
});

// Action when the server sends updated encrytped userlist.
socket.on('list', function (data) {
	$('#userlist').empty();
    var pt_userlist = new Array();
    for(var i = 0; i < data.userlist.length; i++) {
      try {
        pt_userlist[i] = sjcl.decrypt(window.password, data.userlist[i]);
        $('#userlist').append(pt_userlist[i]+"<br>");
      } catch (err) {
        console.log(err);
      }
    }
});

// Action when a new user joins.
socket.on('new_user', function (data) {
    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      " joined</span></div>");
    scrollToBottom();
});

// Action when a user leaves.
socket.on('dead_user', function (data) {
    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      " left</span></div>");
    scrollToBottom();
});

function send_message() {
  var message = $('#message').val();
  if(message!="") {
    message = message.replace(/<(?:.|\n)*?>/gm, '');
    var parsed_message = parseMessage(message);

    $('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: " + parsed_message + "</div>");
    $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
    $('#message').val("");
    if(message.length > max_text) {
      message = "The message was too large to send.";
      $('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: " + message + "</div>");
    } else {
      var ct_message = sjcl.encrypt(window.password, message);
      socket.emit('message', ct_message);
    }
    scrollToBottom();
  }
}

// parses given text for URLs and converts them to hyperlinks
function parseMessage(message) {
  var urlRegex = /(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
  parsed_message = message.replace(urlRegex, function(url) {  
                     var httpRegex = /^https?:\/\//;
                     if(httpRegex.test(url)) {
                       return '<a href="' + url + '">' + url + '</a>';
                     } else {
                       return '<a href="http://' + url + '">' + url + '</a>';
                     }
                 });
  return parsed_message;
}

function set_pass() {
  if($('#password').val() != "") {
    window.password = $('#password').val();
  }
}

function set_nick() {
	var nickname = $('#nickname').val();
  var ct_nickname = sjcl.encrypt(window.password, nickname);
	socket.emit('nickname', ct_nickname);
}

function scrollToBottom() {
  $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
}