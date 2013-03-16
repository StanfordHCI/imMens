var WebGLChartRenderer = Backbone.Model.extend({
	
	/**
	 * @memberOf WebGLChartRenderer
	 */
	run : function(){
		var gl = this.get("gl");
		
		var tiles = this.get("binnedPlots").get("dataTiles");
		//this.setTileParameters(tiles);
		
		if (!this.has("program")){
			var prog = this.createProgram(gl, false);
			gl.useProgram(prog);
			this.set("program", prog);
		}
		
		//console.log(tiles);
		
		this.paint(gl, tiles);
	}
});