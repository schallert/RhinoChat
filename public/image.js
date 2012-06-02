var max_image = 3000000; // This check is also done server-side.

$(document).ready(function() {
	var upload_box = document.getElementById("chat");
	upload_box.addEventListener("dragenter", dragEnter, false);
	upload_box.addEventListener("dragexit", dragExit, false);
	upload_box.addEventListener("dragover", dragOver, false);
	upload_box.addEventListener("drop", drop, false);
});

function stopEvents(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function dragEnter(evt) {
	stopEvents(evt);
}

function dragExit(evt) {
	stopEvents(evt);
}

function dragOver(evt) {
	stopEvents(evt);
}

function drop(evt) {
	stopEvents(evt);

	var files = evt.dataTransfer.files;
	var num_files = files.length;

	if (num_files > 0)
		handleFiles(files);
}

function handleFiles(files) {
	var first_file = files[0];
	window.first_file_name = first_file.name;
	window.reader = new FileReader();

	window.reader.onloadend = handleReaderLoadEnd;
	window.reader.readAsDataURL(first_file);
}

function handleReaderLoadEnd(evt) {
	// Append image to page.
	if(evt.target.result.length > max_image) {
		$('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: This image was too large to send.</div>");	
		$("#transcript").scrollTop($("#transcript")[0].scrollHeight);
	} else {
		$('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: <img OnLoad='scrollToBottom();' src='" + evt.target.result + "' /></div>");
		socket.emit('image', evt.target.result);
	}
}