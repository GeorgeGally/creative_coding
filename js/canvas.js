
// allows me global access to canvas and it’s width and height properties
var w, width, h, height;
var canvas;

	// this enables me to have many canvases all positioned on top of eachother at 100% width and height of page
function createCanvas(canvas_name){
	canvas = document.createElement('canvas');
	var body = document.querySelector('body');
	canvas.setAttribute("id", canvas_name);
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
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
	canvas.style.position = "absolute";
	canvas.style.left = "0px";
	canvas.style.top = "0px";
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
	//console.log("resize: " + w +":" + h);
}


function createHiddenCanvas(canvas_name){
	var ctx = createCanvas(canvas_name)
	canvas.style.left = -w+"px";
	return ctx;
}
