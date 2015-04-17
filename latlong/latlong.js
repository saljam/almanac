var latlong = (function () {
	'use strict';
	
	var OCEAN = 0xffff,
		DEGPIXELS = 32,
		leafs = [],
		zoomLevels = new Array(6);

	function ZoomLevel() {
	}
	ZoomLevel.prototype.lookup = function(x, y, tk) {
		var idx = this[tk]
		if (idx === undefined) {
			return undefined;
		}
		return leafs[idx].lookup(x, y, tk);
	};

	function StaticZone(bytes) {
		this.name = String.fromCharCode.apply(null, bytes);
	}
	StaticZone.prototype.lookup = function() {
		return this.name;
	};
	StaticZone.Header = "S".charCodeAt(0);

	function OneBitTile(index0, index1, pixmap) {
		this.index0 = index0;
		this.index1 = index1;
		this.pixmap = pixmap; // unint8array
	}
	OneBitTile.prototype.lookup = function(x, y, tk) {
		var idx = this.index0;
		if (this.pixmap[y&7] & (1<<(x&7)) !== 0) {
			idx = this.index1;
		}
		return leafs[idx].lookup(x, y, tk);
	};
	OneBitTile.Header = "2".charCodeAt(0);

	function Pixmap(pixmap) {
		this.pixmap = pixmap; // unint16array
	}
	Pixmap.prototype.lookup = function(x, y, tk) {
		var xx = x & 7,
			yy = y & 7,
			i = yy*8 + xx,
			idx = this.pixmap[i];
		if (idx === OCEAN) {
			return "";
		}
		return leafs[idx].lookup(x, y, tk);
	};
	Pixmap.Header = "P".charCodeAt(0);

	function parseleafs(buf) {
		var dv = new DataView(buf),
			i = 0,
			j,
			index0, index1;
		while (i < dv.byteLength) {
			if (dv.getUint8(i) === StaticZone.Header) {
				i+= 1;
				j = 0;
				while (dv.getUint8(i+j) !== 0) { // Null-terminated string.
					j+=1;
				}
				leafs.push(new StaticZone(new Uint8Array(buf, i, j)));
				i+= j+1;
			} else if (dv.getUint8(i) === OneBitTile.Header) {
				i+= 1;
				index0 = dv.getUint16(i);
				i+= 2;
				index1 = dv.getUint16(i);
				i+= 2;
				leafs.push(new OneBitTile(index0, index1, new Uint8Array(buf, i, 8)));
				i+= 8;
			} else if (dv.getUint8(i) === Pixmap.Header) {
				i+= 1;
				leafs.push(new Pixmap(new Uint16Array(buf.slice(i, i+128))));
				i+= 128;
			} else {
				console.log("Unknown leaf type: ", dv.getUint8(i));
			}
		}
		console.log("Read " + leafs.length + "leaves.");
	}

	function parsezoom(size, buf) {
		var dv = new DataView(buf),
			z = new ZoomLevel(),
			i;
		
		if (dv.byteLength % 6 !== 0) {
			console.log("Bogus encoded zoom level length.");
			return;
		}
		
		for (i=0; i < dv.byteLength; i+=6) {
			z[dv.getUint32(i)] = dv.getUint16(i+4);
		}
		
		console.log("Read " + Object.keys(z).length + " zoom elements for " + size);
		zoomLevels[size] = z;
	}
	
	function fetch() {
		var i, req;
		
		req = new XMLHttpRequest();
		req.open("GET", "latlong/leafs.dat", true);
		req.responseType = "arraybuffer";
		req.onload = function () {
			if (this.response) {
				parseleafs(this.response);
			}
		};
		req.send(null);
		
		for (i = 5; i >= 0; i--) {
			let size = i;
			req = new XMLHttpRequest();
			console.log("Getting zoom" + i + ".dat");
			req.open("GET", "latlong/zoom" + i + ".dat", true);
			req.responseType = "arraybuffer";
			req.onload = function () {
				if (this.response) {
					parsezoom(size, this.response);
				}
			};
			req.send(null);
		}
	 }
	 
	function tileKey(size, x, y) {
		return ((size&7)<<28) | ((y&((1<<14)-1))<<14) | (x&((1<<14)-1));
	}
	
	function lookup(lat, long) {
		var x = (long + 180) * DEGPIXELS,
			y = (90 - lat) * DEGPIXELS,
			xt, yt, tk, level, zone;
		if (x < 0) {
			x = 0;
		} else if (x >= 360 * DEGPIXELS) {
			x = 360*DEGPIXELS - 1;
		}
		if (y < 0) {
			y = 0;
		} else if (y >= 180*DEGPIXELS) {
			y = 180*DEGPIXELS - 1
		}
				
		for (level = 5; level >= 0; level--) {
			xt = x >> (3+level);
			yt = y >> (3+level);
			tk = tileKey(level, xt, yt);
			zone = zoomLevels[level].lookup(x, y, tk);
			if (zone !== undefined) {
				return zone
			}
		}
		return ""
	}
	
	fetch();
	
	return {
		lookup: lookup,
		leafs: leafs,
		zoomLevels: zoomLevels
	};
}());
