var ActionManager = Backbone.Model.extend({
	
	/**
	 * @memberOf ActionManager
	 */
	initDrag : function(plots, coordInPlots){
		var spec = this.getVisSpec(plots, coordInPlots.x, coordInPlots.y);
		//console.log(spec);
		if (!spec || spec.get("type") != VisSpec.visTypes.geo)	{
			return;
		}
		
		
		
		this.set("activePlots", plots);
		this.set("activeSpec", spec);
		this.set("selStartPixs", [ coordInPlots.x - spec.get("x") , coordInPlots.y - spec.get("yFromTop")]);
		
		document.onmousemove = this.onDrag;
		document.onmouseup = this.endDrag;
		//console.log(xBin, yBin);
	},
	
	onDrag : function(){
		if (!this.get("activeSpec"))	return;
		
		var e = window.event;
		if (e.altKey)	this.pan();
		else	this.selectArea();
	},
	
	endDrag : function(){
		
		var currentCoord = this.get("activePlots").getCoordInPlots();
		
		if (currentCoord.x == this.get("selStartPixs")[0] && currentCoord.y == this.get("selStartPixs")[1]) {
			d3.select("#"+this.get("activePlots").get("svgLayer")).selectAll("rect").remove();
		}
		
		document.body.style.cursor = "auto"; 
		document.onmousemove = null;
		document.onmouseup = null;
		
		this.set("activePlots", undefined);
		this.set("activeSpec", undefined);
		this.set("selStartPixs",undefined);
	},
	
	selectArea: function(){
		document.body.style.cursor = "crosshair";
		var canvasId = this.get("activePlots").get("svgLayer");
		d3.select("#"+canvasId).selectAll("rect").remove();
		
		var currentCoord = this.get("activePlots").getCoordInPlots();
		var spec = this.get("activeSpec");
		
		var nw = { x : Math.min(this.get("selStartPixs")[0], currentCoord.x - spec.get("x")), 
				y:	Math.min(this.get("selStartPixs")[1], currentCoord.y - spec.get("yFromTop"))
		};
		var se = {
				x : Math.max(this.get("selStartPixs")[0], currentCoord.x - spec.get("x")),
				y : Math.max(this.get("selStartPixs")[1], currentCoord.y - spec.get("yFromTop"))
		}; 
		
		var latF = new DimInfo;
		latF.setInfo( spec.get("cols")[0], spec.get("zmLevels")[0], 
				spec.pixToBin(spec.get("cols")[0], nw.y ), 
				spec.pixToBin(spec.get("cols")[0], se.y ) );
		//console.log(nw, se);
		var lngF = new DimInfo;
		lngF.setInfo( spec.get("cols")[1], spec.get("zmLevels")[1], 
				spec.pixToBin(spec.get("cols")[1], nw.x ), 
				spec.pixToBin(spec.get("cols")[1], se.x ) );
		var brushFilter = {};
		brushFilter[spec.get("cols")[0]] = latF;
		brushFilter[spec.get("cols")[1]] = lngF;
		
		//console.log( brushFilter );
		this.get("activePlots").repaint(brushFilter);
		
		var maskOpacity = this.get("maskOpacity");
		
		d3.select("#"+canvasId).append("rect")
			.attr("fill-opacity", maskOpacity)
			.attr("fill", "black")
			.attr("pointer-events", "none")
			.attr("x", spec.get("x")).attr("y", spec.get("yFromTop"))
			.attr("width", nw.x)
			.attr("height", spec.get("height"));

		d3.select("#"+canvasId).append("rect")
			.attr("fill-opacity", maskOpacity)
			.attr("fill", "black")
			.attr("pointer-events", "none")
			.attr("x", nw.x + spec.get("x")).attr("y", spec.get("yFromTop"))
			.attr("width", se.x - nw.x)
			.attr("height", nw.y);

		d3.select("#"+canvasId).append("rect")
			.attr("fill-opacity", maskOpacity)
			.attr("fill", "black")
			.attr("pointer-events", "none")
			.attr("x", nw.x + spec.get("x")).attr("y", se.y + spec.get("yFromTop"))
			.attr("width", se.x - nw.x)
			.attr("height", spec.get("height") - se.y);


		d3.select("#"+canvasId).append("rect")
			.attr("fill-opacity", maskOpacity)
			.attr("fill", "black")
			.attr("pointer-events", "none")
			.attr("x", se.x + spec.get("x")).attr("y", spec.get("yFromTop"))
			.attr("width", spec.get("width") - se.x)
			.attr("height", spec.get("height"));

	},
	
	pan : function(){
		
	},
	
	brush : function(plots, x, y){
		var spec = this.getVisSpec(plots, x, y);
			
//		if (spec)
//			console.log(spec.toString());
//		else
//			console.log("null");
//				
//		return;
				
		if (spec && spec.get("cols").length == 2 ){
			spec = undefined;
		}
		
		if (spec != this.get("activeSpec")){
			plots.reprocess(spec);
			this.set("activeSpec", spec);
		}
		
		if (!spec )	{
			plots.repaint();
			return;
		}
		
		var xInVis = x - spec.get("x"), yInVis = y - spec.get("yFromTop");
		
		if (spec.get("type") == VisSpec.visTypes.hist){
			
			var xBin = Math.floor( spec.get("startBins")[0] + xInVis /(spec.get("pixPerBin")) );
			
			//need to handle case where xBin is 
			
			var brushFilter = {};
			
			var f = new DimInfo;
			f.setInfo( spec.get("cols")[0], spec.get("zmLevels")[0], xBin, xBin );
			//console.log( spec.get("cols")[0], spec.get("zmLevels")[0], xBin, xBin );
			brushFilter[spec.get("cols")[0]] = f;
			//plots.clearForeground();
			plots.repaint(brushFilter);
//			var d1 = new DimInfo, d2 = new DimInfo;
//			d1.setInfo(2, 0, 8, 8);
//			var bf = {
//				2 : d1,
//				//2 : {start: 0, end: 1, zoom: 0},
//				//1 : {start: 300, end: 600, zoom: 4},
//			};
//			plots.brush(bf);
		}
		else if (spec.get("type") == VisSpec.visTypes.bar){
			
			var yBin = Math.floor( spec.get("startBins")[0] + yInVis /(spec.get("pixPerBin")) );
			
			var brushFilter = {};
			
			var f = new DimInfo;
			f.setInfo( spec.get("cols")[0], spec.get("zmLevels")[0], yBin, yBin );
			brushFilter[spec.get("cols")[0]] = f;
			plots.repaint(brushFilter);
		}
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
	
	updateRangeSlider : function(minV, maxV){
		var mgr = this;
//		$(function() {
//			$( "#" + mgr.get("colorMappingSliderID") ).slider({
//				range: true,
//				min: minV,
//				max: maxV,
//				values: [ minV, maxV ],
//				slide: function( event, ui ) {
//					//$( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
//				}
//			});
		
		$( "#" + mgr.get("loValLabel") ).text(  0  );
		$( "#" + mgr.get("hiValLabel") ).text(  maxV  );
		$( "#" + mgr.get("expParamID") ).slider({
			min: 0,
			max: 255,
			value: 85,
			step : 1,
			slide: function( event, ui ) {
				visManager.repaintGeoPlots();
				//console.log( ui.values[ 0 ] + " " + ui.values[ 1 ] );
			},
		});
		$( "#" + mgr.get("colorMappingSliderID") ).slider({
			range: true,
			min: 0,
			max: maxV,
			values: [ 0, maxV ],
			slide: function( event, ui ) {
				$( "#" + mgr.get("loValLabel") ).text(  ui.values[ 0 ]  );
				$( "#" + mgr.get("hiValLabel") ).text(  ui.values[ 1 ].toFixed(0)  );
				
				visManager.repaintGeoPlots();
				//console.log( ui.values[ 0 ] + " " + ui.values[ 1 ] );
			},
		});
		
		
		
//			$( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
//				" - $" + $( "#slider-range" ).slider( "values", 1 ) );
//		});
	},
	
	generateControls : function(){
		var ID = this.get("divID");
		if (d3.select("#"+ID).empty()){
			d3.select("body").append("div").attr("id", ID)
					.attr("style", "width: 100%; height: 25px; background-color: #e6e6e6; position: absolute; left: 0px; top: 0px; padding-top:15px;" );;
//			.attr("width",this.get("width")).attr("height",this.get("height"))
//			.attr("style", "position: absolute; left: " + this.get("x") + "px; top: " + this.get("y") + "px;");
		}
		
		d3.select("#"+ID).append("span").text("exp").attr("style", " margin-left:20px; margin-right: 5px;" );
//		d3.select("#"+ID).append("input").attr("id", this.get("expParamID")).attr("type", "range")
//							.attr("style", "width: 255px; margin-top:10px;" )
//							.attr("min", 0).attr("max", 255).property("value", 85)
//							.on("change", visManager.repaintGeoPlots);
		d3.select("#"+ID).append("span").attr("id", this.get("expParamID"))
							.attr("style", "display: inline-block; width: 255px;" );
		
		d3.select("#"+ID).append("span").text("low").attr("id", this.get("loValLabel"))
							.attr("style", "text-align: right; display: inline-block; width: 30px; margin-left:20px; margin-right: 15px;" );
//		d3.select("#"+ID).append("input").attr("id", this.get("gColorID")).attr("type", "range")
//							.attr("style", "width: 153px; margin-top: 10px;" )
//							.attr("min", 0).attr("max", 153).property("value", 153)
//							.on("change", visManager.repaintGeoPlots);
		d3.select("#"+ID).append("span").attr("id", this.get("colorMappingSliderID"))
							.attr("style", "display: inline-block; width: 255px;" );
		d3.select("#"+ID).append("span").text("high").attr("id", this.get("hiValLabel"))
							.attr("style", "display: inline-block; width: 30px; margin-left:15px; margin-right: 20px;" );
		
		d3.select("#"+ID).append("span").text("number of bytes per value on tile = " + parseFloat(4/DataManager.numPerPix))
			.attr("style", " margin-left:20px; margin-right: 5px;" );
		
		d3.select("#"+ID).append("input").attr("type", "button").attr("value","benchmark").on("click", benchmark);
						
		
//		d3.select("#"+ID).append("span").text("high").attr("style", " margin-left:20px; margin-right: 5px;" );
//		d3.select("#"+ID).append("input").attr("id", this.get("bColorID")).attr("type", "range")
//							.attr("style", "width: 229px; margin-top: 10px;" )
//							.attr("min", 0).attr("max", 229).property("value", 0)
//							.on("change", visManager.repaintGeoPlots);
//		d3.select("#"+ID).append("span").text("high");
//		d3.select("#"+ID).append("input").attr("id", this.get("hiColorID")).attr("type", "range")
//							.attr("min", 0).attr("max", 255).property("value", 85)
//							.on("change", visManager.repaintBinnedPlots);
		
		
	},
	
	getExpParam : function(){
		
		//return parseInt( d3.select("#"+this.get("expParamID")).property("value") );
		return $( "#"+this.get("expParamID") ).slider( "value" );
	},
	
	getLoV : function(){
		//return parseInt( d3.select("#"+this.get("colorMappingSliderID")).property("value") );
		return $( "#"+this.get("colorMappingSliderID") ).slider( "values", 0 );
	},
	
	getHiV : function(){
		//return parseInt( d3.select("#"+this.get("colorMappingSliderID")).property("value") );
		return $( "#"+this.get("colorMappingSliderID") ).slider( "values", 1 );
	},
	
	initialize : function(){
		this.set("divID", "visControls");
		this.set("expParamID", "visControls-Color");
		this.set("colorMappingSliderID", "visControls-Color-g");
		this.set("loValLabel", "loValLabel");
		this.set("hiValLabel", "hiValLabel");
		this.set("activeSpec", undefined);
		//this.set("bColorID", "visControls-Color-b");
		this.set("maskOpacity", 0.7);
		//this.set("hiColorID", "visControls-hiColor");
		_.bindAll(this, 'onDrag');
		_.bindAll(this, 'endDrag');
		_.bindAll(this, 'selectArea');
		_.bindAll(this, 'pan');
	}
});