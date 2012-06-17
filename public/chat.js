jQuery(function ($) {
  $("#prompt").modal();
});

var socket = io.connect();

var max_text = 20000; // This check also occurs server-side.
window.password = "_Rhino_"; // Change this if room is protected


// Maintain knowledge of focus on window to show unread messages
var unread = 0;
var active_element;
var hasFocus = true;
window.onblur = function()  { onWindowBlur(); }
window.onfocus = function() { onWindowFocus(); }

function onWindowFocus()  {
  clearUnread();
  hasFocus = true;
}

function onWindowBlur() {
  if (active_element != document.activeElement) {
    active_element = document.activeElement;
    return;
  }
  hasFocus = false;
}

// Action upon recieving a new chat message.
socket.on('new', function (data) {
  try {
//    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
var pt_nickname = data.nickname;
    var pt_message = sjcl.decrypt(window.password, data.message);
    var parsed_pt_message = parseMessage(pt_message);

    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      "</span>: " + parsed_pt_message + "</div>");
    scrollToBottom();
    incrementUnread();
  } catch (err) {
    console.log(err);
  }
});

// Action upon recieving a new file.
socket.on('new_file', function (data) {
  try {
    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
    var pt_file = sjcl.decrypt(window.password, data.file);

    var max_width = 0.9 * window.innerWidth; 
    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname + 
      "</span>: <img OnLoad='scrollToBottom();' style='max-width: " + max_width + 
      "px;' src='" + pt_file + "' /></div>");
    incrementUnread();
  } catch (err) {
    console.log(err);
  }
});

// Action when the server sends updated encrytped userlist.
socket.on('list', function (data) {
  try {
    console.log("data: ");
    console.log(data);
    $('#userlist').empty();
//    var pt_userlist = new Array();

    for(var i = 0; i < data.length; i++) {
//      pt_userlist[i] = sjcl.decrypt(window.password, userlist[i]);
      $('#userlist').append(data[i]+"<br>");
    }
  } catch (err) {
    console.log(err);
  }
});

// Action when a new user joins.
socket.on('new_user', function (data) {
  try {
//    var pt_nickname = sjcl.decrypt(window.password, data.nickname);
var pt_nickname = data.nickname;

    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      " joined</span></div>");
    scrollToBottom();
    incrementUnread();
  } catch (err) {
    console.log(err);
  }
});

// Action when a user leaves.
socket.on('dead_user', function (data) {
  try {
    //var pt_nickname = sjcl.decrypt(window.password, data.nickname);

var pt_nickname = data.nickname;

    $('#transcript').append("<div class='rec_message'><span class='other'>" + pt_nickname +
      " left</span></div>");
    scrollToBottom();
    incrementUnread();
  } catch (err) {
    console.log(err);
  }
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
  var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)?/gi;
  parsed_message = message.replace(urlRegex, function(url) {  
    var httpRegex = /^https?:\/\//;

    // Parsing for youtube embeds
    if(url.indexOf("youtube.com") != -1) {
      var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match&&match[7].length==11){
        var total;
        var front = "<div style = 'margin-top: -15px;margin-bottom: 10px;margin-left: 35px; box-shadow: 0px 0px 10px black;height: 315px;width: 560px;' id = 'frame'><object width=\"480\" height=\"360\"><param name=\"movie\"value=\"https://www.youtube.com/v/";
        var middle = "?version=3&autohide=1&showinfo=0&modestbranding=1\"></param><param name=\"allowScriptAccess\" value=\"always\"></param><embed src=\"https://www.youtube.com/v/";
        var tail = "?version=3&autohide=1&showinfo=0&modestbranding=1\"type=\"application/x-shockwave-flash\"allowscriptaccess=\"always\"width=\"560\" height=\"315\"></embed></object></div>";
        return front + match[7] + middle + match[7] + tail;
      } else {
        return url;
      }
    }

    // Parsing for url embeds
    if(httpRegex.test(url)) {
     return '<a href="' + url + '">' + url + '</a>';
    } else {
     return '<a href="http://' + url + '">' + url + '</a>';
    }
  });
  return parsed_message;
}

function set_room() {
  var room = $('#room').val();
  socket.emit('room', room);
}

function set_pass() {
  if($('#password').val() != "") {
    window.password = $('#password').val();
  }
  window.password = $('#room').val() + window.password;
}

function set_nick() {
  var nickname = $('#nickname').val();
//  var ct_nickname = sjcl.encrypt(window.password, nickname);
//  socket.emit('nickname', ct_nickname);
  socket.emit('nickname', nickname);
}

function scrollToBottom() {
  $("#transcript").scrollTop($("#transcript")[0].scrollHeight);
}

function incrementUnread() {
  if(!hasFocus) {
    unread++;
    document.title = "(" + unread + ") Rhino Chat";
  }
}

function clearUnread() {
  unread = 0;
  document.title = "Rhino Chat";
}
