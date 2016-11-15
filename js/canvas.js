var w, width, h, height;
var canvas;
function createCanvas(canvas_name){
	canvas = document.createElement('canvas');
	var body = document.querySelector('body');
	canvas.setAttribute("id", canvas_name);
	body.appendChild(canvas);
	var ctx = canvas.getContext('2d');
	resize();
	window.addEventListener("resize", resize, false);
	return ctx;
}

function createGLCanvas(canvas_name){
	canvas = document.createElement('canvas');
	var body = document.querySelector('body');
	canvas.setAttribute("id", canvas_name);
	body.appendChild(canvas);
	var gl = canvas.getContext('webgl');
	if (!gl) var gl = canvas.getContext('experimental-webgl');
	resize();
	window.addEventListener("resize", resize, false);
	return gl;
}

function resize(){
	var c = document.getElementsByTagName('canvas');
	width = w = window.innerWidth;
	height = h = window.innerHeight;
	for(var i = 0; i < c.length; i++) {
		c[i].width = width;
		c[i].height = height;
	}
	console.log("resize: " + w +":" + h);
}



