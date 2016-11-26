

//GET CHANGES FROM BACKGROUND
var sensitivity = 20;
var samplesize = 10;
var old = [];
var motion_array = [];

var hidden_ctx = createCanvas("canvas2");
var canvas2 = document.getElementById("canvas2");
canvas2.style.position = 'absolute';
canvas2.style.top = '0px';
canvas2.style.right = '-2000px';

function motionDetection(_samplesize){

	if (_samplesize == undefined) {
		_samplesize = samplesize;
	}
	motion_array = [];
	hidden_ctx.drawImage(video,0,0,w,h);
	sample = hidden_ctx.getImageData(0,0,w,h);
	var buffer = new Uint32Array(sample.data.buffer);

	//ctx.drawImage(video, 0,0,w,h);
	//img = ctx.getImageData(0, 0, width, height);

	// var tl = new Vector(w,h);
	// var br = new Vector(0,0);

	for (var y = 0; y < h; y+=_samplesize) {

		for (var x = 0; x < w; x+=_samplesize) {

			var pos = x + y * w;
			var r = buffer[pos] >> 0 & 0xff;
			var g = buffer[pos] >> 8 & 0xff;
			var b = buffer[pos] >> 16 & 0xff;

  			if (Math.abs(r-old[pos]) > sensitivity) {
  				var c = new Vector(r,g,b);
  				motion_array.push(new Vector(w-x,y,c));
  			}

  			old[pos] = r;
		}

	}

		// show movement bounding box

		//ctx.fillStyle = rgba(255,0,0,0.6);
		//ctx.fillRect(topLeft.x, topLeft.y, box_size.x, bottomRight.x-topLeft.y);

		// target_topLeft.x = tween(target_topLeft.x, tl.x,20);
		// target_topLeft.y = tween(target_topLeft.y, tl.y,20);
		// target_bottomRight.x = tween(target_bottomRight.x, br.x,20);
		// target_bottomRight.y = tween(target_bottomRight.y, br.y,20);

		//ctx.fillRect(target_topLeft.x, target_topLeft, target_bottomRight.x-target_topLeft.x, target_bottomRight.y-target_topLeft.y);
		return motion_array;
}
