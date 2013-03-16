var WebGLGeoRenderer = Backbone.Model.extend({
		
	/**
	 * @memberOf WebGLGeoRenderer
	 */
	
	run : function(){
		
		var gl = this.get("gl");
		
		var tiles = this.get("geoheatmap").get("dataTiles");
		this.setTileParameters(tiles);
		
		if (!this.has("program")){
			var prog = this.createProgram(gl, false);
			gl.useProgram(prog);
			this.set("program", prog);
		}
		
		//console.log(tiles);
		
		this.paint(gl, tiles);
	},
	
	paint : function(gl, dataTiles){
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		var processor = this.get("geoheatmap").get("processor");
	
		//the precessor is webgl based
		if (processor.has("resultImg")){
			var rollupTexture = processor.get("resultImg");
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, null); 
			gl.bindTexture(gl.TEXTURE_2D, rollupTexture); 
			
			gl.clearColor(0.0, 0.0, 0.0, 0.0);                      // Set clear color to black, fully opaque  
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
			
			
			var w = this.get("mapWidth");
			var h = this.get("mapHeight");
			gl.viewport(0, 0, w, h);
			
			//console.log("renderer");
			var tile;
			for (var t = 0; t < dataTiles.length; t++){	
				tile = dataTiles[t];
				
				this.setProgramParameters(gl, tile, processor, 0.5, 0.5);
				
				this.drawPart(gl, tile.containerX*2/w, (h - tile.containerY)*2/h, 
								(tile.containerX + tile.visWidth)*2/w, (h - tile.containerY - tile.visHeight)*2/h, 
								w, h );
			}
		}
		else {}

	},
	
	setProgramParameters : function(gl, dataTile, processor, loColor, hiColor){
		
		var prog = this.get("program");
		var map = this.get("bgmap");
		var latCol = this.get("latCol");
		var lngCol = this.get("lngCol");
		var binSize = dataManager.get("metadata")[latCol].binsPerTile;
		var rollupTexture = processor.get("resultImg");
		var rollupStats = processor.get("rollupStat");
		var pixPerBin = this.get("pixPerBin");
		var tileIdxLookup = processor.get("tileIdxLookup");
		
		
		gl.uniform1f(prog.yLoc, tileIdxLookup[dataTile.id] * binSize);	
		//console.log(dataTile.id, dataTile.texIdx * binSize);
		//console.log(dataTile.meta[latCol].start, dataTile.meta[lngCol].start, dataTile.texIdx * binSize);
		gl.uniform1f(prog.visWd, dataTile.visWidth);
		//console.log(dataTile.width);
		gl.uniform1f(prog.visHt, dataTile.visHeight);
		gl.uniform1i(prog.texture, 0);
		gl.uniform1f(prog.textureWd, rollupTexture.width);
		gl.uniform1f(prog.textureHt, rollupTexture.height);
		gl.uniform1f(prog.canvasWd, this.get("mapWidth"));
		gl.uniform1f(prog.canvasHt, this.get("mapHeight"));
		//gl.uniform1f(prog.texIdx, dataTile.texIdx);
		
		gl.uniform1f(prog.visTileSize, binSize * pixPerBin);
		gl.uniform2f(prog.pixOffsets, dataTile.xOffsetPix, dataTile.yOffsetPix);
		gl.uniform2f(prog.containerPos, dataTile.containerX,   dataTile.containerY );
		
		gl.uniform2f(prog.cols, latCol, lngCol );
		//gl.uniform2f(prog.lats, dataTile.meta[latCol].start, dataTile.meta[latCol].end + 1 );
		
		//console.log(dataTile.binInfo[latCol].min, dataTile.binInfo[latCol].max);
		
		//gl.uniform2f(prog.lngs, dataTile.meta[lngCol].start, dataTile.meta[lngCol].end + 1);
		
		//var topleftLatLng = map.containerPointToLatLng([0,0]);
		//var topleftAbsPix2 = map.latLngToLayerPoint(topleftLatLng).add(map.getPixelOrigin()) ;
		var topleftAbsPix = map.containerPointToLayerPoint([0,0]).add(map.getPixelOrigin()) ;
		gl.uniform2f(prog.pixOrigin, topleftAbsPix.x, topleftAbsPix.y );
		
		gl.uniform1f(prog.exp, this.get("alpha_exp"));
		//console.log(alpha_exp);
		gl.uniform1f(prog.zm, map.getZoom());
		//gl.uniform1f(prog.max, dataTile.pixMax);
		//gl.uniform1f(onscreenProg.localMax, dataTile.dataMax);
		//gl.uniform1f(onscreenProg.globalMax, dataMax);
		gl.uniform1f(prog.bufferMax, rollupStats[0]);
		gl.uniform1f(prog.bufferMin, rollupStats[2]);
		gl.uniform1f(prog.avgPix, rollupStats[1]);
		//console.log(maxBufferPix, avgBufferPix);
		//console.log( dataTile.pixMax );
		
		gl.uniform4f(prog.transformation, 0.5 / Math.PI, 0.5,  -0.5 / Math.PI, 0.5 );
		//gl.uniform3f(onscreenProg.loColor, 1.0, 1.0, 0.321);
		//gl.uniform3f(onscreenProg.hiColor, 1.0, 0.078, 0.078);
		var loC = d3.rgb( this.get("loColors")(loColor) ) ;
		var hiC = d3.rgb( this.get("hiColors")(hiColor) ) ;
		//console.log(loColorValue, loC, hiC);
		gl.uniform3f(prog.loColor, loC.r/255, loC.g/255, loC.b/255);
		gl.uniform3f(prog.hiColor, hiC.r/255, hiC.g/255, hiC.b/255);
		//gl.uniform3f(onscreenProg.color, 1.0, 0.0, 0.0);
		gl.uniform2f(prog.binCnts, dataTile.meta[latCol].end - dataTile.meta[latCol].start + 1, 
				dataTile.meta[lngCol].end - dataTile.meta[lngCol].start + 1  );
		
		//gl.uniform2f(prog.binSteps, dataTile.binInfo[latCol].step, dataTile.binInfo[lngCol].step  );
	},
	
	drawPart : function(gl, x1, y1, x2, y2, wd, ht){
		
		var prog = this.get("program");
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
		//gl.flush();
	},
	
	setTileParameters : function(tiles){
		var map = this.get("bgmap");
		var swAbsPix = map.containerPointToLayerPoint([0, this.get("mapHeight") ]).add(map.getPixelOrigin()) ;
		var neAbsPix = map.containerPointToLayerPoint([this.get("mapWidth"), 0]).add(map.getPixelOrigin()) ;
		var pixPerBin = this.get("pixPerBin");
		
		var latCol = this.get("latCol");
		var lngCol = this.get("lngCol");
		
		//console.log(dataManager.get("metadata"));
		var visTileWidth = dataManager.get("metadata")[lngCol].binsPerTile * pixPerBin;
		var visTileHeight = dataManager.get("metadata")[latCol].binsPerTile * pixPerBin;
		
		var tile;
		for (var i = 0; i < tiles.length; i++){
			tile = tiles[i];
			//containerX: x coord of topleft corner wrp to the container
			//width: visible width of the tile inside the map
			//containerY: y coord of topleft corner wrp to the container
			//height: visible height of the tile inside the map
			//tile.tileX = tile.meta[lngCol].start/256;
			//tile.tileY = tile.meta[latCol].start/256;
			
			tile.containerX = tile.meta[lngCol].start * pixPerBin - swAbsPix.x;
			tile.containerY = tile.meta[latCol].start * pixPerBin - neAbsPix.y;
			tile.xOffsetPix = 0;
			tile.yOffsetPix = 0;
			tile.visWidth = visTileWidth;
			tile.visHeight = visTileHeight;
			
			if (tile.containerX < 0)	{
				tile.visWidth += tile.containerX ;
				tile.containerX = 0;
				tile.xOffsetPix = visTileWidth - tile.visWidth;
			}
			else if (tile.containerX + visTileWidth > this.get("mapWidth") )	
				tile.visWidth = visTileWidth - ( tile.containerX + visTileWidth - this.get("mapWidth") );
				
			if (tile.containerY < 0){
				tile.visHeight = visTileHeight + tile.containerY ;
				tile.containerY = 0;
				tile.yOffsetPix = visTileHeight - tile.visHeight;
			}
			else if (tile.containerY + visTileHeight > this.get("mapHeight") )	
				tile.visHeight = visTileHeight - ( tile.containerY + visTileHeight - this.get("mapHeight") );
			console.log(tile);
		}	
		
		
	},
	
	createProgram : function(gl, packing4bytes){
		
		var p  = gl.createProgram();
		gl.attachShader(p, Shaders.getVertexShader(gl));
		
		gl.attachShader(p, packing4bytes? Shaders.getGeoRenderShader_4Bytes(gl) 
									: Shaders.getGeoRenderShader_1Byte(gl));
							//: shaders.getIdentityFragmentShader(gl));
		gl.linkProgram(p);
		
		p.textureWd = gl.getUniformLocation(p, "u_texw");	
		p.textureHt = gl.getUniformLocation(p, "u_texh");		
		p.texture = gl.getUniformLocation(p, "u_data");
		p.visWd = gl.getUniformLocation(p,"u_visWd");
		p.visHt = gl.getUniformLocation(p,"u_visHt");
		p.binCnts = gl.getUniformLocation(p, "u_binCnts");
		p.cols = gl.getUniformLocation(p, "u_cols");
		p.yLoc = gl.getUniformLocation(p,"u_yLoc");
		
		p.exp = gl.getUniformLocation(p, "u_exp");
		p.visTileSize = gl.getUniformLocation(p, "u_tileSize");
		p.bufferMax = gl.getUniformLocation(p, "u_bufferMax");
		p.bufferMin = gl.getUniformLocation(p, "u_bufferMin");
		p.avgPix = gl.getUniformLocation(p,"u_avgPix");
		p.canvasWd = gl.getUniformLocation(p, "u_canvasWd");
		p.canvasHt = gl.getUniformLocation(p, "u_canvasHt");
		p.pixOffsets = gl.getUniformLocation(p, "u_pixOffsets");
		p.texIdx = gl.getUniformLocation(p,"u_texIdx");
		p.containerPos = gl.getUniformLocation(p,"u_containerPos");
		//p.lats = gl.getUniformLocation(p,"u_lat");
		//p.lngs = gl.getUniformLocation(p,"u_lng");
		p.pixOrigin = gl.getUniformLocation(p,"u_pixOrigin");
		p.zm = gl.getUniformLocation(p,"u_zm");		
		//p.max = gl.getUniformLocation(p,"u_max");
        p.transformation = gl.getUniformLocation(p,"u_trans");
		//p.color = gl.getUniformLocation(p, "u_color" );
		//p.binSteps = gl.getUniformLocation(p, "u_binSteps");
		p.loColor = gl.getUniformLocation(p, "u_loColor" );
		p.hiColor = gl.getUniformLocation(p, "u_hiColor" );
		
		return p;
		
	},
	
	initialize : function() {
		this.set("alpha_exp", 0.33);
		this.set("loColors", d3.scale.linear().domain([0, 1]).range([d3.rgb(255,255,204), d3.rgb(255,255,0)]));
		this.set("hiColors", d3.scale.linear().domain([0, 1]).range([d3.rgb(255,102,153), d3.rgb(204,0,0)]));
	},
	
});