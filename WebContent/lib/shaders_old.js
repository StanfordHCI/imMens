var Shaders_Old = Backbone.Model.extend({
	/**
	 * @memberOf Shaders
	 */
	
},{
	/**
	 * @memberOf Shaders
	 */
	getChartQueryShader4D_1Byte : function(gl){
		var str =  "precision highp float;							\
					uniform highp sampler2D u_data;					\
					uniform highp vec2 u_cols;						\
					uniform highp float u_texw;						\
					uniform vec4 u_binCnts, u_offsets;							\
					uniform highp float u_yLoc;									\
					uniform highp vec4 u_lo, u_hi;										\
					uniform highp float u_maxCnt;											\
					\
					float calculateSumHist(float binIdx, float col){								\
						highp float  sum = 0.0;										\
						highp float lo = col == 0.0 ? u_lo[0] : col == 1.0 ? u_lo[1]  : col == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float hi = col == 0.0 ? u_hi[0] : col == 1.0 ? u_hi[1]  : col == 2.0 ? u_hi[2] : u_hi[3];		\
						if (binIdx < lo || binIdx >= hi){        															\
							return sum;																						\
						}																									\
						highp float alpha = -1.0, beta = -1.0, gamma = -1.0;								\
						highp vec4 cols = vec4(0.0, 1.0, 2.0, 3.0);						\
						for (mediump float i = 0.0; i < 4.0; i++){							\
							if (i == col)	continue;						\
							else if (alpha == -1.0)	alpha = i;							\
							else if (beta == -1.0)	beta = i;							\
							else	gamma = i;											\
						}																\
						highp float offset = col == 0.0 ? u_offsets[0] : col == 1.0 ? u_offsets[1]  : col == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float binCnt = col == 0.0 ? u_binCnts[0] : col == 1.0 ? u_binCnts[1]  : col == 2.0 ? u_binCnts[2] : u_binCnts[3];		\
						highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : alpha == 2.0 ? u_offsets[2] : u_offsets[3];    \
						highp float betaOffset = beta == 0.0 ? u_offsets[0] : beta == 1.0 ? u_offsets[1]  : beta == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float gammaOffset = gamma == 0.0 ? u_offsets[0] : gamma == 1.0 ? u_offsets[1]  : gamma == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float alphaLo = alpha == 0.0 ? u_lo[0] : alpha == 1.0 ? u_lo[1]  : alpha == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : alpha == 2.0 ? u_hi[2] : u_hi[3];		\
						highp float betaLo = beta == 0.0 ? u_lo[0] : beta == 1.0 ? u_lo[1]  : beta == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float betaHi = beta == 0.0 ? u_hi[0] : beta == 1.0 ? u_hi[1]  : beta == 2.0 ? u_hi[2] : u_hi[3];		\
						highp float gammaLo = gamma == 0.0 ? u_lo[0] : gamma == 1.0 ? u_lo[1]  : gamma == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float gammaHi = gamma == 0.0 ? u_hi[0] : gamma == 1.0 ? u_hi[1]  : gamma == 2.0 ? u_hi[2] : u_hi[3];		\
						\
						highp float texIdx, iu, iv, fz, mz;								\
						highp float ir, jr, kr;								\
						highp vec4 v;	\
						highp float start = binIdx * offset;				\
						for (highp float i = 0.0; i < 1000000.0; i++) {							\
							ir = i + alphaLo;													\
							if (ir >= alphaHi) break;											\
							for (highp float j = 0.0; j < 1000000.0; j++){						\
								jr = j + betaLo;												\
								if (jr > betaHi)		break;									\
								for (highp float k = 0.0; k < 1000000.0; k++){					\
									kr = k + gammaLo;											\
									if (kr > gammaHi)		break;								\
									texIdx = start + ir*alphaOffset + jr*betaOffset + kr*gammaOffset; \
									fz = floor(texIdx/3.0);						\
									mz = mod(texIdx, 3.0);						\
									iu = mod(fz, u_texw)/u_texw;							\
									iv = floor(fz/u_texw)/u_texw;							\
									v = texture2D(u_data, vec2(iu, iv));					\
									sum += mz==0.0 ? v.r : mz==1.0 ? v.g : mz==2.0 ? v.b : v.a;					\
								}																\
							}																	\
						}																	\
						return sum;													\
					}																\
					\
					float calculateSumSp(float xBinIdx, float yBinIdx, float row, float col) {							\
						highp float  sum = 0.0;	\							\
						highp float xLo = row == 0.0 ? u_lo[0] : row == 1.0 ? u_lo[1]  : row == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float xHi = row == 0.0 ? u_hi[0] : row == 1.0 ? u_hi[1]  : row == 2.0 ? u_hi[2] : u_hi[3];		\
						highp float yLo = col == 0.0 ? u_lo[0] : col == 1.0 ? u_lo[1]  : col == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float yHi = col == 0.0 ? u_hi[0] : col == 1.0 ? u_hi[1]  : col == 2.0 ? u_hi[2] : u_hi[3];		\
						if (xBinIdx < xLo || xBinIdx >= xHi || yBinIdx < yLo || yBinIdx >= yHi){        															\
							return sum;																						\
						}																	\
						highp float xOffset = row == 0.0 ? u_offsets[0] : row == 1.0 ? u_offsets[1]  : row == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float yOffset = col == 0.0 ? u_offsets[0] : col == 1.0 ? u_offsets[1]  : col == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float xBinCnt = row == 0.0 ? u_binCnts[0] : row == 1.0 ? u_binCnts[1]  : row == 2.0 ? u_binCnts[2] : u_binCnts[3];		\
						highp float yBinCnt = col == 0.0 ? u_binCnts[0] : col == 1.0 ? u_binCnts[1]  : col == 2.0 ? u_binCnts[2] : u_binCnts[3];		\
						highp float alpha = -1.0, beta = -1.0;								\
						highp vec4 cols = vec4(0.0, 1.0, 2.0, 3.0);						\
						for (mediump float i = 0.0; i < 4.0; i++){							\
							if (i == row || i == col)	continue;						\
							else if (alpha == -1.0)	alpha = i;							\
							else	beta = i;											\
						}																\
						highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : alpha == 2.0 ? u_offsets[2] : u_offsets[3];    \
						highp float betaOffset = beta == 0.0 ? u_offsets[0] : beta == 1.0 ? u_offsets[1]  : beta == 2.0 ? u_offsets[2] : u_offsets[3];		\
						highp float alphaLo = alpha == 0.0 ? u_lo[0] : alpha == 1.0 ? u_lo[1]  : alpha == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : alpha == 2.0 ? u_hi[2] : u_hi[3];		\
						highp float betaLo = beta == 0.0 ? u_lo[0] : beta == 1.0 ? u_lo[1]  : beta == 2.0 ? u_lo[2] : u_lo[3];		\
						highp float betaHi = beta == 0.0 ? u_hi[0] : beta == 1.0 ? u_hi[1]  : beta == 2.0 ? u_hi[2] : u_hi[3];		\
						highp float texIdx, iu, iv, fz, mz;								\
						highp float ir, jr, kr;											\
						highp vec4 v;	\
						highp float start = xBinIdx * xOffset + yBinIdx * yOffset;				\
						for (highp float i = 0.0; i < 1000000.0; i++) {							\
							ir = i + alphaLo;													\
							if (ir > alphaHi) break;											\
							for (highp float j = 0.0; j < 1000000.0; j++){						\
								jr = j + betaLo;												\
								if (jr > betaHi)		break;									\
								texIdx = start + ir*alphaOffset + jr*betaOffset; 				\
								fz = floor(texIdx/3.0);						\
								mz = mod(texIdx, 3.0);						\
								iu = mod(fz, u_texw)/u_texw;							\
								iv = floor(fz/u_texw)/u_texw;							\
								v = texture2D(u_data, vec2(iu, iv));					\
								sum += mz==0.0 ? v.r : mz==1.0 ? v.g : mz==2.0 ? v.b : v.a;					\
							}																	\
						}																		\
						return sum;																\
					}													\
					\
					void main() {									\
						mediump float x = gl_FragCoord.x - 0.5;							\
						mediump float y = gl_FragCoord.y - 0.5;							\
						mediump float row = u_cols[0] <= u_cols[1] ? u_cols[0]: u_cols[1];								\
						mediump float col = u_cols[0] <= u_cols[1] ? u_cols[1]: u_cols[0];								\
						highp float c;													\
						mediump float maxXBinCnt = row == 0.0? u_binCnts[0] : row == 1.0? u_binCnts[1] : row == 2.0? u_binCnts[2] : u_binCnts[3];					\
						mediump float maxYBinCnt = col == 0.0? u_binCnts[0] : col == 1.0? u_binCnts[1] : col == 2.0? u_binCnts[2] : u_binCnts[3];					\
						if (x >= maxXBinCnt || y >= u_yLoc + maxYBinCnt) {										\
							discard;												\
						}																\
						if (row == col){										\
							c = calculateSumHist(x, row);					\
							if (c == 0.0)	discard;						\
						}														\
						else {													\
							highp float yBinIdx = y - u_yLoc;						\
							highp float rawC = calculateSumSp(x, yBinIdx, row, col);	\
							c = rawC/pow(u_maxCnt,0.5);						\
						}														\
						\
						gl_FragColor = vec4(c,c,c,1.0);		\
					}													\
					";
		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	
	getChartQueryShader3D_1Byte : function(gl){
		var str =  "precision highp float;							\
					uniform highp float u_numTiles;							\
					uniform highp sampler2D u_data0, u_data1, u_data2, u_data3;					\
					uniform highp vec2 u_cols;						\
					uniform highp float u_texw0, u_texw1, u_texw2, u_texw3;						\
					uniform vec4 u_binCnts, u_offsets;							\
					uniform highp float u_yLoc;									\
					uniform highp vec4 u_lo0, u_lo1, u_lo2, u_lo3, u_hi0, u_hi1, u_hi2, u_hi3;										\
					uniform highp float u_maxCnt;											\
					\
					float calculateSumHist(float binIdx, float col, float tileIdx){								\
						highp float  sum = 0.0;										\
						highp vec4 u_low = tileIdx == 0.0 ? u_lo0 : tileIdx == 1.0 ? u_lo1 : tileIdx == 2.0 ? u_lo2 : u_lo3; 	\
						highp vec4 u_hi = tileIdx == 0.0 ? u_hi0 : tileIdx == 1.0 ? u_hi1 : tileIdx == 2.0 ? u_hi2 : u_hi3; 	\
						highp float lo = col == 0.0 ? u_low[0] : col == 1.0 ? u_low[1]  :  u_low[2] ;		\
						highp float hi = col == 0.0 ? u_hi[0] : col == 1.0 ? u_hi[1]  :  u_hi[2] ;		\
						if (binIdx < lo || binIdx >= hi){        															\
							return sum;																						\
						}																									\
						highp float alpha = -1.0, beta = -1.0;								\
						highp vec3 cols = vec3(0.0, 1.0, 2.0);						\
						for (mediump float i = 0.0; i < 3.0; i++){							\
							if (i == col)	continue;						\
							else if (alpha == -1.0)	alpha = i;							\
							else beta = i;							\
						}																\
						highp float offset = col == 0.0 ? u_offsets[0] : col == 1.0 ? u_offsets[1]  :  u_offsets[2] ;		\
						highp float binCnt = col == 0.0 ? u_binCnts[0] : col == 1.0 ? u_binCnts[1]  :  u_binCnts[2] ;		\
						highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : u_offsets[2] ;    \
						highp float betaOffset = beta == 0.0 ? u_offsets[0] : beta == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
						highp float alphaLo = alpha == 0.0 ? u_low[0] : alpha == 1.0 ? u_low[1]  : u_low[2] ;		\
						highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : u_hi[2] ;		\
						highp float betaLo = beta == 0.0 ? u_low[0] : beta == 1.0 ? u_low[1]  : u_low[2] ;		\
						highp float betaHi = beta == 0.0 ? u_hi[0] : beta == 1.0 ? u_hi[1]  : u_hi[2] ;		\
						\
						highp float texIdx, iu, iv, fz, mz;								\
						highp float ir, jr;								\
						highp vec4 v;	\
						highp float start = binIdx * offset;				\
						highp float u_texw = tileIdx == 0.0 ? u_texw0 : tileIdx == 1.0 ? u_texw1 : tileIdx == 2.0 ? u_texw2 : u_texw3; 	\
						for (highp float i = 0.0; i < 1000000.0; i++) {							\
							ir = i + alphaLo;													\
							if (ir >= alphaHi) break;											\
							for (highp float j = 0.0; j < 1000000.0; j++){						\
								jr = j + betaLo;												\
								if (jr >= betaHi)		break;									\
								texIdx = start + ir*alphaOffset + jr*betaOffset ; \
								fz = floor(texIdx/3.0);						\
								mz = mod(texIdx, 3.0);						\
								iu = mod(fz, u_texw)/u_texw;							\
								iv = floor(fz/u_texw)/u_texw;							\
								v = tileIdx == 0.0 ? texture2D(u_data0, vec2(iu, iv)) : tileIdx == 1.0 ? texture2D(u_data1, vec2(iu, iv)) : tileIdx == 2.0 ? texture2D(u_data2, vec2(iu, iv)) : texture2D(u_data3, vec2(iu, iv)); 	\
								sum += mz==0.0 ? v.r : mz==1.0 ? v.g :  v.b  ;					\
							}																	\
						}																	\
						return sum;													\
					}																\
					\
					float calculateSumSp(float xBinIdx, float yBinIdx, float row, float col, float tileIdx) {							\
						highp float  sum = 0.0;							\
						highp vec4 u_lo = tileIdx == 0.0 ? u_lo0 : tileIdx == 1.0 ? u_lo1 : tileIdx == 2.0 ? u_lo2 : u_lo3; 	\
						highp vec4 u_hi = tileIdx == 0.0 ? u_hi0 : tileIdx == 1.0 ? u_hi1 : tileIdx == 2.0 ? u_hi2 : u_hi3; 	\
						highp float xLo = row == 0.0 ? u_lo[0] : row == 1.0 ? u_lo[1]  : u_lo[2] ;		\
						highp float xHi = row == 0.0 ? u_hi[0] : row == 1.0 ? u_hi[1]  : u_hi[2] ;		\
						highp float yLo = col == 0.0 ? u_lo[0] : col == 1.0 ? u_lo[1]  : u_lo[2] ;		\
						highp float yHi = col == 0.0 ? u_hi[0] : col == 1.0 ? u_hi[1]  : u_hi[2] ;		\
						if (xBinIdx < xLo || xBinIdx >= xHi || yBinIdx < yLo || yBinIdx >= yHi){        															\
							return sum;																						\
						}																	\
						highp float xOffset = row == 0.0 ? u_offsets[0] : row == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
						highp float yOffset = col == 0.0 ? u_offsets[0] : col == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
						highp float xBinCnt = row == 0.0 ? u_binCnts[0] : row == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
						highp float yBinCnt = col == 0.0 ? u_binCnts[0] : col == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
						highp float alpha = -1.0;								\
						highp vec3 cols = vec3(0.0, 1.0, 2.0);						\
						for (mediump float i = 0.0; i < 3.0; i++){							\
							if (i == row || i == col)	continue;						\
							else alpha = i;							\
						}																\
						highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : u_offsets[2] ;    \
						highp float alphaLo = alpha == 0.0 ? u_lo[0] : alpha == 1.0 ? u_lo[1]  : u_lo[2];		\
						highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : u_hi[2];		\
						highp float texIdx, iu, iv, fz, mz;								\
						highp float ir;											\
						highp vec4 v;	\
						highp float u_texw = tileIdx == 0.0 ? u_texw0 : tileIdx == 1.0 ? u_texw1 : tileIdx == 2.0 ? u_texw2 : u_texw3; 	\
						highp float start = xBinIdx * xOffset + yBinIdx * yOffset;				\
						for (highp float i = 0.0; i < 1000000.0; i++) {							\
							ir = i + alphaLo;													\
							if (ir > alphaHi) break;											\
							texIdx = start + ir*alphaOffset; 				\
							fz = floor(texIdx/3.0);						\
							mz = mod(texIdx, 3.0);						\
							iu = mod(fz, u_texw)/u_texw;							\
							iv = floor(fz/u_texw)/u_texw;							\
							v = tileIdx == 0.0 ? texture2D(u_data0, vec2(iu, iv)) : tileIdx == 1.0 ? texture2D(u_data1, vec2(iu, iv)) : tileIdx == 2.0 ? texture2D(u_data2, vec2(iu, iv)) : texture2D(u_data3, vec2(iu, iv)); 	\
							sum += mz==0.0 ? v.r : mz==1.0 ? v.g : mz==2.0 ? v.b : v.a;					\
						}																		\
						return sum;																\
					}													\
					\
					void main() {									\
						mediump float x = gl_FragCoord.x - 0.5;							\
						mediump float y = gl_FragCoord.y - 0.5;							\
						mediump float row = u_cols[0] <= u_cols[1] ? u_cols[0]: u_cols[1];								\
						mediump float col = u_cols[0] <= u_cols[1] ? u_cols[1]: u_cols[0];								\
						mediump float maxXBinCnt = row == 0.0? u_binCnts[0] : row == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
						mediump float maxYBinCnt = col == 0.0? u_binCnts[0] : col == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
						if (x >= maxXBinCnt || y >= u_yLoc + maxYBinCnt) {										\
							discard;												\
						}																\
						highp float c;											\
						if (row == col){										\
							highp float rawC = 0.0;								\
							for (highp float i = 0.0; i < 5.0; i++){					\
								if (i >= u_numTiles)	break;							\
								rawC += calculateSumHist(x, row, i);						\
							}	\
							c = rawC/u_maxCnt;	\
						}														\
						else {													\
							highp float yBinIdx = y - u_yLoc;						\
							highp float rawC = 0.0;									\
							for (highp float i = 0.0; i < 100.0; i++){					\
								if (i >= u_numTiles)	break;							\
								rawC += calculateSumSp(x, yBinIdx, row, col, i);	\
							}	\
							c = rawC/pow(u_maxCnt,0.5);						\
						}														\
						\
						gl_FragColor = vec4(c,c,c,1.0);		\
					}													\
					";
		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getGeoRenderShader_1Byte : function(gl){
		//u_lat, u_lng, , u_binSteps
		//uniform highp float u_max;							highp float maxLat = 85.0840591556;								\								\
		var str =  "precision highp float;							\
			uniform highp sampler2D u_data;					\
			uniform highp float u_texw, u_texh;						\
            uniform highp float u_localMax, u_globalMax, u_bufferMax, u_avgPix, u_bufferMin;            \
			uniform highp vec2 u_pixOffsets, u_containerPos;						\
			uniform highp vec3 u_loColor, u_hiColor;					\
			uniform highp float u_texIdx;							\
			uniform highp float u_exp;								\
			uniform highp vec2 u_cols, u_pixOrigin;						\
			uniform highp vec2 u_binCnts;				\
			uniform highp float u_yLoc;									\
			uniform highp float u_visWd, u_visHt, u_canvasWd, u_canvasHt, u_zm, u_tileSize;					\
			highp float iu, iv, fz, mz, texIdx;											\
			uniform highp vec3 u_color;													\
			uniform highp vec4 u_trans;										\
			highp float pi=3.1415926535897932384626;						\
			highp float latBinsPerPix, lngBinsPerPix;						\
			highp vec4 v;													\
			\
			highp float chg (highp float x) {		\
				return exp(log(x)/3.0);			\
			}	\
			highp vec4 getColorBY (highp float x, highp float y) {		\
				highp float sum = texture2D( u_data, vec2( x, y )).r;			\
				if (sum == 0.0)				{						\
					discard;											\
				}										\
				sum = sum - 0.003;			\
				highp float par = 0.05;		\
				if (sum >= u_avgPix)	sum = chg( (sum-u_avgPix)/(u_bufferMax-u_avgPix) )*(1.0 - par) + par; \
				else sum = chg(sum/u_avgPix)*par;	\
                return vec4( 1.0, 1.0 - sum, 0.0, sum);				\
			} 														\
			\
			highp vec4 getColorRGBInterpolate (highp float x, highp float y) {				\
				highp float sum = texture2D( u_data, vec2( x, y )).r;			\
				if (sum == 0.0)				{						\
					discard;											\
				}										\
				sum = (sum - 0.003);			\
				highp float range = u_bufferMax - sum;						\
				highp float frange = u_bufferMax - u_bufferMin;					\
				highp float r = sum / frange;									\
				highp float nr = 1.0 -r;										\
				highp float factor =  range/frange ;									\
				highp float alpha = min(1.0, pow(sum, u_exp));				\
				alpha = 0.10 + 0.9*alpha;												\
				return vec4( nr * u_loColor[0] + r * u_hiColor[0], nr * u_loColor[1] + r * u_hiColor[1],  nr * u_loColor[2] + r * u_hiColor[2], alpha);	\
			}		\
			\
			vec4 biInterpolate(float latBin, float lngBin, float maxLatBin, float maxLngBin){						\
				highp float dist = 0.5;\
				highp vec4 k0 = getColorBY( max(0.0,lngBin - dist)/u_texw , (max(0.0,latBin - dist) + u_yLoc)/u_texh );	\
				highp vec4 k1 = getColorBY( max(0.0,lngBin - dist)/u_texw , (min(maxLatBin,latBin + dist) + u_yLoc)/u_texh );  \
				highp vec4 k2 = getColorBY( min(maxLngBin,lngBin + dist)/u_texw , (max(0.0,latBin - dist) + u_yLoc)/u_texh );  \
				highp vec4 k3 = getColorBY( min(maxLngBin,lngBin + dist)/u_texw , (min(maxLatBin,latBin + dist) + u_yLoc)/u_texh );    \
				highp vec4 k = getColorBY (  lngBin/u_texw , (latBin + u_yLoc)/u_texh  );	\
				highp float offset_x = 0.5/u_texw;			\
				highp float offset_y = 0.5/u_texh;			\
				return (k0 + k1 + k2 + k3) * 0.005 + k * 0.8 ;	\
			}														\
			\
			void main() {									\
				highp float x = gl_FragCoord.x - 0.5  ;		\
				highp float y = u_canvasHt - gl_FragCoord.y + 0.5 ;			\
				if (x < u_containerPos[0] || x > u_containerPos[0] + u_visWd || y < u_containerPos[1]  || y > u_containerPos[1] + u_visHt ) discard;\
				highp float latBin = floor( ( u_tileSize - ( y + u_pixOffsets[1] - u_containerPos[1] ) ) * u_binCnts[0] / u_tileSize );			\
				highp float lngBin = floor( ( x + u_pixOffsets[0] - u_containerPos[0] ) * u_binCnts[1] / u_tileSize );	\
				gl_FragColor = getColorBY (  lngBin/u_texw , (latBin + u_yLoc)/u_texh  );	\
			}																	\
			";	
		//sum = sum * u_localMax / u_globalMax;                         \
//		if ( x == u_containerPos[0] + u_visWd - 1.0 || y == u_containerPos[1] + u_visHt - 1.0 ) {\
//			gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0);				\
//			return;\
//		}\

		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getGeoRenderShader_4Bytes : function(gl){
		//u_lat, u_lng,, u_binSteps
		//uniform highp float u_max;												\
		var str =  "precision highp float;							\
			uniform highp sampler2D u_data;					\
			uniform highp float u_texw, u_texh;						\
            uniform highp float u_localMax, u_globalMax, u_bufferMax, u_avgPix, u_bufferMin;            \
			uniform highp vec2 u_pixOffsets, u_containerPos;						\
			uniform highp vec3 u_loColor, u_hiColor;					\
			uniform highp float u_texIdx;							\
			uniform highp float u_exp;								\
			uniform highp vec2 u_cols, u_pixOrigin;						\
			uniform highp vec2  u_binCnts;				\
			uniform highp float u_yLoc;									\
			uniform highp float u_visWd, u_visHt, u_canvasWd, u_canvasHt, u_zm, u_tileSize;					\
			highp float iu, iv, fz, mz, texIdx;											\
			uniform highp vec3 u_color;													\
			uniform highp vec4 u_trans;										\
			highp float pi=3.1415926535897932384626;						\
			highp float latBinsPerPix, lngBinsPerPix;						\
			highp vec4 v;													\
			highp float maxLat = 85.0840591556;								\
			\
			highp float chg (highp float x) {		\
				return exp(log(x)/3.0);			\
			}	\
			highp vec4 getColorBY (highp float x, highp float y) {		\
				v = texture2D( u_data, vec2( x, y ));										\
				highp float sum = v.r * pow(2.0, 24.0) + v.g * pow(2.0, 16.0) + v.b * pow(2.0, 8.0) + v.a;			\
				if (sum == 0.0)				{						\
					discard;											\
				}										\
				highp float par = 0.05;		\
				if (sum >= u_avgPix)	sum = chg( (sum-u_avgPix)/(u_bufferMax-u_avgPix) )*(1.0 - par) + par; \
				else sum = chg(sum/u_avgPix)*par;	\
                return vec4( 1.0, 1.0 - sum, 0.0, sum);				\
			} 														\
			\
			highp vec4 getColorRGBInterpolate (highp float x, highp float y) {				\
				v = texture2D( u_data, vec2( x, y ));										\
				highp float sum = v.r * pow(2.0, 24.0) + v.g * pow(2.0, 16.0) + v.b * pow(2.0, 8.0) + v.a;			\
				if (sum == 0.0)				{						\
					discard;											\
				}										\
				highp float range = u_bufferMax - sum;						\
				highp float frange = u_bufferMax - u_bufferMin;					\
				highp float r = sum / frange;									\
				highp float nr = 1.0 -r;										\
				highp float factor =  range/frange ;									\
				highp float alpha = min(1.0, pow(sum, u_exp));				\
				alpha = 0.10 + 0.9*alpha;												\
				return vec4( nr * u_loColor[0] + r * u_hiColor[0], nr * u_loColor[1] + r * u_hiColor[1],  nr * u_loColor[2] + r * u_hiColor[2], alpha);	\
			}		\
			\
			vec4 biInterpolate(float latBin, float lngBin, float maxLatBin, float maxLngBin){						\
				highp float dist = 0.5;\
				highp vec4 k0 = getColorBY( max(0.0,lngBin - dist)/u_texw , (max(0.0,latBin - dist) + u_yLoc)/u_texh );	\
				highp vec4 k1 = getColorBY( max(0.0,lngBin - dist)/u_texw , (min(maxLatBin,latBin + dist) + u_yLoc)/u_texh );  \
				highp vec4 k2 = getColorBY( min(maxLngBin,lngBin + dist)/u_texw , (max(0.0,latBin - dist) + u_yLoc)/u_texh );  \
				highp vec4 k3 = getColorBY( min(maxLngBin,lngBin + dist)/u_texw , (min(maxLatBin,latBin + dist) + u_yLoc)/u_texh );    \
				highp vec4 k = getColorBY (  lngBin/u_texw , (latBin + u_yLoc)/u_texh  );	\
				highp float offset_x = 0.5/u_texw;			\
				highp float offset_y = 0.5/u_texh;			\
				return (k0 + k1 + k2 + k3) * 0.005 + k * 0.8 ;	\
			}														\
			\
			void main() {									\
				highp float x = gl_FragCoord.x - 0.5  ;		\
				highp float y = u_canvasHt - gl_FragCoord.y + 0.5 ;			\
				if (x < u_containerPos[0] || x > u_containerPos[0] + u_visWd || y < u_containerPos[1]  || y > u_containerPos[1] + u_visHt ) discard;\
				highp float latBin = floor( ( u_tileSize - ( y + u_pixOffsets[1] - u_containerPos[1] ) ) * u_binCnts[0] / u_tileSize );			\
				highp float lngBin = floor( ( x + u_pixOffsets[0] - u_containerPos[0] ) * u_binCnts[1] / u_tileSize );	\
				gl_FragColor = getColorBY (  lngBin/u_texw , (latBin + u_yLoc)/u_texh  );	\
			}																	\
			";	
		//sum = sum * u_localMax / u_globalMax;                         \
		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getQueryShader3D_4Bytes : function(gl){
		var str =  "precision highp float;							\
			uniform highp sampler2D u_data;					\
			uniform highp vec3 u_cols;						\
			uniform highp float u_texw, u_visWd, u_visHt;						\
			uniform highp vec3 u_binCnts, u_offsets;							\
			uniform highp float u_yLoc;									\
			uniform highp vec3 u_lo, u_hi;										\
			uniform highp float u_max, u_localMax, u_globalMax;											\
			\
			float calculateSumSp(float xBinIdx, float yBinIdx, float xCol, float yCol) {							\
				highp float  sum = 0.0;							\
				highp float xLo = xCol == 0.0 ? u_lo[0] : xCol == 1.0 ? u_lo[1]  : u_lo[2] ;		\
				highp float xHi = xCol == 0.0 ? u_hi[0] : xCol == 1.0 ? u_hi[1]  : u_hi[2] ;		\
				highp float yLo = yCol == 0.0 ? u_lo[0] : yCol == 1.0 ? u_lo[1]  : u_lo[2] ;		\
				highp float yHi = yCol == 0.0 ? u_hi[0] : yCol == 1.0 ? u_hi[1]  : u_hi[2] ;		\
				if (xBinIdx < xLo || xBinIdx >= xHi || yBinIdx < yLo || yBinIdx >= yHi){        															\
					return sum;																						\
				}																	\
				highp float xOffset = xCol == 0.0 ? u_offsets[0] : xCol == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
				highp float yOffset = yCol == 0.0 ? u_offsets[0] : yCol == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
				highp float xBinCnt = xCol == 0.0 ? u_binCnts[0] : xCol == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
				highp float yBinCnt = yCol == 0.0 ? u_binCnts[0] : yCol == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
				highp float alpha = -1.0;								\
				highp vec3 cols = vec3(0.0, 1.0, 2.0);						\
				for (mediump float i = 0.0; i < 3.0; i++){							\
					if (i == xCol || i == yCol)	continue;						\
					else alpha = i;							\
				}																\
				highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : u_offsets[2] ;    \
				highp float alphaLo = alpha == 0.0 ? u_lo[0] : alpha == 1.0 ? u_lo[1]  : u_lo[2];		\
				highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : u_hi[2];		\
				highp float texIdx, iu, iv, fz, mz;								\
				highp float ir;											\
				highp vec4 v;	\
				highp float start = xBinIdx * xOffset + yBinIdx * yOffset;				\
				for (highp float i = 0.0; i < 100000000.0; i++) {							\
					ir = i + alphaLo;													\
					if (ir >= alphaHi) break;											\
					texIdx = start + ir*alphaOffset; 				\
					iu = mod(texIdx, u_texw)/u_texw;							\
					iv = floor(texIdx/u_texw)/u_texw;							\
					v = texture2D(u_data, vec2(iu, iv));					\
					sum += (v.a - 128.0/255.0) * 16777216.0 + v.r * 65536.0 + v.g * 256.0 + v.b  ;				\
				}																		\
				return sum;																\
			}													\
			\
			void main() {									\
				highp float x = gl_FragCoord.x - 0.5;							\
				highp float y = gl_FragCoord.y - 0.5;							\
				mediump float latCol = u_cols[0];								\
				mediump float lngCol = u_cols[1];								\
				mediump float maxLatBinCnt = latCol == 0.0? u_binCnts[0] : latCol == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
				mediump float maxLngBinCnt = lngCol == 0.0? u_binCnts[0] : lngCol == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
				if (x >= u_visWd || y >= u_yLoc + maxLatBinCnt || y < u_yLoc) {										\
					discard;												\
				}																\
				highp float rawC = calculateSumSp(x, y - u_yLoc, lngCol, latCol);	\
				rawC = rawC * 255.0;						\
				\
				highp float a = mod(rawC, 256.0);		\
				highp float b = floor( mod(rawC, 65536.0)/256.0  );		\
				highp float g = floor( mod(rawC, 16777216.0)/65536.0  );		\
				highp float r = floor(rawC/16777216.0);						\
				gl_FragColor = vec4(r/255.0,g/255.0,b/255.0,a/255.0);		\
			}													\
			";	

		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getQueryShader3D_1Byte : function(gl){
		var str =  "precision highp float;							\
			uniform highp sampler2D u_data;					\
			uniform highp vec3 u_cols;						\
			uniform highp float u_texw, u_visWd, u_visHt;						\
			uniform highp vec3 u_binCnts, u_offsets;							\
			uniform highp float u_yLoc;									\
			uniform highp vec3 u_lo, u_hi;										\
			uniform highp float u_max, u_localMax, u_globalMax;											\
			\
			float calculateSumSp(float xBinIdx, float yBinIdx, float xCol, float yCol) {							\
				highp float  sum = 0.0;	\							\
				highp float xLo = xCol == 0.0 ? u_lo[0] : xCol == 1.0 ? u_lo[1]  : u_lo[2] ;		\
				highp float xHi = xCol == 0.0 ? u_hi[0] : xCol == 1.0 ? u_hi[1]  : u_hi[2] ;		\
				highp float yLo = yCol == 0.0 ? u_lo[0] : yCol == 1.0 ? u_lo[1]  : u_lo[2] ;		\
				highp float yHi = yCol == 0.0 ? u_hi[0] : yCol == 1.0 ? u_hi[1]  : u_hi[2] ;		\
				if (xBinIdx < xLo || xBinIdx >= xHi || yBinIdx < yLo || yBinIdx >= yHi){        															\
					return sum;																						\
				}																	\
				highp float xOffset = xCol == 0.0 ? u_offsets[0] : xCol == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
				highp float yOffset = yCol == 0.0 ? u_offsets[0] : yCol == 1.0 ? u_offsets[1]  : u_offsets[2] ;		\
				highp float xBinCnt = xCol == 0.0 ? u_binCnts[0] : xCol == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
				highp float yBinCnt = yCol == 0.0 ? u_binCnts[0] : yCol == 1.0 ? u_binCnts[1]  : u_binCnts[2] ;		\
				highp float alpha = -1.0;								\
				highp vec3 cols = vec3(0.0, 1.0, 2.0);						\
				for (mediump float i = 0.0; i < 3.0; i++){							\
					if (i == xCol || i == yCol)	continue;						\
					else alpha = i;							\
				}																\
				highp float alphaOffset = alpha == 0.0 ? u_offsets[0] : alpha == 1.0 ? u_offsets[1]  : u_offsets[2] ;    \
				highp float alphaLo = alpha == 0.0 ? u_lo[0] : alpha == 1.0 ? u_lo[1]  : u_lo[2];		\
				highp float alphaHi = alpha == 0.0 ? u_hi[0] : alpha == 1.0 ? u_hi[1]  : u_hi[2];		\
				highp float texIdx, iu, iv, fz, mz;								\
				highp float ir;											\
				highp vec4 v;	\
				highp float start = xBinIdx * xOffset + yBinIdx * yOffset;				\
				for (highp float i = 0.0; i < 100000000.0; i++) {							\
					ir = i + alphaLo;													\
					if (ir >= alphaHi) break;											\
					texIdx = start + ir*alphaOffset; 				\
					fz = floor(  texIdx/4.0  );						\
					mz = mod(texIdx, 4.0);						\
					iu = mod(fz, u_texw)/u_texw;							\
					iv = floor(fz/u_texw)/u_texw;							\
					v = texture2D(u_data, vec2(iu, iv));					\
					sum += mz==0.0 ? v.r : mz==1.0 ? v.g : mz == 2.0 ? v.b : v.a;					\
				}																		\
				return sum;																\
			}													\
			\
			void main() {									\
				highp float x = gl_FragCoord.x - 0.5;							\
				highp float y = gl_FragCoord.y - 0.5;							\
				mediump float latCol = u_cols[0];								\
				mediump float lngCol = u_cols[1];								\
				highp float c;													\
				mediump float maxLatBinCnt = latCol == 0.0? u_binCnts[0] : latCol == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
				mediump float maxLngBinCnt = lngCol == 0.0? u_binCnts[0] : lngCol == 1.0? u_binCnts[1] : u_binCnts[2] ;					\
				if (x >= u_visWd || y >= u_yLoc + maxLatBinCnt || y < u_yLoc) {										\
					discard;												\
				}																\
				highp float rawC = calculateSumSp(x, y - u_yLoc, lngCol, latCol);	\
				if (rawC == 0.0)	discard; \
				c = (rawC/u_max) ;   \
				c = min(1.0, 0.003 +  c);					\
				\
				gl_FragColor = vec4(c, c, c, 1.0);		\
			}													\
			";	

		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getIdentityFragmentShader : function(gl){
		//var shaderScript = document.getElementById(id);
		//u_visWd, u_visHt, 
		//uniform highp float u_max;												\
		var str =  "precision highp float;							\
					uniform highp sampler2D u_data;					\
					uniform highp float u_texw, u_texh;						\
					uniform highp float u_canvasWd, u_canvasHt, u_tileSize;					\
					highp float iu, iv, count;											\
					uniform highp float u_x, u_yLoc;					\
					\
					void main() {									\
						highp float x = gl_FragCoord.x - 0.5;		\
						highp float y = gl_FragCoord.y - 0.5;		\
						highp float xInVis = x ;					\
						highp float yInVis = (u_tileSize - (y - u_yLoc)) + u_yLoc ;					\
						if (xInVis >= u_texw ||  yInVis >= u_texh) {												\
							gl_FragColor = vec4(0.0,0.8,0.0,1.0);													\
							return;															\
						}																	\
						if ( mod( y, u_tileSize ) == 0.0 ) {			\
							gl_FragColor = vec4( 0.0, 1.0, 1.0, 1.0);				\
							return;											\
						}				\
						iu = xInVis/u_texw;							\
						iv = yInVis/u_texh;							\
						gl_FragColor = texture2D(u_data, vec2(iu, iv));					\												\
					}																	\
					";
					
		
		var shader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	},
	
	getVertexShader : function(gl){
		var str =  "attribute vec2 a_position; 				\
			void main() {									\
			  gl_Position = vec4(a_position, 0, 1);			\
			}";

		var shader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) == 0)
		  alert(gl.getShaderInfoLog(shader));
		return shader;
	}
	
});