var DataUtil = Backbone.Model.extend({
	
//	defaults : function() {
//		return {
//			//scale: ["linear", ""];
//		};
//	},

	initialize : function() {

	},

}, {
	/**
	 * @memberOf DataUtil, static
	 */
	createTexture: function(gl, wd, ht, img){
		var texture = gl.createTexture();
		
		gl.bindTexture(gl.TEXTURE_2D, texture);
		if (img)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		else
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, wd, ht, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		    
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		//gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		return texture;
	},
	
	rollup : function(tile, meta, cols, offsets, dim2rollup, ranges){
		
		var result = [];
		
		var rollupCols = Object.keys(ranges);//.foreach(function(v){return parseInt(v);});
		
		var alphaLo = ranges[ rollupCols[0] ][0];
		var alphaHi = ranges[ rollupCols[0] ][1];
		var alphaOffset = offsets[ cols.indexOf( parseInt(rollupCols[0]) ) ];
		
		var betaLo = ranges[ rollupCols[1] ][0];
		var betaHi = ranges[ rollupCols[1] ][1];
		var betaOffset = offsets[ cols.indexOf( parseInt(rollupCols[1]) ) ]; 
		
		var myOffset = offsets[ cols.indexOf( dim2rollup ) ]; 
		
		console.log(alphaLo, alphaHi, alphaOffset, betaLo, betaHi, betaOffset, myOffset);
		
		
		for (var i = 0; i < dataManager.get("metadata")[dim2rollup].binsPerTile; i++){
			
			var sum = 0;
			for ( var j = alphaLo; j<= alphaHi; j++ ){
				
				for (var k = betaLo; k<= betaHi; k++ ){
					
					//console.log(j*alphaOffset + k*betaOffset + i*myOffset, tile[ j*alphaOffset + k*betaOffset + i*myOffset ], tile.length );
					sum +=  tile[ j*alphaOffset + k*betaOffset + i*myOffset ] ;
					
				}
				
			}
			result.push(sum);
		}
		
		return result;
		
	},
	
	computePartialSum : function (tile, meta){
		
		var temp = function( d, otherDims, idx , offset, meta, input, level, partialSums){
			if (idx < 0){

				var sum = 0;
				var count = 0;
				
				//partialSums = [];
				for (var i = 0; i < meta[d].end - meta[d].start + 1; i++){
					
					sum += input[i*meta[d].offset + offset ];
					
					if ( (i+1) % level == 0 || i == meta[d].end - meta[d].start ){
						partialSums.push(sum);
						count++;
						sum = 0;
					}
					
				}
				
				for (var i = count ; i < DataUtil.logCeil( meta[d].end - meta[d].start + 1, 2 )/level; i++)
					partialSums.push(0);

				//return partialSums;
			}
			else {
				for (var j = 0; j < meta[otherDims[idx]].end - meta[otherDims[idx]].start + 1; j++){
					temp( d, otherDims, idx-1, j*meta[otherDims[idx]].offset + offset, meta, input, level, partialSums);
				}
					
			}
		};
		
		//compute partial sums for each dimension 
		for (var d in meta){
			
			var allDims = Object.keys(meta);
			allDims.splice( allDims.indexOf(d), 1 );
			//console.log(d, allDims);
			
			var pSums = [];
			
			//compute first level by summing adjacent pairs
			temp( d, allDims, allDims.length - 1, 0, meta, tile,  2, pSums );
			
			console.log("first level: " + pSums);
			
			//compute higher levels of power of 2 sums
			var tempSums = pSums;
			var tempResults =[];
			var tempLength = DataUtil.logCeil( meta[d].end - meta[d].start + 1, 2 )/2;
			var l = 2;
			while(tempLength > 1){
				
				tempResults = [];
				sum = 0;
				for (var i = 0; i < tempSums.length; i++){
					sum += tempSums[ i ];
					
					if ( (i+1) % 2 == 0 || i == tempSums.length - 1 ){
						tempResults.push(sum);
						sum = 0;
					}
				}
				
//				for (var i = tempResults.length; i < DataUtil.logCeil( tempSums.length, 2 )/2; i++ ){
//					tempResults.push(0);
//				}
				console.log("level " + l + ": " + tempResults);
				tempSums = tempResults;
				pSums = pSums.concat( tempResults );
				tempLength = tempLength/2;
				l++;
			}
			console.log("all: " + pSums);
			
		}
		
//		tile.rawDataLength = tile.length;
//		
//		console.log(tile);
//		
//		
//		
//		return tile;
		
		
		
	},
	
	json2img : function(tile, numPerPix, imgSize, max) {
		
		var cv = document.createElement("canvas");
		var ctxt, img, dat;
		
		//console.log(numPerPix, imgSize, max);
		
		cv.width = imgSize;
		cv.height = imgSize;
		ctxt = cv.getContext("2d");
		img = ctxt.createImageData(cv.width, cv.height);
		dat = img.data;
		
		var val;
		var pixSum = 0, pixMax = 0, dataSum = 0;
		var imgOffset = 0, factor = 1;
		//var countt = 0;
		
		for (var offset = 0; offset < tile.length; ++offset) {	
			val = (!tile[offset]) ? 0 : tile[offset];
			dataSum += val;
			
			switch (numPerPix) {
			case 2:
				val =  DataUtil.normalize( val, !max ? 10000 : max, 32767 );
				dat[imgOffset + 0] = (0x000000FF & val);					//R
				//dat[imgOffset + 1] = (0x80 | ((0x0000FF00 & val) >> 8) );	//G
				dat[imgOffset + 1] = (0x0000FF00 & val) >> 8 ;
//				if (countt == 0 )	console.log( tile[offset], max, val, dat[imgOffset + 0], dat[imgOffset + 1] );
//				countt++;
				imgOffset += 2;
				pixSum += val;
				factor = max > 32767 ? 32767/max : 1;
				if (val > pixMax)	pixMax = val;
				break;
			case 4:
				val =  DataUtil.normalize( val, !max ? 10000 : max, 255 );
				dat[imgOffset++] = val;
				pixSum += val/255.0;	
				factor = max > 255 ? 255/max : 1;
				if (val/255 > pixMax)	pixMax = val/255;
				break;
			case 1:
				dat[imgOffset + 0] = (0x000000FF & val);					//R
				dat[imgOffset + 1] = ((0x0000FF00 & val) >> 8 );			//G
				dat[imgOffset + 2] = ((0x00FF0000 & val) >> 16);			//B
				dat[imgOffset + 3] = (0x80 | ((0xFF000000 & val) >> 24));	//A
				imgOffset += 4;
				pixSum += val;
				if (val > pixMax)	pixMax = val;
				factor = 1;
				break;
			}
			
			
		}
		for (; imgOffset < dat.length; ++imgOffset) {
			dat[imgOffset] = 0;
		}
		//console.log(pixSum, pixMax);
		img.pixSum = pixSum == 0? -1 : pixSum;
		img.dataSum = dataSum == 0? -1 : dataSum;
		img.pixMax = pixMax == 0? -1 : pixMax;
		img.width = imgSize;
		img.height = imgSize;
		img.factor = factor;
		
		//ctxt.putImageData(img, 0, 0);
		//$('body').append(cv);
		return img;
		//d3.select("body").append(cv);
	},
	
	logCeil : function(x, b) {
		return (x > 0) ? Math.pow(b, Math.ceil(Math.log(x) / Math.log(b)))
				: -Math.pow(b, -Math.ceil(-Math.log(-x) / Math.log(b)));
	},
	
	normalize : function(v, max, upperLim) {
		
		if (v == 0)	return 0;
		
		//var scales = [ "linear", "logarithmic", "square root", "cube root" ];
		var scale = 0;
		//console.log(max);
		//var max = numPerPix == 2? 65535 : 255-1;
		
		if (max < upperLim)	return v;

		switch (scale) {
			case 0:
				return 1 + ~~(v * (upperLim - 1) / max);
				break;
			case 1:
				return 1 + ~~(Math.log(v + Math.E) * 254 / Math.log(max + Math.E));
				break;
			case 2:
				return 1 + ~~(Math.sqrt(v) * 254 / Math.sqrt(max));
				break;
			case 3:
				return 1 + ~~(Math.pow(v, 0.33) * 254 / Math.pow(max, 0.33));
				break;
		}
	}
});