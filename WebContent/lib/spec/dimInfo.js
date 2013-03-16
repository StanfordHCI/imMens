/*
 * information about range and zoom level for a dimension, to be used in visual tiles, data tiles and vis specs
*/
var DimInfo = Backbone.Model.extend({
	
	setInfo : function(dim, zm, start, end){
		this.set("info", {dim: dim, zoom:zm, startBin:start, endBin:end});
	},
	
	toString : function(){
		var info = this.get("info");
		return info.dim + "-" + info.zoom + "-" + info.startBin + "-" + info.endBin;
	},
	
	setStartBin : function(s){
		this.get("info").startBin = s;
	},
	
	getStartBin : function(){
		return this.get("info").startBin;
	},
	
	setEndBin : function(e){
		this.get("info").endBin = e;
	},
	
	getEndBin : function(){
		return this.get("info").endBin;
	},
	
	setZoom : function(z){
		this.get("info").zoom = z;
	},
	
	getZoom : function(){
		return this.get("info").zoom;
	},
	
	setDim : function(d){
		this.get("info").dim = d;
	},
	
	getDim : function(){
		return this.get("info").dim;
	},
	
	initialize : function() {
		this.set("info", {});
	},
	
	
});