var BinnedPlots = Backbone.Model.extend({
	
	/**
	 * @memberOf BinnedPlots
	 */
	initDataTiles : function(activeSpec){
		
		var allRequiredTiles = {};
		
		var specs = this.get("visSpecs");
		var spec, vTiles, vTile;
		//var brushFilter = this.get("brushFilter");
		
		for (var i in specs){
			spec = specs[i];
			
			vTiles = spec.get("visualTiles");
			
			//console.log(spec.get("type"), Object.keys( vTiles ).length );
			
			for (var vTileId in vTiles){
				
				vTile = vTiles[vTileId];
				
				//console.log(vTile.getDimensions());
				
				var dimInfos = vTile.getDimensionInfos();
				
				if(activeSpec){
					
					var cols = activeSpec.get("cols");
					var tempDimInfo;
					for (var a = 0; a < cols.length; a++){
						
						if ( Object.keys(dimInfos).indexOf(cols[a]) >= 0)
							continue;
						
						tempDimInfo = new DimInfo;
						tempDimInfo.setInfo(cols[a], activeSpec.get("zmLevels")[a], 
									activeSpec.get("startBins")[a], activeSpec.get("endBins")[a]);
						dimInfos[cols[a]] = tempDimInfo;
						//console.log(cols[a], tempDimInfo.toString());
					}
				}
				
				//var tiles = dataManager.getTiles( cols, zms, startBins, endBins );
				var tiles = dataManager.getDataTiles( dimInfos );
				
				//console.log(cols,zms,startBins, endBins, tiles);
				//console.log(tiles);
				
				vTile.resetDataTiles();
				
				for (var j = 0; j < tiles.length; j++){
					if ( !allRequiredTiles.hasOwnProperty( tiles[j].id ))
						allRequiredTiles[ tiles[j].id ] = tiles[j];
					
					
					
//					if (spec.get("cols")[0] == 3)
//						vTile.addDataTile( tiles[j], brushFilter, true );
//					else
						vTile.addDataTile( tiles[j] );
					
					//console.log( spec.toString () + ", visual tile " + vTileId + ", data tile " , tiles[j].meta );
						
					
				}//add data tiles required for each visual tile
				
				
				
				
			}// for each visual tile
			
		
			var numTiles = Object.keys(vTiles).length;
			if (  spec.get("fboWidthPerVTile") * numTiles  > this.get("fboWidth") )
				this.set("fboWidth", spec.get("fboWidthPerVTile") * numTiles );
			
//			var binCntPerDimPerTile, numTiles, cols = spec.get("cols");
//			for (var j = 0; j < cols.length; j++){
//				//binCntPerDimPerTile = dataManager.get("metadata")[cols[j]].binsPerTile;
//				numTiles = Object.keys(vTiles).length; 
//				if (  spec.get("sizeOnFBO") * numTiles  > this.get("fboWidth") )
//					this.set("fboWidth", spec.get("sizeOnFBO") * numTiles );
////				if ( binCntPerDimPerTile  > this.get("maxBinCntPerTile") )
////					this.set("maxBinCntPerTile", binCntPerDimPerTile );
//			}	
			
			//console.log( this.get("maxBinCnt") );
			
		}//for each spec
		
		//console.log("");
		
		//console.log(allRequiredTiles);
		this.set("allTiles", allRequiredTiles);
	},
	
//	process : function(){
//		
//		var processor = this.get("processor");
//		//processor.set("gl", this.get("heatmapGLCtxt"));
//		processor.set("binnedPlots", this);
//		processor.set("gl", this.get("bgCtxt"));
//		processor.run(true);
//	},
//	
//	renderBg : function(){
//		var renderer = this.get("renderer");
//		renderer.set("binnedPlots", this);
//		renderer.set("gl", this.get("bgCtxt"));
//		renderer.run(true);
//	},
	
	visualizeBg : function(){
		for (var s in this.get("visSpecs")){
			this.get("visSpecs")[s].resetVisualTiles();
		}
		
		this.initDataTiles();
		
		this.get("bgProcessor").run();
		this.get("bgRenderer").run();
	},
	
	reprocess: function(activeSpec){
		//this.set("brushFilter", brushFilter);
		for (var s in this.get("visSpecs")){
			this.get("visSpecs")[s].resetVisualTiles();
		}
		
		this.initDataTiles(activeSpec);
		
//		for (var s in this.get("visSpecs")){
//			var vTiles = this.get("visSpecs")[s].get("visualTiles");
//			for (var v in vTiles){
//				console.log( vTiles[v] );
//			}
//		}
		
		this.get("bgProcessor").run();
		this.get("bgRenderer").run();
	},
	
	getVisSpec : function(plots, x, y){
		var spec = undefined;
		
		for (var i in plots.get("visSpecs")){
			spec = plots.get("visSpecs")[i];
			if( spec.get("x") <= x && spec.get("x") + spec.get("width") >= x && 
				spec.get("yFromTop") <= y && spec.get("yFromTop") + spec.get("height") >= y ){
				return spec;
			}
		}
		
		return undefined;
	},
	
	repaint : function(brushFilter){
		
		this.set("brushFilter", brushFilter);
		
		//var t0 = Date.now();
		
		for (var s in this.get("visSpecs")){
			var vTiles = this.get("visSpecs")[s].get("visualTiles");
			for (var v in vTiles){
				vTiles[v].updateDataTileWithBrushInfo(brushFilter);
			}
		}
		
		var t1 = Date.now();
		
//		this.get("bgProcessor").run();
//		this.get("bgRenderer").run();
		
//		var t1 = Date.now();
		
		this.get("fgProcessor").run();
		
		var t2 = Date.now();
		
		this.get("fgRenderer").run();
		
		var t3 = Date.now();
		
		return [t1,t2, t3];
		
//		var t2 = Date.now();
//		
//		console.log(t1-t0, t2-t1);
	},
	
//	brush : function(brushFilter){
//		
//		
//		//for testing purpose
//		//d2.setInfo(1, 4, 300, 600);
////		var d1 = new DimInfo, d2 = new DimInfo;
////		d1.setInfo(2, 0, 8, 8);
////		var bf = {
////			2 : d1,
////			//2 : {start: 0, end: 1, zoom: 0},
////			//1 : {start: 300, end: 600, zoom: 4},
////		};
//		//this.brush(bf);
//		
//		this.set("brushFilter", brushFilter);
//		
//		for (var s in this.get("visSpecs")){
//			this.get("visSpecs")[s].resetVisualTiles();
//		}
//		
//		this.initDataTiles();
//		
//
//		this.get("fgProcessor").run();
//		this.get("fgRenderer").run();
//	},
	
//	clearForeground : function(){
//		this.get("fgRenderer").clear();
//	},
	
//	repaintGeo: function(){
//		this.get("fgRenderer").run();
//	},
	
	
	createCanvas : function(isBg){
		
		var ID = isBg? this.get("id")+"-bg" : this.get("id")+"-fg";
		if (d3.select("#"+ID).empty()){
			d3.select("body").append("canvas").attr("id", ID)
			.attr("width",this.get("width")).attr("height",this.get("height"))
			.attr("style", "position: absolute; left: " + this.get("x") + "px; top: " + this.get("y") + "px;");
		}
		
		this.set(isBg? "bgCtxt" : "fgCtxt", document.getElementById(ID).getContext("experimental-webgl", { depth: false, preserveDrawingBuffer: isBg }));
		
		if (!isBg){
			
			var fgCanvas = document.getElementById(ID);
			var plots = this;
			fgCanvas.addEventListener('mousemove', function(evt) {
				var rect = fgCanvas.getBoundingClientRect(), root = document.documentElement;
				// return relative mouse position
				var x = evt.clientX - rect.left - root.scrollLeft;
				var y = evt.clientY - rect.top - root.scrollTop;
				
				//console.log(x,y);
				actionManager.brush(plots, x, y) ;
				
			}, false);
			
			fgCanvas.addEventListener('mouseout', function(evt) {
				plots.repaint();
			}, false);
			
//			fgCanvas.addEventListener('mousedown', function(evt) {
//				actionManager.initDrag(plots, plots.getCoordInPlots()) ;
//			}, false);
		}
		
	},
	
	getCoordInPlots : function(){
		var evt = window.event;
		var fgCanvas = document.getElementById(this.get("id")+"-fg");
		var rect = fgCanvas.getBoundingClientRect(), root = document.documentElement;
		// return relative mouse position
		var x_pos = evt.clientX - rect.left - root.scrollLeft;
		var y_pos = evt.clientY - rect.top - root.scrollTop;
		//console.log(x_pos, y_pos);
		return {x: x_pos, y: y_pos};
	},
	
	addVisSpec : function(spec){
		spec.set("yFromTop", spec.get("y")) ;
		spec.set("y", this.get("height") - spec.get("yFromTop") - spec.get("height") ) ;
		
		var cols = spec.get("cols");
		var key = cols.join("-");
		this.get("visSpecs")[key] = spec;
		
//		var binCnt0 = dataManager.get("metadata")[cols[0]].binsPerTile;
//		var binCnt1 = cols.length == 1 ? 0 : dataManager.get("metadata")[cols[1]].binsPerTile;
		
		var fboWidthPerTile = dataManager.get("metadata")[cols[0]].binsPerTile;
		if ( cols.length > 1 && dataManager.get("metadata")[cols[1]].binsPerTile > fboWidthPerTile )
			fboWidthPerTile = dataManager.get("metadata")[cols[1]].binsPerTile;
		//height allocated to this spec on the fbo image
		var fboHeight = cols.length == 1 ? 1 : fboWidthPerTile;
		
		spec.set("fboWidthPerVTile", fboWidthPerTile );
		spec.set("fboHeight", fboHeight );
		
		if (cols.length == 1){
			var width = spec.get("type") == VisSpec.visTypes.bar ? spec.get("height") : spec.get("width");
			spec.set("pixPerBin", [width/fboWidthPerTile ]);
			if (width / fboWidthPerTile > 15 ){
				spec.set("histGap", Math.floor(width / fboWidthPerTile - 13) );
			}
			else {
				spec.set("histGap", 1.0 );
			}
		}
		
		
		if (spec.get("type") ==  VisSpec.visTypes.geo){
			
			var divID = "geo-"+spec.get("cols").join("-");
				
			if (d3.select("#"+divID).empty())
				d3.select("body").append("div").attr("id", divID).attr("class", "vis")
					.attr("style", "display:block; width: " + spec.get("width") + "px; height: " + spec.get("height") + "px; position: absolute; left: " + parseInt(this.get("x") + spec.get("x")) + "px; top: " + parseInt(this.get("y") + spec.get("yFromTop")) + "px;")
					.attr("pointer-events", "none");
			
			//console.log( this.get("y"), spec.get("yFromTop"), parseInt(this.get("y") + spec.get("yFromTop")) );
			
			spec.set("bgmap", new L.Map( divID ) );
			
			spec.set("minZm", spec.get("bgmap").getBoundsZoom(spec.get("geoBounds"), false));
			spec.set("maxZm", spec.get("minZm"));
			
			
			var tileLayer = new L.TileLayer(BinnedPlots.CloudmadeUrl, {tileSize:spec.get("bgmapTileSize"), minZoom: spec.get("minZm"), 
				maxZoom: spec.get("maxZm"), styleId: 72337});
			//console.log(this.get("bounds").getCenter());
			spec.get("bgmap").setView( spec.get("geoBounds").getCenter(), spec.get("minZm") ).addLayer(tileLayer);
			
			
		} else {
			
		}
	},
	
	initPlot : function(){
		this.createCanvas(true);
		this.createCanvas(false);
		//svg stuff
		d3.select("body").append("svg").attr("id", this.get("svgLayer"))
			.attr("width",this.get("width")).attr("height",this.get("height")+10)
			.attr("style", "position: absolute;left:"+ this.get("x") +"px; top:" + this.get("y") + "px;")
			.attr("pointer-events","none");
		
		var svgLayer = d3.select("#"+this.get("svgLayer"));
		
		var spec;
		for (var s in this.get("visSpecs")){
			spec = this.get("visSpecs")[s];
			if ( spec.get("type") != VisSpec.visTypes.geo ){
				
				svgLayer.append("g")
					.attr("id", "yaxis"+spec.getSpecId())
					.attr("class", "axis")
					.attr("transform", "translate(" +  parseInt(spec.get("x") - 3)  + ","+ parseInt( 5 + spec.get("yFromTop") ) +")");
			
				svgLayer.append("g")
					.attr("id", "xaxis"+spec.getSpecId())
					.attr("class", "axis")
					.attr("transform", "translate(" + spec.get("x")  + ","+ parseInt( 5 +  spec.get("height") + spec.get("yFromTop") ) +")");
				
				
			}
			
			if (spec.has("label")){
				d3.select("body").append("span").attr("class", "label").text(spec.get("label"))
				.attr("style", "position: absolute; left: " + spec.get("labelLoc")[0] + "px; top: " + spec.get("labelLoc")[1] + "px;");
				
			}
		}
		
		var bgProc = new WebGLProcessor({
						gl: this.get("bgCtxt"),
						binnedPlots: this,
						isBg: true,
					});
		
		var fgProc = new WebGLProcessor({
						gl: this.get("fgCtxt"),
						binnedPlots: this,
						isBg: false,
					});
		
		this.set({
			bgProcessor : bgProc,
					
			bgRenderer : new WebGLRenderer({
						gl: this.get("bgCtxt"),
						binnedPlots: this,
						isBg: true,
						processor: bgProc
					}),
					
			fgProcessor : fgProc,
					
			fgRenderer : new WebGLRenderer({
						gl: this.get("fgCtxt"),
						binnedPlots: this,
						isBg: false,
						processor: fgProc
					})
		});
	},
	
	initialize : function(){
//		var specs = this.get("visSpecs");
//		for (var i = 0; i < specs.length; i++){
//			specs[i].set("yFromTop", specs[i].get("y")) ;
//			specs[i].set("y", this.get("height") - specs[i].get("yFromTop") - specs[i].get("height") ) ;
//			//console.log(specs[i]);
//		}
		
		this.set("visSpecs", {});
		this.set("fboWidth", 0);
		//this.set("maxBinCntPerTile", 0);
		this.set("rollupStats",{});
		this.set("svgLayer", "svgLayer");
		//this.set("activeSpec", undefined);
		

		
		
					
//			processor : new WebGLChartProcessor({
//									binnedPlots : this,
//									//gl: this.get("plotCtxt"),
//											}),
//											
//			renderer : new WebGLChartRenderer({
//									binnedPlots : this,
//									gl: this.get("plotCtxt"),
//									plotsWidth : this.get("width"),
//									plotsHeight : this.get("height"),
//									pixPerBin: this.get("pixPerBin")
//											}),

		
		

	}
},{
	//MAX_LATITUDE: 85.0840591556,
	//R_MINOR: 6356752.3142,
	//R_MAJOR: 6378137,
	CloudmadeUrl : 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/72337/256/{z}/{x}/{y}.png',
	CloudmadeAttribution : 'Map data &copy; OpenStreetMap contributors, Imagery &copy; CloudMade',
	
	
});