var VisSpec = Backbone.Model.extend({
		
	/**
	 * @memberOf VisSpec
	 */
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
	
	getNumVisualTiles : function(){
		return Object.keys( this.get("visualTiles") ).length;
	}, 
	
	pixToBin : function(xOrY, pixInVis){
		
		return Math.floor( this.get("startingBinIdx")[xOrY] + pixInVis / this.get("pixPerBin")[xOrY] );

	},
	
	resetVisualTiles : function(){
		
		//var visTiles = {};
		var xTiles = [], yTiles = [];
		var cols = this.get("cols");
		
		var startBin = this.get("startBins")[ 0 ];
		var xBinCnt = dataManager.get("metadata")[ cols[0] ].totalBinCnt;
		var xBinCntPerTile = dataManager.get("metadata")[ cols[0] ].binsPerTile;
		
		//console.log(xBinCnt);
		
		if (xBinCnt/xBinCntPerTile <= 1){
			xTiles.push( [startBin, startBin + xBinCntPerTile - 1, this.get("zmLevels")[0]] );
		}
		else {
			while (  startBin < this.get("startBins")[0] + this.get("width")/this.get("pixPerBin")[0] ){
				xTiles.push([startBin,  xBinCntPerTile * ( Math.floor(startBin/xBinCntPerTile) + 1 ) - 1, this.get("zmLevels")[0]  ] );
				startBin = xBinCntPerTile * ( Math.floor(startBin/xBinCntPerTile) + 1 );
			}
		}
		//visTiles[cols[0]] = xTiles;
		
		if (this.get("startBins").length > 1){
			startBin = this.get("startBins")[1];
			var yBinCnt = dataManager.get("metadata")[ cols[1] ].totalBinCnt;
			var yBinCntPerTile = dataManager.get("metadata")[ cols[1] ].binsPerTile;
			
			if ( yBinCnt/yBinCntPerTile <= 1){
				yTiles.push( [startBin, startBin + yBinCntPerTile - 1, this.get("zmLevels")[1] ] );
			}
			else {
				while (  startBin < this.get("startBins")[1] + this.get("height")/this.get("pixPerBin")[1] ){
					yTiles.push([startBin, yBinCntPerTile * ( Math.floor(startBin/yBinCntPerTile) + 1 ) - 1, this.get("zmLevels")[1] ]);
					startBin = yBinCntPerTile * ( Math.floor(startBin/yBinCntPerTile) + 1 );
				}
			}
		}
		
		
		//visTiles[cols[1]] = yTiles;
		//console.log(visTiles);
		
		this.set("visualTiles",  {} );
		var vTile;
		var count = 0;
		for (var i = 0; i < xTiles.length; i++){
			var id = cols[0] + "-" + xTiles[i][0] + "-" + xTiles[i][1] + "-" + xTiles[i][2];
			if (yTiles.length == 0){
				vTile = new VisualTile;
				vTile.addDimension(cols[0], xTiles[i][2], xTiles[i][0], xTiles[i][1]);
				vTile.setIdx(count++);
				this.get("visualTiles")[id] = vTile;
			}
			else {
				var id2;
				for (var j = 0; j < yTiles.length; j++){
					id2 = id + "x" + cols[1] + "-" + yTiles[j][0] + "-" + yTiles[j][1] + "-" + yTiles[j][2];
					vTile = new VisualTile;
					vTile.setIdx(count++);
					vTile.addDimension(cols[0], xTiles[i][2], xTiles[i][0], xTiles[i][1]);
					vTile.addDimension(cols[1], yTiles[j][2], yTiles[j][0], yTiles[j][1]);
					//vTile[cols[1]] = { start:yTiles[j][0], end:yTiles[j][1], zm:yTiles[j][2]  };
					this.get("visualTiles")[id2] = vTile;
				}
			}
			
		}
		
//		for (var t in this.get("visualTiles"))
//			console.log(this.get("visualTiles")[t].toString());
	},
	
	toString : function(){
		return this.get("type") + ": " + this.getSpecId(); 
	},
	
	initialize : function() {
		//this.resetVisualTiles();
	},
	
//	getTileDimensionality : function(){
//		for(var key in this.get("dataTiles")) break;
//		return Object.keys( this.get("dataTiles")[key] ).length;
//	},
	
	getFirstVisualTile : function(){
		for(var key in this.get("visualTiles")) break;
		return  this.get("visualTiles")[key] ;
	},
	
	//for geomaps
	getBinBounds : function(){
		var map = this.get("bgmap");
		var pixPerBin = this.get("pixPerBin");
		//var bgmapTileSize = this.get("bgmapTileSize");
		
		var swAbsPix = map.containerPointToLayerPoint([0, this.get("height")]).add(map.getPixelOrigin()) ;
		var neAbsPix = map.containerPointToLayerPoint([this.get("width"),0]).add(map.getPixelOrigin()) ;
		//console.log(map.getPixelOrigin());
		
		return{ latStart: Math.floor(neAbsPix.y/pixPerBin[0]), latEnd: Math.ceil(swAbsPix.y/pixPerBin[0]), 
				lngStart: Math.floor(swAbsPix.x/pixPerBin[1]), lngEnd: Math.ceil(neAbsPix.x/pixPerBin[1]) };
	},
	
	getSpecId : function(){
		var cols = this.get("cols");
		if (cols.length == 1)
			return cols[0];
		else 
			return cols[0]+"-"+cols[1];

	}
	
}, {
	
	visTypes: { hist: 0, area: 1, sp: 2, geo: 3, bar: 4 }
	
});