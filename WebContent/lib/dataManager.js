var DataManager = Backbone.Model.extend({
	
	/**
	 * @memberOf DataManager
	 */
	
	
	setMetadata : function(meta){
		this.set("metadata", meta);
		console.log(meta);
	},
	
	getDataTiles: function( dimInfos ){
		var cols = [], zms = [], startBins = [], endBins = [];
		for (var dim in dimInfos){
			cols.push( dimInfos[dim].getDim() );
			zms.push( dimInfos[dim].getZoom() );
			startBins.push( dimInfos[dim].getStartBin() );
			endBins.push( dimInfos[dim].getEndBin() );
		}
		
		var result = [];
		var meta = this.get("metadata");
		//console.log( meta );
		
		for (var c in this.get("cache")){
			var dims = c.split(DataManager.delimiter);
			var colIdxInTile = [];
			var match = true;
			for (var i = 0; i < cols.length; i++){
				if ( dims.indexOf( cols[i] + ":" + zms[i] ) < 0 ){
					match = false;
					break;
				}
				colIdxInTile.push( dims.indexOf( cols[i] + ":" + zms[i] ) );
			}
			
			if (!match)	continue;
			
			//check the zoom level for rest of the cols is 0
			for (var j = 0; j < dims.length; j++){
				var temp = dims[j].split(":");
				//console.log(temp);
				if ( cols.indexOf( parseInt(temp[0]) ) < 0 && parseInt(temp[1]) != 0 ){
					match = false;
					break;
				}
			}
			if (!match)	continue;
			
			
			
			//check start bin
			for (var s in this.get("cache")[c]){
				var tileBins = s.split(DataManager.delimiter).map(function(x){return parseInt(x);});

				var binNotFit = false;
				for (var i = 0; i < cols.length; i++){
					if (tileBins[colIdxInTile[i]] + meta[ cols[i] ].binsPerTile - 1 < startBins[i] || 
							tileBins[colIdxInTile[i]] > endBins[i] ){
						binNotFit = true;
						break;
					}
				}
				if (binNotFit)	continue;
				
//				if (cols.length == 2)
//					console.log( c, s, startBins, endBins );
//				
				
				result.push( this.get("cache")[c][s] );
				//console.log(cols, zms, startBins, endBins, "found!", c, s);
			}
			
			if (result.length > 0)
				return result;
			
		}
		return result;
	},
	
	getTiles_deprecated : function(cols, zms, startBins, endBins){
		
		var result = [];
		var meta = this.get("metadata");
		
		for (var c in this.get("cache")){
			var dims = c.split(DataManager.delimiter);
			var colIdxInTile = [];
			var match = true;
			for (var i = 0; i < cols.length; i++){
				if ( dims.indexOf( cols[i] + ":" + zms[i] ) < 0 ){
					match = false;
					break;
				}
				colIdxInTile.push( dims.indexOf( cols[i] + ":" + zms[i] ) );
			}
			
			if (!match)	continue;
			
			//check the zoom level for rest of the cols is 0
			for (var j = 0; j < dims.length; j++){
				var temp = dims[j].split(":");
				//console.log(temp);
				if ( cols.indexOf( parseInt(temp[0]) ) < 0 && parseInt(temp[1]) != 0 ){
					match = false;
					break;
				}
			}
			if (!match)	continue;
			
			//check start bin
			for (var s in this.get("cache")[c]){
				var tileBins = s.split(DataManager.delimiter).map(function(x){return parseInt(x);});

				var binNotFit = false;
				for (var i = 0; i < cols.length; i++){
					if (tileBins[colIdxInTile[i]] + meta[i] < startBins[i] || 
							tileBins[colIdxInTile[i]] > endBins[i] ){
						binNotFit = true;
						break;
					}
				}
				if (binNotFit)	continue;
				
				result.push( this.get("cache")[c][s] );
				console.log(cols, zms, "found!", c, s);
			}
			
			if (result.length > 0)
				return result;
			
		}
		return result;
	},
	
	//e.g. cols: [0,1], zoom: [4, 4], startIndices: [250, 1004], endBins: [390, 590]
	getTilesDeprecated : function(cols, zms, startBins, endBins){
		
		var result = [];
		
		//array of objects, {binsPerTile, dType, dim}
		var meta = this.get("metadata");
		
		for (var c in this.get("cache")){
			var tileCols = c.split(DataManager.delimiter).map(function(x){return parseInt(x);});
			var colNotFit = false;
			var colIdxInTile = [];
			for (var i = 0; i < cols.length; i++){
				if (tileCols.indexOf( cols[i] ) < 0){
					colNotFit = true;
					break;
				}
				colIdxInTile.push( tileCols.indexOf( cols[i] ) );
			}
			if (colNotFit)	continue;
			
			//check zoom level
			for (var z in this.get("cache")[c]){
				var tileZms = z.split(DataManager.delimiter).map(function(x){return parseInt(x);});
//				console.log(tileZms);
//				console.log(colIdxInTile);
				var zmNotFit = false;
				for (var i = 0; i < colIdxInTile.length; i++){
					if (tileZms[colIdxInTile[i]] != zms[i] ){
						zmNotFit = true;
						break;
					}
				}
				if (zmNotFit)	continue;
				
				//check start bin
				for (var s in this.get("cache")[c][z]){
					var tileBins = s.split(DataManager.delimiter).map(function(x){return parseInt(x);});

					var binNotFit = false;
					for (var i = 0; i < cols.length; i++){
						if (tileBins[colIdxInTile[i]] + meta[i] < startBins[i] || 
								tileBins[colIdxInTile[i]] > endBins[i] ){
							binNotFit = true;
							break;
						}
					}
					if (binNotFit)	continue;
					
					result.push( this.get("cache")[c][z][s] );
					console.log("found!", c, z, s);
				}
				
				
				if (result.length > 0)
					return result;
				
			}//end zoom level
			
			
		}//end columns
		return result;
	},
	
	//e.g. cols: [0,1,3], zoom: [4, 4, 0], startIndices: [256, 1024, 0]
	//we assume the cols are sorted
	addTile : function(cols, zoom, startIndices, id, tile){
		var cache = this.get("cache");
		
		var key = "";
		for (var i = 0; i < cols.length; i++){
			key += cols[i]+":"+zoom[i];
			if ( i != cols.length - 1)
				key += DataManager.delimiter;
		}
		
//		var colID = cols.join(DataManager.delimiter);
//		var zmID = zoom.join(DataManager.delimiter);
//		if (!cache.hasOwnProperty( colID )){
//			cache[colID] = {};
//		}
//		if (!cache[colID].hasOwnProperty( zmID )){
//			cache[colID][zmID] = {};
//		}
//		cache[colID][zmID][binID] = tile;
		
		if (!cache.hasOwnProperty(key)){
			cache[key] = {};
		}
		var binID = startIndices.join(DataManager.delimiter);
		cache[key][binID] = tile;
		
		this.get("cacheById")[id] = tile;
		
		//console.log(colID, zmID, binID, id);
	},
	
	
	
	hasTile : function(id){
		return this.get("cacheById").hasOwnProperty(id);
	},
	
	fetchTiles : function(tiles){
		VisManager.updateStatus(true, "Retrieving Data ...");
		var networker = new Networker();
		networker.httpGet("/imMens/GZipServlet?q="+tiles+"&dataset="+currentDataSet, imMensEvents.tilesReceived);
	},
	
	fetchMetadata : function(){
		//console.log(d3.select("#status"));
		VisManager.updateStatus(true, "Retrieving Metadata ...");
		var networker = new Networker();
		networker.httpGet("/imMens/GZipServlet?meta=1&dataset="+currentDataSet, imMensEvents.metaDataReceived);
	},
	
	/*
	getAllTiles : function(){
		return this.get("cache");
	},
	*/
	defaults : function() {
		return {
			cache: {},
			cacheById: {}
			//networkers:{}
		};
	},

	initialize : function() {
		//_.bindAll(this, 'tilesReceived');
	},
	
//	tilesReceived : function(request){
//		
//	}
}, {
	dataTypes: { latitude:0, longitude:1, numerical:2, categorical:3},
	delimiter: "-",
	numPerPix: 2
});