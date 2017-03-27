// MIRROR THE CANVAS
var p = CanvasRenderingContext2D.prototype;



p.triangulate = function(grid_w, grid_h, alpha) {

	if (grid_h == undefined) {
		grid_h = grid_w;
	}

	if (alpha == undefined) {
		alpha = 0.8;
	}

	var ww = Math.ceil(w/grid_w);
	var	hh = Math.ceil(h/grid_h);
    var imgData = this.getImageData(0,0,w,h);
    this.clearRect(0,0,w,h);
    //var sourceBuffer8 = new Uint8Array(imgData.data.buffer);
    //var sourceBuffer8 = new Uint8ClampedArray(imgData.data.buffer);

    var sourceBuffer32 = new Uint32Array(imgData.data.buffer);
    var i =0;
    for(var x = 0; x < w; x += grid_w) {

        for(var y = 0; y < h; y += grid_h) {

          var pos = (x + y * w);
          var b = (sourceBuffer32[pos] >> 16) & 0xff;
          var g = (sourceBuffer32[pos] >> 8) & 0xff;
          var r = (sourceBuffer32[pos] >> 0) & 0xff;
          this.fillStyle = rgba(r,g,b, alpha);

          if (i%2) {
        	   this.fillTriangle(x, y - grid_h, x, y + grid_h, x - grid_w, y );
        	} else {
        	   this.fillTriangle(x - grid_w, y - grid_h, x, y, x - grid_w , y + grid_h);
        	}

        	i++;
        }
      }

}
