var WebGLProcessor = Backbone.Model.extend({
		
	/**
	 * @memberOf WebGLProcessor
	 */
	run : function(){
		
		//var t1 = Date.now();
		
		var gl = this.get("gl");
		
		//var buffer = isBg? "bgFB" : "fgFB";
		if (!this.get("frameBuffer")) {
			
			this.set({
				frameBuffer : gl.createFramebuffer(),
				//tileIdxLookup : {}
			});
		}
		
		//var fboImg = isBg? "bgFboImg" : "fgFboImg";
		if (!this.get("resultImg")){
			this.set("resultImg", this.createFBOTexture(gl));
			//isBg? this.set("bgFboImg", fimg) : this. set("bgFboImg", fimg);
		}
		
		var tileTexs = this.createTileTextures(gl);
		
		//this.createFBOTexture(gl);
		this.bindTextures(gl, tileTexs, this.get("frameBuffer"));
		//console.log(this.get("tileIdxLookup"));
		
		//var prog = isBg? "bgProg" : "fgProg";
		if (!this.get("program3D")) {
			this.set("program3D", this.createProgram(gl, true, false) );
		}
		
//		var prog3D = this.createProgram(gl, true, false);
//		var prog4D = this.createProgram(gl, false, false);

		
//		this.set("program4D", prog4D);
//		
		this.rollup(gl);
		
		//var t2 = Date.now();
		//console.log(t2-t1);
	},
	
//	getTileDimensionality : function(tileId){
//		var plots = this.get("binnedPlots");
//		var tiles = plots.get("allTiles");
//		return Object.keys(tiles[tileId].meta).length;
//	},
//	
	
	processVisualTile : function(gl, visualTile, vSpec){
		
		if ( visualTile.getNumDataTile() == 0 )
			return;
		
		visualTile.set("pixSum", 0);
		visualTile.set("dataSum", 0);
		
		for (var i in visualTile.getDataTiles()) {
			visualTile.set("pixSum", visualTile.get("pixSum") + 
					this.get("binnedPlots").get("allTiles")[i].pixSum);
			visualTile.set("dataSum", visualTile.get("dataSum") + 
					this.get("binnedPlots").get("allTiles")[i].dataSum);
			//pixsumForAllTiles += visSpecs[s].tile[i].pixSum;	
		}
		//console.log( visualTile.toString(), visualTile.get("pixSum") );
    	
		
		var numDim = visualTile.getDataTileDimensionality();
		
		var prog = numDim < 4? this.get("program3D") : this.get("program4D") ;
		gl.useProgram(prog);
    	
    	var h = vSpec.get("fboHeight") ;
    	var x0 = visualTile.getIdx();

    	//console.log(x0, h);
		
    	this.setProgramParameters(gl, prog, visualTile, vSpec);
		
    	var binTexYPos = this.get("binYLoc");
    	var cols = vSpec.get("cols");
		var binIdx = this.getBinTexIdx(cols);
		
		var fboImg = this.get("resultImg");
		var binTexWd = fboImg.width;
    	var binTexHt = fboImg.height;
    	gl.viewport(0, 0, fboImg.width, fboImg.height);
		
    	this.drawPart(prog,  gl, x0 * vSpec.get("fboWidthPerVTile") * 2/binTexWd,  binTexYPos[binIdx]*2/binTexHt, 
    			(x0 + 1) * vSpec.get("fboWidthPerVTile") * 2/binTexWd, (binTexYPos[binIdx]+h)*2/binTexHt, 
				binTexWd, binTexHt );
    	
//    	console.log( x0 * vSpec.get("fboWidthPerVTile") * 2/binTexWd,  binTexYPos[binIdx]*2/binTexHt, 
//    			(x0 + 1) * vSpec.get("fboWidthPerVTile") * 2/binTexWd, (binTexYPos[binIdx]+h)*2/binTexHt, 
//				binTexWd, binTexHt );
	},
	
	rollup : function(gl){
		var visSpecs = this.get("binnedPlots").get("visSpecs");
		
		this.clear();
		
		var spec;
		for (var s in visSpecs){
			spec = visSpecs[s];
			for (var vTileId in spec.get("visualTiles")){
				//console.log(vTileId);
				this.processVisualTile (gl,  spec.get("visualTiles")[vTileId], spec );
			}
		}
		
		
		if (!this.isBg())	return;
		
		for (var s in visSpecs){
			
			var cols = visSpecs[s].get("cols");
			var binIdx = this.getBinTexIdx(cols);
			
			this.get("binnedPlots").get("rollupStats")[binIdx] =  this.computeMaxPix(gl, visSpecs[s]);
			
			if (visSpecs[s].get("cols").length == 2  ){
				actionManager.updateRangeSlider( this.get("binnedPlots").get("rollupStats")[binIdx][2] * 255,
						this.get("binnedPlots").get("rollupStats")[binIdx][0] * 255);
			}
			
			//console.log( binIdx, this.get("binnedPlots").get("rollupStats")[binIdx][0]*255  );
		}
		
		//console.log("read fbo");
	},
	
	computeMaxPix : function(gl, spec){
		
		var w, h;
		var cols = spec.get("cols");
		if (cols.length == 1){
			w = spec.get("fboWidthPerVTile") * spec.getNumVisualTiles(); //dataManager.get("metadata")[ cols[0] ].binsPerTile;
			h = 1;
		}
		else {
//			var r = cols[0], c = cols[1];
//			w = r <= c? dataManager.get("metadata")[r].binsPerTile : dataManager.get("metadata")[c].binsPerTile;
//			h = r==c ? 1 : r < c ? dataManager.get("metadata")[c].binsPerTile : dataManager.get("metadata")[r].binsPerTile;
			w = spec.get("fboWidthPerVTile") * spec.getNumVisualTiles();
			h = spec.get("fboHeight");
		}

		//console.log(w,h);
		var pix = new Uint8Array(w*h*4);
		
		var binTexYPos = this.get("binYLoc");
    	var binIdx = this.getBinTexIdx( cols );
		
		gl.readPixels(0, binTexYPos[binIdx], w, h, gl.RGBA,gl.UNSIGNED_BYTE, pix);
		//console.log(0, binTexYPos[binIdx], w, h);
		
		var max = 0, min = 1000, s= 0;
		var v;
		
		var heatmap = [];

		for (var i = 0; i < w * h * 4; i+=4){
			//if (packing4Bytes){
				v = pix[i+3] * Math.pow(2, 24) + pix[i+2] * Math.pow(2,16) + pix[i+1] * Math.pow(2,8) + pix[i];	
//			} else {
//				v = pix[i];
//			}
			heatmap.push(v);
			s += v;
			if (v > max )
				max = v;
			if (v < min && v > 0.003 * 255) //&& v > 0.003 * 255
				min = v;
		}
		//if (cols.length == 1 && cols[0] == 2)	console.log(heatmap, heatmap.length, d3.sum(heatmap));
		return [max/(255.0), s/(w * h * 255.0 ), min/255.0];
	},
	
	
	rollup_old : function(gl){
		var visSpecs = this.get("binnedPlots").get("visSpecs");
		
		for (var s in visSpecs){
			
			visSpecs[s].set("pixSum", 0);
    		visSpecs[s].set("dataSum", 0);
    		
    		for (var i in visSpecs[s].get("dataTiles")) {
				visSpecs[s].set("pixSum", visSpecs[s].get("pixSum") + 
						this.get("binnedPlots").get("allTiles")[i].pixSum);
    			visSpecs[s].set("dataSum", visSpecs[s].get("dataSum") + 
    					this.get("binnedPlots").get("allTiles")[i].dataSum);
    			//pixsumForAllTiles += visSpecs[s].tile[i].pixSum;	
			}
//    		console.log(visSpecs[s].get("pixSum"));
//    		console.log(visSpecs[s].get("dataSum"));
    	}
    	
    	//retrieve the relevant textures, bind them to gl context
    	
    	//pixsumForAllTiles = 0;

		var temp = Object.keys(visSpecs);
		
		//var that = this;
    	temp.sort(function(a,b){ return visSpecs[a].getTileDimensionality() - 
    										visSpecs[b].getTileDimensionality(); });
		
    	var i, binIdx;
    	
    	
    	var drawn = {};
    	var h, p = visSpecs[temp[0]].getTileDimensionality();
    	var binTexYPos = this.get("binYLoc");
    	var binTexWd = this.get("resultImg").width;
    	var binTexHt = this.get("resultImg").height;
    	//console.log(p);
    	
    	var prog;
    	prog = p < 4? this.get("program3D") : this.get("program4D") ;
		gl.useProgram(prog);
    	var fboImg = this.get("resultImg");
    	gl.viewport(0, 0, fboImg.width, fboImg.height);
		
    	var specCols; 
    	
		for (var j = 0; j < temp.length; j++){
			
			i = temp[j];
			specCols =  visSpecs[i].get("cols");
			
    		binIdx = this.getBinTexIdx( specCols );
    		//console.log( visSpecs[i].get("cols"), binIdx );
    		
    		if (drawn.hasOwnProperty(binIdx) )		continue;
    		
    		if ( visSpecs[i].getTileDimensionality() != p ) {
    			p = visSpecs[i].getTileDimensionality() ;
    			prog = p < 4? this.get("program3D") : this.get("program4D") ;
    			gl.useProgram(prog);
    		}

    		if (visSpecs[i].get("type") == VisSpec.visTypes.hist || 
    				visSpecs[i].get("type") == VisSpec.visTypes.area){
    			h = 1;					
    		}
    		else {
    			h = this.get("binnedPlots").get("maxBinCnt");				
    		}
	    	
    		//console.log(h, binTexWd, binTexHt);
    		
	    	this.setProgramParameters(gl, prog, visSpecs[i]);
    		
	    	this.drawPart(p < 4? this.get("program3D") : this.get("program4D"),  gl, 0, binTexYPos[binIdx]*2/binTexHt, 
										2, (binTexYPos[binIdx]+h)*2/binTexHt, 
										binTexWd, binTexHt );
	    	
	    	drawn[binIdx] = true;
    		
//    		if (isBg){
	    	
				this.get("maxValueForSpec")[binIdx] =  
							this.computeMaxPix(gl, specCols, false);
				console.log( binIdx, this.get("maxValueForSpec")[binIdx]  );
//    			
//    		}
    		
    	}

	},
	
	computeMaxPix_old : function(gl, cols, packing4Bytes){
		
		var w, h;
		if (cols.length = 1){
			w = dataManager.get("metadata")[ cols[0] ].binsPerTile;
			h = 1;
		}
		else {
			var r = cols[0], c = cols[1];
			w = r <= c? dataManager.get("metadata")[r].binsPerTile : dataManager.get("metadata")[c].binsPerTile;
			h = r==c ? 1 : r < c ? dataManager.get("metadata")[c].binsPerTile : dataManager.get("metadata")[r].binsPerTile;
		}

		//console.log(w,h);
		var pix = new Uint8Array(w*h*4);
		
		var binTexYPos = this.get("binYLoc");
    	var binIdx = this.getBinTexIdx( cols );
		
		gl.readPixels(0, binTexYPos[binIdx], w, h, gl.RGBA,gl.UNSIGNED_BYTE, pix);
		//console.log(0, binTexYPos[binIdx], w, h);
		
		var max = 0;
		var v;
		//var l = visSpecs[r+"-"+c].xlevel;
		
//		for (var i = 0; i < w * h * 4; i+=4*l ){
//			v = 0;
//			for ( var j = 0; j < l; j++){
//				if (!pix[i+j*4])	break;
//				v += pix[i + j*4];
//			}
		for (var i = 0; i < w * h * 4; i+=4){
			if (packing4Bytes){
				v = pix[i] * Math.pow(2, 24) + pix[i+1] * Math.pow(2,16) + pix[i+2] * Math.pow(2,8) + pix[i+3];	
			} else {
				v = pix[i];
			}
			
			
			if (v > max )
				max = v;
			//console.log(v);
		}
		
		//console.log(max);
		
		return max/255.0;
		
		//return max/(255.0*l);	
	},
	
	drawPart: function(prog, gl, x1, y1, x2, y2, wd, ht){
		var positionLocation = gl.getAttribLocation(prog, "a_position");
		var buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(
			gl.ARRAY_BUFFER, 
			new Float32Array([
				-1.0+x1, -1.0+y1, 
				-1.0+x2, -1.0+y1, 
				-1.0+x1,  -1.0+y2, 
				-1.0+x1,  -1.0+y2, 
				 -1.0+x2, -1.0+y1, 
				 -1.0+x2,  -1.0+y2]), 
			gl.STATIC_DRAW);
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		//gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		// draw
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	},
	
	getYPosOnFBO : function (vSpec){
		var cols = vSpec.get("cols");
		var idx = this.getBinTexIdx(cols);
		return this.get("binYLoc")[ idx ];
	},
	
	setProgramParameters : function(gl, currentProgram, visTile, visSpec){
		var cols = visSpec.get("cols");
		var idx = this.getBinTexIdx(cols);
		
		//assuming all tiles need to draw this vis have same dimensions/zoom levels
		var tileCols = [];
		var binCnts = [];
		
		var dataTile = this.get("binnedPlots").get("allTiles")[visTile.getFirstDataTileId()];
			//this.get("binnedPlots").get("allTiles")[visSpec.get("dataTiles")[0]];
		//console.log(visTile.getFirstDataTileId(), dataTile);
		
		for (var i in dataTile.meta){
			tileCols.push(parseInt( dataTile.meta[i].dim ));
			binCnts.push( dataTile.meta[i].end - dataTile.meta[i].start + 1 );
		}

//		//var currentProgram = tileCols.length < 4 ? this.get("program3D") : this.get("program4D"); //cols4D.length < 4? programs.buffer3D : programs.buffer;
//		console.log(tileCols);
//		console.log(binCnts);
		
    	gl.uniform2f(currentProgram.cols, tileCols.indexOf(cols[0]), cols.length == 1 ? tileCols.indexOf(cols[0]) : tileCols.indexOf(cols[1]) );
    	gl.uniform4f(currentProgram.binCnts, binCnts[0], binCnts[1], binCnts[2], 
				tileCols.length < 4 ? 0: binCnts[3]);
    	
    	//console.log(binCnts[0], binCnts[1], binCnts[2]);
    	
    	gl.uniform1f(currentProgram.binXPos,  visTile.getIdx() * visSpec.get("fboWidthPerVTile") );
    	gl.uniform1f(currentProgram.binYPos,  this.get("binYLoc")[ idx ] );
    	gl.uniform4f(currentProgram.offsets, 1, binCnts[0], binCnts[0]*binCnts[1],
				tileCols.length < 4 ? 0: binCnts[0]*binCnts[1]*binCnts[2]);
		gl.uniform1f(currentProgram.numDataTiles, visTile.getNumDataTile());
		gl.uniform1f(currentProgram.maxCnt, visTile.get("pixSum")/visTile.getNumDataTile());

//		console.log( visTile.getNumDataTile() );
//		console.log( visTile.getIdx() * visSpec.get("fboWidthPerVTile")  );
//    	console.log(this.get("binYLoc")[ idx ]);	
//		console.log( Object.keys(visSpec.get("dataTiles")).length );
//		
		var textureLoc, loLoc, hiLoc, texWdLoc;
		var count = 0;
		for (var tileId in visTile.getDataTiles() ) {
			
			
			var rangeInfo = visTile.getDataTiles()[tileId];
			
			//console.log(rangeInfo);
			
			textureLoc = count == 0 ? currentProgram.texture0 : count == 1 ? currentProgram.texture1 : count == 2 ? currentProgram.texture2 : currentProgram.texture3;
			loLoc = count == 0 ? currentProgram.lo0 : count == 1 ? currentProgram.lo1 : count == 2 ? currentProgram.lo2 : currentProgram.lo3;
			hiLoc = count == 0 ? currentProgram.hi0 : count == 1 ? currentProgram.hi1 : count == 2 ? currentProgram.hi2 : currentProgram.hi3;
			texWdLoc = count == 0 ? currentProgram.textureWd0 : count == 1 ? currentProgram.textureWd1 : count == 2 ? currentProgram.textureWd2 : currentProgram.textureWd3;

//			console.log(textureLoc, loLoc, hiLoc, texWdLoc);
			
			gl.uniform1i(textureLoc,  this.get("tileIdxLookup")[tileId] );
			
			//console.log(  this.get("tileIdxLookup")[tileId]  );
			
			if (this.isBg()){
				gl.uniform4f(loLoc, 0, 0, 0, 0);
				
				gl.uniform4f(hiLoc, rangeInfo[ tileCols[0] ].tileEnd - rangeInfo[ tileCols[0] ].tileStart, 
						rangeInfo[ tileCols[1] ].tileEnd - rangeInfo[ tileCols[1] ].tileStart, 
						rangeInfo[ tileCols[2] ].tileEnd - rangeInfo[ tileCols[2] ].tileStart,
						tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].tileEnd - rangeInfo[ tileCols[3] ].tileStart);
			}
			else {
				gl.uniform4f(loLoc, rangeInfo[ tileCols[0] ].relStart, rangeInfo[ tileCols[1] ].relStart, rangeInfo[ tileCols[2] ].relStart,
						tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].relStart);
				
				gl.uniform4f(hiLoc, rangeInfo[ tileCols[0] ].relEnd, rangeInfo[ tileCols[1] ].relEnd, rangeInfo[ tileCols[2] ].relEnd,
						tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].relEnd);
				
//				console.log(rangeInfo[ tileCols[0] ].relStart, rangeInfo[ tileCols[1] ].relStart, rangeInfo[ tileCols[2] ].relStart,
//						tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].relStart);
//				console.log(rangeInfo[ tileCols[0] ].relEnd, rangeInfo[ tileCols[1] ].relEnd, rangeInfo[ tileCols[2] ].relEnd,
//						tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].relEnd);
//				console.log("");
			}
			
			
			gl.uniform1f(texWdLoc, this.get("binnedPlots").get("allTiles")[tileId].width);
			gl.uniform1f(currentProgram.dataTileFactor, this.get("binnedPlots").get("allTiles")[tileId].factor);
//			console.log(tileId,  this.get("binnedPlots").get("allTiles")[tileId].factor );
//			console.log(this.get("tileIdxLookup")[tileId], this.get("binnedPlots").get("allTiles")[tileId].width);
			
//			console.log( rangeInfo[ tileCols[0] ].start, rangeInfo[ tileCols[1] ].start, rangeInfo[ tileCols[2] ].start,
//					tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].start );
//			console.log( rangeInfo[ tileCols[0] ].end, rangeInfo[ tileCols[1] ].end, rangeInfo[ tileCols[2] ].end,
//					tileCols.length < 4 ? 0: rangeInfo[ tileCols[3] ].end );
//
			count++;
			
			//console.log(tileId);
			
		}
		//console.log("");
	},
	
	bindTextures : function(gl, tileTexs, rttFramebuffer){
		//var rttFramebuffer = this.get("rttFrameBuffer");
		
		gl.bindFramebuffer(gl.FRAMEBUFFER, rttFramebuffer);

		//var numTiles = Object.keys(dataTiles).length;
		//console.log(numTiles);

		var rollupTexture = this.get("resultImg");
		//console.log(rollupTexture);
		
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, rollupTexture, 0);
		
		
		var tex;
		for (var c = 0; c < tileTexs.length; c++){
			tex = tileTexs[c];
			gl.activeTexture(gl.TEXTURE0 + c);
			gl.bindTexture(gl.TEXTURE_2D, null); 
			gl.bindTexture(gl.TEXTURE_2D, tex); 
			
			this.get("tileIdxLookup")[tex.id] = c;
			//console.log(tex);
		}
	},
	
	getBinTexIdx : function(cols){
		
		if (cols.length == 1)
			return cols[0];
		else {
			if (cols[0]<=cols[1])
				return cols[0]+"-"+cols[1];
			else
				return cols[1]+"-"+cols[0];
		}
	},
	
	
	//x (horizontal): num visual tiles
	//y (vertical): numSpecs
	createFBOTexture : function(gl){
		var visSpecs = this.get("binnedPlots").get("visSpecs");
		var temp = Object.keys(visSpecs);
    	temp.sort(function(a,b){ return visSpecs[a].get("type") - visSpecs[b].get("type"); });
    	
    	var binTexYPos = {};
    	var key, binIdx, count = 0;
    	//var maxBinCnt = this.get("binnedPlots").get("maxBinCntPerTile");
    	
    	//console.log(maxBinCnt);
    	
    	for (var j = 0; j < temp.length; j++){
    		key = temp[j];
    		binIdx = this.getBinTexIdx( visSpecs[key].get("cols") );
    		
    		if ( binTexYPos.hasOwnProperty(binIdx) )	continue;
    		
    		binTexYPos[binIdx] = count;
    		count += visSpecs[key].get("fboHeight") ;
    		
//    		if (visSpecs[key].type == VisSpec.visTypes.hist || visSpecs[key].type == VisSpec.visTypes.area){
//    			binTexYPos[binIdx] = count++;
//    		}
//    		else {
//    			binTexYPos[binIdx] = count;
//    			count+= visSpecs[key].get("heightOnFBO") ;			
//    		}
    		//console.log(count);
    	
    		//console.log(binIdx, binTexYPos[binIdx]);
    	}
		
		var binTexWd = DataUtil.logCeil(this.get("binnedPlots").get("fboWidth"),2);
		var binTexHt = DataUtil.logCeil(count, 2);
		var tex = DataUtil.createTexture(gl, binTexWd, binTexHt);
		tex.width = binTexWd;
		tex.height = binTexHt;
		console.log("fbo size: ", binTexWd, binTexHt);
		this.set("binYLoc", binTexYPos);
		//this.set("resultImg",  tex);
		
		return tex;
	},
	
	createProgram : function(gl, is3D, packing4Bytes){
		var p  = gl.createProgram();
		gl.attachShader(p, Shaders.getVertexShader(gl));
		
		if (is3D){
			
			switch (DataManager.numPerPix){
				case 4:
					gl.attachShader(p, Shaders.getQueryShader3D_1Byte(gl));
					break;
				case 2:
					gl.attachShader(p, Shaders.getQueryShader3D_2Bytes(gl))	;
					break;
				case 1:
					gl.attachShader(p, Shaders.getQueryShader3D_4Bytes(gl))	;
					break;
			}
			
		}
		else
			gl.attachShader(p, Shaders.getQueryShader4D_1Byte(gl));
		
		gl.linkProgram(p);
		p.cols = gl.getUniformLocation(p, "u_cols");
		p.binCnts = gl.getUniformLocation(p, "u_binCnts");
		p.binXPos = gl.getUniformLocation(p, "u_xLoc");
		p.binYPos = gl.getUniformLocation(p,"u_yLoc");
		p.offsets = gl.getUniformLocation(p, "u_offsets");
		p.numDataTiles = gl.getUniformLocation(p, "u_numTiles");
		p.textureWd0 = gl.getUniformLocation(p, "u_texw0");		
		p.textureWd1 = gl.getUniformLocation(p, "u_texw1");	
		p.textureWd2 = gl.getUniformLocation(p, "u_texw2");	
		p.textureWd3 = gl.getUniformLocation(p, "u_texw3");	
		p.dataTileFactor = gl.getUniformLocation(p,"u_factor");
		p.lo0 = gl.getUniformLocation(p, "u_lo0");
		p.lo1 = gl.getUniformLocation(p, "u_lo1");
		p.lo2 = gl.getUniformLocation(p, "u_lo2");
		p.lo3 = gl.getUniformLocation(p, "u_lo3");
		p.hi0 = gl.getUniformLocation(p, "u_hi0");
		p.hi1 = gl.getUniformLocation(p, "u_hi1");
		p.hi2 = gl.getUniformLocation(p, "u_hi2");
		p.hi3 = gl.getUniformLocation(p, "u_hi3");
		p.maxCnt = gl.getUniformLocation(p,"u_maxCnt");
		p.texture0 = gl.getUniformLocation(p, "u_data0");
		p.texture1 = gl.getUniformLocation(p, "u_data1");
		p.texture2 = gl.getUniformLocation(p, "u_data2");
		p.texture3 = gl.getUniformLocation(p, "u_data3");
		return p;
	},

	createTileTextures: function(gl){
		
		var plots = this.get("binnedPlots");
		var tiles = plots.get("allTiles");
		
		
		var maxPixSum = 0;
		
		
		//convert the tiles to img textures
		
		var tileTexs = []; 
		var tex, tile;
		
		for (var i in tiles){
			
			if (this.get("tileTextures").hasOwnProperty(i) ){
				tileTexs.push(this.get("tileTextures")[i]);
				continue;
			}
			
			tile = tiles[i];
			
			tex = DataUtil.createTexture(gl, tile.width, tile.height, tile );
			tex.meta = tile.meta;
			tex.dataSum = tile.dataSum;
			tex.id = tile.id;

			tex.width = tile.width;
			tex.height = tile.height;				
			tex.pixMax = tile.pixMax;
			tex.pixSum = tile.pixSum;
			
			this.get("tileTextures")[i] = tex;
			tileTexs.push(tex);
			
			
			//console.log(tiles[i]);
			//c++;
			
			if (tiles[i].pixSum > maxPixSum)
				maxPixSum = tiles[i].pixSum;
		}
		this.set("maxPixSum", maxPixSum);
		//console.log(maxPixSum);
		
		this.set("dataTileTextures", tileTexs);
		return tileTexs;
		
	},
	
	initialize : function() {
		
		
		this.set("programs", {});
		this.set("tileIdxLookup", {});
		_.bindAll(this, 'rollup');
		this.set("tileTextures", {});
	},
	
	clear : function(){
		var gl = this.get("gl");
		gl.clearColor(0.0, 0.0, 0.0, 0.0);                      // Set clear color to black, fully opaque  
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
	},
	
	isBg : function(){
		return this.get("isBg");
	}
	
});