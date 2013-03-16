/*
 * initialize a new GeoHeatmap:
 * id,
 * latCol, lngCol,
 * bounds,
 * width, height, x, y, bgmapTileSize, heatmapTileSize
 * 
 * 
 * three layers: bgmap, heatmap, actionmap
 * brushFilter
 */
var GeoHeatmap = Backbone.Model.extend({
		
	/**
	 * @memberOf GeoHeatmap
	 */
	initDataTiles : function(){
		
		var geoBinBounds = this.getBinBounds();
		console.log( geoBinBounds );
		
		var cols = [ this.get("latCol"), this.get("lngCol") ];
		var zms = [ this.getZoom(), this.getZoom() ];
		var startBins = [geoBinBounds.latStart, geoBinBounds.lngStart];
		var endBins = [geoBinBounds.latEnd, geoBinBounds.lngEnd];
		
		var brushFilter = this.getBrushFilter();
		if(brushFilter){
			var rangeSelection;
			for (var i = 0; i < brushFilter.length; i++){
				rangeSelection = brushFilter.at(i);
				cols.push(rangeSelection.get("x").col);
				zms.push(rangeSelection.get("x").zoom);
				startBins.push(rangeSelection.get("x").start);
				endBins.push(rangeSelection.get("x").end);
				if (rangeSelection.has("y")){
					cols.push(rangeSelection.get("y").col);
					zms.push(rangeSelection.get("y").zoom);
					startBins.push(rangeSelection.get("y").start);
					endBins.push(rangeSelection.get("y").end);
				}
			}
		}
		
		var tiles = dataManager.getTiles_deprecated(cols, zms, startBins, endBins);
		this.set("dataTiles", tiles);
	},
	
	process : function(){
		var processor = this.get("processor");
		//processor.set("gl", this.get("heatmapGLCtxt"));
		processor.set("geoHeatmap", this);
		processor.run();
	},
	
	render : function(){
		var renderer = this.get("renderer");
		renderer.set("geoHeatmap", this);
		renderer.run();
	},
	
	
	//x1,x2,y1,y2
	getBinBounds : function(){
		var map = this.get("bgmap");
		var pixPerBin = this.get("pixPerBin");
		//var bgmapTileSize = this.get("bgmapTileSize");
		
		var swAbsPix = map.containerPointToLayerPoint([0, this.get("height")]).add(map.getPixelOrigin()) ;
		var neAbsPix = map.containerPointToLayerPoint([this.get("width"),0]).add(map.getPixelOrigin()) ;
		//console.log(map.getPixelOrigin());
		
		return{ latStart: Math.floor(neAbsPix.y/pixPerBin), latEnd: Math.ceil(swAbsPix.y/pixPerBin), 
				lngStart: Math.floor(swAbsPix.x/pixPerBin), lngEnd: Math.ceil(neAbsPix.x/pixPerBin) };
	},
	
	getZoom : function(){
		return this.get("bgmap").getZoom();
	},
	
	getBrushFilter : function(){
		return this.get("brushFilter");
	},
	
	initialize : function() {
		
		var ID = this.get("id");
		if (d3.select("#"+ID).empty())
			d3.select("body").append("div").attr("id", ID).attr("class", "vis")
				.attr("style", "display:block; width: " + this.get("width") + "px; height: " + this.get("height") + "px; position: absolute; left: " + this.get("x") + "px; top: " + this.get("y") + "px;")
				.attr("pointer-events", "none");
		
		if (!this.get("bgmap")) {
			
			this.set({
				bgmap : new L.Map(ID),
				
			});
			
		}
		this.set("minZm", this.get("bgmap").getBoundsZoom(this.get("bounds"), false));
		this.set("maxZm", this.get("minZm"));
		var tileLayer = new L.TileLayer(GeoHeatmap.CloudmadeUrl, {tileSize:this.get("bgmapTileSize"), minZoom: this.get("minZm"), 
			maxZoom: this.get("maxZm"), styleId: 72337});
		//console.log(this.get("bounds").getCenter());
		this.get("bgmap").setView( this.get("bounds").getCenter(), this.get("minZm") ).addLayer(tileLayer);
		
		
		d3.select("body").append("canvas").attr("id", "canvas-"+ID).attr("class", "vis")
				.attr("width", this.get("width")).attr("height", this.get("height"))
				.attr("style", "position: absolute; left: " + this.get("x") + "px; top: " + this.get("y") + "px;")
				;
		this.set("heatmap", document.getElementById("canvas-"+ID));
		this.set("heatmapGLCtxt", this.get("heatmap").getContext("experimental-webgl", { depth: false, preserveDrawingBuffer: true }));
		
		this.set({
			processor : new WebGLGeoProcessor({
									latCol: this.get("latCol"), 
									lngCol: this.get("lngCol"), 
									gl: this.get("heatmapGLCtxt"),
											}),
											
			renderer : new WebGLGeoRenderer({
									geoheatmap : this,
									latCol: this.get("latCol"), 
									lngCol: this.get("lngCol"), 
									gl: this.get("heatmapGLCtxt"),
									bgmap: this.get("bgmap"),
									mapWidth : this.get("width"),
									mapHeight : this.get("height"),
									pixPerBin: this.get("pixPerBin")
											}),
		});
	},
	
},{
	//MAX_LATITUDE: 85.0840591556,
	//R_MINOR: 6356752.3142,
	//R_MAJOR: 6378137,
	CloudmadeUrl : 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/72337/256/{z}/{x}/{y}.png',
	CloudmadeAttribution : 'Map data &copy; OpenStreetMap contributors, Imagery &copy; CloudMade',
	
	
});