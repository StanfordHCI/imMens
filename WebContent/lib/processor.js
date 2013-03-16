var WebGLChartProcessor = Backbone.Model.extend({
		
	/**
	 * @memberOf WebGLProcessor
	 */
	init: function(){
		
	},
	
	setVisSpecs : function(specs){
		var vSpec;
		for (var i = 0; i < specs.length; i++){
			vSpec = specs[i];
			this.addVisSpec(vSpec);
		}
	},
	
	addVisSpec : function(vSpec) {

		vSpec.set("yFromTop", vSpec.get("y"));
		// convert y for webgl computation, where y coordinate starts
		// from bottom of canvas
		vSpec.set("y", this.get("height") - vSpec.get("yFromTop") - vSpec.get("height"));
		this.get("visSpecs").push(vSpec);
	},
	
	defaults : function() {
		return {
			visSpecs : [],
		};
	},

	initialize : function() {
		if (!this.get("visSpecs")) {
			this.set({
				visSpecs : [],
			});
		}
	},
	
});