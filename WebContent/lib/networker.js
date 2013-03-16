var Networker = Backbone.Model.extend({

	defaults : function() {
		return {
			request : new XMLHttpRequest(),
			tileParams : { tileId : "tileId", data: "data", meta: "meta", globalMax: "globalMax" },
		};
	},

	initialize : function() {
		if (!this.get("request")) {
			this.set({
				request : new XMLHttpRequest()
			});
		}
		_.bindAll(this, 'processMetadata');
		_.bindAll(this, 'processTiles');
	},

	/**
	 * @memberOf Networker
	 */
	httpGet : function(Url, evt) {
		var request = this.get("request");
		//console.log(request);
		//xmlHttp = new XMLHttpRequest(); 
		if (evt == imMensEvents.tilesReceived)
			request.onreadystatechange = this.processTiles;
		else
			request.onreadystatechange = this.processMetadata;
		//console.log( this.processRequest );
		request.open("GET", Url, true);
		request.send(null);
	},
	
	processMetadata : function(){
		var request = this.get("request");
		
		if (request.readyState != 4 || request.status != 200)
			return;
		
		if (request.responseText != "Not found") {
			
			var meta = JSON.parse(request.responseText);
			dataManager.setMetadata(meta);
			
			console.log(dataManager.get("metadata"));
			visManager.displayConstructionUI();
		}
	},

	processTiles : function() {
		var request = this.get("request");
		
		//this.get("tileManager").tilesReceived(request);

		if (request.readyState != 4 || request.status != 200)
			return;
		
		
		if (request.responseText != "Not found") {

			
			var tiles = JSON.parse(request.responseText);

			var tileSize, imgSize, numPerPix = DataManager.numPerPix;
			
			var tileParams = this.get("tileParams");
			
			var imgTile;
			
			var cols, zms, bins;
			for ( var i = 0; i < tiles.length; i++) {
				var meta = tiles[i][tileParams.meta];
				//meta.sort(function(a,b){ return a.dim - b.dim; });
				//$("#result").text(meta.toString());
				
				tileSize = 1;
				for (var col in meta){
					tileSize *= meta[col].end - meta[col].start + 1;
				}
				
//				tileSize = meta.reduce(function(a, b) {
//					return a * (b.end - b.start + 1);
//				}, 1);
				
				imgSize = DataUtil.logCeil(Math.ceil(Math.sqrt(tileSize / numPerPix)),
						2);
				
				
				
				//console.log(imgSize);
				//testing
//				if (tiles[i][tileParams.tileId] == "2-0-11-0x3-0-30-0x4-0-23-0"){
//					var r = DataUtil.rollup( tiles[i][tileParams.data], meta, [2,3,4], [1,12,12*31], 4, {2:[0,11], 3:[0,30]} );
//					console.log(r, d3.sum(r));
//				}
				
				if(tiles[i][tileParams.tileId]=="2-0-27-0x3-0-19-0x5-0-6-0")
					console.log(tiles[i][tileParams.data]);
				
				imgTile = DataUtil.json2img(tiles[i][tileParams.data], numPerPix, imgSize, tiles[i][tileParams.globalMax]);
				//console.log( tiles[i][tileParams.tileId], tiles[i][tileParams.globalMax] );
				imgTile.meta = meta;
				imgTile.id = tiles[i][tileParams.tileId];
				
				
				
				cols = [];
				zms = [];
				bins = [];
				for (var j in meta){
					cols.push(meta[j].dim);
					zms.push(meta[j].zmlevel);
					bins.push(meta[j].start);
				}
				
				dataManager.addTile( cols, zms, bins, tiles[i][tileParams.tileId], imgTile );
			}
			
			//tileManager.trigger(imMensEvents.tilesReceived);
			visManager.generateVis();
			//console.log( this.get("tileManager").getTiles() );
			
		}//end if
	},

});

/*
 var networker = (function(){

 var worker = {};
 var xmlHttp = null;

 worker.httpGet = function(theUrl)
 {


 xmlHttp = new XMLHttpRequest();
 xmlHttp.open( "GET", theUrl, false );
 xmlHttp.send( null );
 return xmlHttp.responseText;
 }

 worker.httpGet2 = function(Url)
 {

 xmlHttp = new XMLHttpRequest(); 
 xmlHttp.onreadystatechange = worker.ProcessRequest;
 xmlHttp.open( "GET", Url, true );
 xmlHttp.send( null );
 }

 worker.ProcessRequest = function() 
 {
 if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) 
 {
 if ( xmlHttp.responseText == "Not found" ) 
 {
 document.getElementById( "TextBoxCustomerName"    ).value = "Not found";
 document.getElementById( "TextBoxCustomerAddress" ).value = "";
 }
 else
 {
 //var info = eval ( "(" + xmlHttp.responseText + ")" );

 document.getElementById("result").innerHTML = xmlHttp.responseText;
 //alert(xmlHttp.responseText);

 // No parsing necessary with JSON!        
 // document.getElementById( "TextBoxCustomerName"    ).value = info.jsonData[ 0 ].cmname;
 // document.getElementById( "TextBoxCustomerAddress" ).value = info.jsonData[ 0 ].cmaddr1;
 }                    
 }
 }

 return worker;

 })();*/