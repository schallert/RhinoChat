DEBUG_MODE = true;

$(document).ready(function() {
	var upload_box = document.getElementById("upload_box")

	upload_box.addEventListener("dragenter", dragEnter, false);
	upload_box.addEventListener("dragexit", dragExit, false);
	upload_box.addEventListener("dragover", dragOver, false);
	upload_box.addEventListener("drop", drop, false);
});

function stopEvents(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function log(msg) {
	if(DEBUG_MODE) console.log(msg);
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
	log("drop");
	stopEvents(evt);

	var files = evt.dataTransfer.files;
	var num_files = files.length;

	if (num_files > 0)
		handleFiles(files);
}

function handleFiles(files) {
	log("handleFiles");
	var first_file = files[0];
	window.first_file_name = first_file.name;
	window.reader = new FileReader();

	window.reader.onprogress = handleReaderProgress;
	window.reader.onloadend = handleReaderLoadEnd;
	window.reader.readAsDataURL(first_file);
}

function handleReaderProgress(evt) {
	log("handleProgress");
	if (evt.lengthComputable) {
		var loaded = (evt.loaded / evt.total);
		document.getElementById("upload_label").innerHTML = "Sending: " + window.first_file_name + ", " + loaded + "% complete";
	}
}

function handleReaderLoadEnd(evt) {
	log("handleLoadEnd");
	var img = document.getElementById("upload_display");
	img.src = evt.target.result;
}
