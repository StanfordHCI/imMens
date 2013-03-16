/*
 * properties of a visual tile
 * 	containerX: 442
	containerY: 221
	dataSum: 959985
	dataTiles: associative array of objects, 
		an example is 0-768-1023-4x1-512-767-4x4-0-23-0 : {0: {tileStart, selStart, relStart, tileEnd, selEnd, relEnd}}
	dimensions: associative array of DimInfo objects
	idxWithSpec: 3
	pixSum: 959985
	visHeight: 329
	visWidth: 278
	xOffsetPix: 0
	yOffsetPix: 0
 */

var VisualTile = Backbone.Model.extend({
	
	/**
	 * @memberOf VisualTile
	 */
	addDimension : function(dim, zm, start, end){
		
		var dimensions = this.get("dimensions");
		var dimInfo = new DimInfo;
		dimInfo.setInfo(dim, zm, start, end);
		
		dimensions[dim] = dimInfo;
		
	},
	
	setIdx : function(c){
		this.set("idxWithSpec", c);
	},
	
	getIdx : function(){
		return this.get("idxWithSpec");
	},
	
	resetDataTiles : function(){
		
		this.set("dataTiles",{});
				
	},
	
	//not actually adding the tile (with data), but metainfo about the tile and how to use the tile
	addDataTile : function(dTile, print){
		
		var temp = {};
		
		//console.log("meta ", dTile.meta);
		
		for (var m in dTile.meta){
			temp[m] = { tileStart: dTile.meta[m].start, tileEnd: dTile.meta[m].end,
						selStart: dTile.meta[m].start, selEnd: dTile.meta[m].end,
						};
			temp[m].relStart = temp[m].selStart - temp[m].tileStart;
			temp[m].relEnd = temp[m].selEnd - temp[m].tileStart;
			//console.log( dTile.meta[m].start, dTile.meta[m].end );
		}
			
		
		//console.log("temp ", temp);
		
		
//		
//		if (print)
//			console.log(brushFilter, temp);
		
		this.get("dataTiles")[ dTile.id ] = temp;
	},
	
	updateDataTileWithBrushInfo : function(brushFilter){
		
		var dTiles = this.get("dataTiles");
		var temp;
		for (var d in dTiles){
			temp = dTiles[d];
			if (brushFilter){
				
				for (var dim in brushFilter){
					
					if (!temp.hasOwnProperty(dim))	continue;
					
					var brushStart = brushFilter[dim].getStartBin();
					var brushEnd = brushFilter[dim].getEndBin();
					var tileStart = temp[dim].tileStart;
					var tileEnd = temp[dim].tileEnd;
//					temp[dim] = { tileStart: dTile.meta[dim].start, tileEnd: dTile.meta[dim].end,
//							selStart: tileStart < brushStart? brushStart : tileStart, 
//						selEnd: tileEnd < brushEnd ? tileEnd : brushEnd };
					temp[dim].selStart = tileStart < brushStart? brushStart : tileStart;
					temp[dim].selEnd = tileEnd < brushEnd ? tileEnd : brushEnd;
					temp[dim].relStart = temp[dim].selStart - temp[dim].tileStart;
					temp[dim].relEnd = temp[dim].selEnd - temp[dim].tileStart;
				}

			}
			else {
				for (var dim in temp) {
					temp[dim].selStart = temp[dim].tileStart;
					temp[dim].selEnd =  temp[dim].tileEnd;
					temp[dim].relStart = temp[dim].selStart - temp[dim].tileStart;
					temp[dim].relEnd = temp[dim].selEnd - temp[dim].tileStart;
				}
			}
		}
		
		
	},
	
	getDataTiles : function(){
		return this.get("dataTiles");
	},
	
	getNumDataTile : function(){
		return Object.keys( this.get("dataTiles") ).length;
	},
	
	getFirstDataTileId : function(){
		for(var key in this.get("dataTiles")) break;
		return  key ;
	},
	
	getFirstDataTile : function(){
		for(var key in this.get("dataTiles")) break;
		return  this.get("dataTiles")[key] ;
	},
	
	getDataTileDimensionality : function(){
		for(var key in this.get("dataTiles")) break;
		return Object.keys( this.get("dataTiles")[key] ).length;
	},
	
	toString : function(){
		var dimensions = this.get("dimensions");
		var s = "";
		for (var dim in dimensions){
			s += dimensions[dim].toString() + "x";
		}
		return s.substring(0,s.length-1);
	},
	
	getDimensionInfos : function(){
		var r = {};
		for (var k in this.get("dimensions")){
			
			if (parseInt(k) == NaN)
				r[k] = this.get("dimensions")[k];
			else
				r[parseInt(k)] = this.get("dimensions")[k];
			
		}
		return r; //Object.keys(this.get("dimensions"));
	},
	
	getDimensionInfo : function(k){
		//return this.get("dimensions")[dim];
		if (parseInt(k) == NaN)
			return this.get("dimensions")[k];
		else
			return this.get("dimensions")[k];
	},
	
	initialize : function() {
		this.set("dimensions", {});
	},
	
	defaults : function() {
		return {
			
//			type:VisSpec.visTypes.area,  
//			cols: [4],
//			x: 30 + 740,
//			y: 20 + 2*(visHt+padding),
//			width: 290,
//			height: visHt,
//			pixPerBin: [2],
//			startingBinIdx: [0],
//			zmlevels: [0],
//			startBins: [0],
//			endBins: [50]
		};
	},
	
});