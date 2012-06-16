var BROWSER = new Object();
var SYSTEM = new Object();
window.onload = init;

function init() {
	//False for IE; True for other
	if(navigator.appName == "Microsoft Internet Explorer") {
		BROWSER.name = false;
	}
	else {
		BROWSER.name = true;
	}
	resizeDelay();
}

function resizeDelay() {
	//Get width
	//fix userlist at 150
	//transcript at 500
	//padding 50 left and right
	var winW, winH;
	if(BROWSER.name) {
		winW = window.innerWidth;
		winH = window.innerHeight;
	}
	else {
		winW = document.documentElement.clientWidth;
		winH = document.documentElement.clientHeight;
	}

	var transcript = document.getElementById("transcript");
	var userList = document.getElementById("userlist");
	var message = document.getElementById("message");

	//Check if meets minimum
	var minX = winW - 750;
	var minY = winH - 500;
	
	//WidthCheck
	if(minX > 0) {
		transcript.style.width = minX + 500 + "px";
		message.style.width = minX + 510 + "px";
	}
	else {

	}

	//Height Check
	if(minY > 0) {
		transcript.style.height = minY + 200 + "px";
		userList.style.height = minY + 200 + "px";
		message.style.top = minY + 290 + "px";
	}
	console.log("done resizing");

	//Center Login if present
	var halfW = winW/2;
	var promptHolder = document.getElementById("prompt");
	//promptHolder.style.left = ((((halfW - Math.abs(112))/winW)*100).toFixed(2)) + "px";

}

window.onresize = function(){
	clearTimeout(SYSTEM.resize);
	SYSTEM.resize = setTimeout("resizeDelay()",100);
}
