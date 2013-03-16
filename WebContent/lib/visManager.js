var VisManager = Backbone.Model.extend({
		
	/**
	 * @memberOf VisManager
	 */
	containerPtToBinIndex : function(dim, pt, zm){
		
		if ( dataManager.get("meta")[dim].type == DataManager.dataTypes.latitude ){
			
			
			
		} else if ( dataManager.get("meta")[dim].type == DataManager.dataTypes.longitude ){
			
		} else {
			
		}
		
	},
	
	generateVis : function(){
		
		VisManager.updateStatus(false);
		d3.selectAll(".vis").style("display","block");
		
		//console.log(dataManager.get("cache"));
//		var charts = this.get("charts");
//		for (var i = 0; i < charts.length; i++)
//			charts[i].init();
		
//		var maps = this.get("geoHeatmaps");
//		for (var i = 0; i < maps.length; i++){
//			maps[i].initDataTiles();
//			maps[i].process();
//			maps[i].render();
//		}
		
		var plots = this.get("charts");
		for (var i = 0; i < plots.length; i++){
			plots[i].initPlot();
			//plots[i].initDataTiles();
//			plots[i].visualizeBg();
//			plots[i].brush();
			
			plots[i].reprocess();
			plots[i].repaint();
		}
			
	},
	
//	brush : function(){
//		var d1 = new DimInfo, d2 = new DimInfo;
//		d1.setInfo(2, 0, 8, 8);
//		var bf = {
//			2 : d1,
//			//2 : {start: 0, end: 1, zoom: 0},
//			//1 : {start: 300, end: 600, zoom: 4},
//		};
//		for (var i = 0; i < plots.length; i++){
//			plots[i].brush(bf);
//		}
//	},
	
	displayConstructionUI : function(){
		VisManager.updateStatus(false);
		d3.selectAll(".spec").style("display","block");
		generateTileSpecs();
	},
	
	defaults : function() {
		return {
			charts : [],
			geoHeatmaps : [],
		};
	},

	
	initialize : function() {
		if (!this.get("charts")) {
			this.set({
				charts : [],
				geoHeatmaps : [],
			});
		}
		_.bindAll(this, 'repaintGeoPlots');
	},
	
	addCharts: function(c){
		this.get("charts").push(c);
	},
	
	repaintGeoPlots : function(){
		var plots = this.get("charts");
		for (var i = 0; i < plots.length; i++){
			//plots[i].repaintGeo();
			plots[i].get("fgRenderer").run();
		}
		//console.log(actionManager.getColors());
	},
	
	addGeoHeatmap: function(m){
		this.get("geoHeatmaps").push(m);
	},
	
},{
	updateStatus : function(visible, msg ){
		
		if (visible){
			if (!d3.select("#status").empty())
				d3.select("#status").remove();
			//console.log(d3.select("#geo1").attr("z-index"));
			d3.select("body").append("div").attr("id", "status").attr("class", "leaflet-control");
			d3.select("#status").style("display","inline-block");
		}
		else
			d3.select("#status").style("display","none");
		
		if (msg)
			d3.select("#status").text(msg);
	}
});



//var BrushFilter = Backbone.Collection.extend({
//	
//	model: RangeSelection
//	
//});
//
//var RangeSelection = Backbone.Model.extend({
//	
//	defaults : function() {
//		return {
//			//x : {col: "", start: "", end:""},
//			//y : {col: "", start: "", end:""},
//		};
//	},
//	
//	setSelection : function(dim, c, z, s, e){
//		if (dim == "x")
//			this.set("x", {col: c, zoom:z, start: s, end: e});
//		else
//			this.set("y", {col: c, zoom:z, start: s, end: e});
//	},
//	
//	
//});


