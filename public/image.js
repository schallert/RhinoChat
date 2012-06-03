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

// File upload original method written using Riyad Kalla's tutorial
function handleFiles(files) {
	for(var i = 0; i < files.length; i++) {
		var cur_file = files[0];
		window.cur_file_name = cur_file.name;
		window.reader = new FileReader();

		window.reader.onprogress = handleReaderProgress;
		window.reader.onloadend = handleReaderLoadEnd;
		window.reader.readAsDataURL(cur_file);
	}
}

function handleReaderProgress(evt) {
	if (evt.lengthComputable) {
		var loaded = (evt.loaded / evt.total);
		$("#progressbar").progressbar({ value: loaded * 100 });
	}
}

function handleReaderLoadEnd(evt) {
	// Append image to page.
	if(evt.target.result.length > max_image) {
		$('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: This image was too large to send.</div>");	
		$("#transcript").scrollTop($("#transcript")[0].scrollHeight);
	} else {
		var max_width = 0.9 * window.innerWidth;
		$('#transcript').append("<div class='rec_message'><span class='me'>Me</span>: <img OnLoad='scrollToBottom();' style='max-width: " + max_width + 
			"' src='" + evt.target.result + "' /></div>");
		socket.emit('image', evt.target.result);
	}
}