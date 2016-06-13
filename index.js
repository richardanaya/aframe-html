// aframe-html.js
// repo    : https://github.com/richardanaya/aframe-html
// license : MIT

(function (window, module, AFRAME, rasterizeHTML) {
	"use strict";
	AFRAME = AFRAME.aframeCore || AFRAME;

	AFRAME.registerComponent('html-material', {
		schema: {
			url: {
				type: 'string',
				default: ""
			},
			width: {
				type: 'int',
				default: 0
			},
			height: {
				type: 'int',
				default: 0
			}
		},

		update: function () {
			var _this = this;
			if(!this.canvas){
				this.canvas = document.createElement("canvas");
			}
			this.canvas.width = this.data.width;
			this.canvas.height = this.data.height;
			var _this = this;
			var ctx = this.canvas.getContext("2d")
			ctx.clearRect(0,0,this.data.width,this.data.height);
			var texture = new THREE.Texture(this.canvas);
			var material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
			this.el.object3D.children[0].material = material;

			if(!this.frame) {
				this.frame = document.createElement("iframe");
				//if the iframe isn't visible, you can't trigger events on it
				this.frame.setAttribute("style","position:absolute!important;top:-9999999999999px!important;left:-99999999999999!important;");
				this.el.appendChild(this.frame);
			}

			var frameDocument = _this.frame.contentWindow.document;

			this.getDocument = function(){
				return frameDocument;
			}
			this.updateTexture = function(){
				rasterizeHTML.drawDocument(frameDocument, ctx.canvas, {width: _this.data.width}).then(function success(renderResult) {
					texture.needsUpdate = true;
				}, function error(e) {
					console.log(e)
				});
			}

			function triggerMouseEvent (node, eventType) {
				var clickEvent = document.createEvent ('MouseEvents');
				clickEvent.initEvent (eventType, true, true);
				node.dispatchEvent (clickEvent);
			}

			this.triggerEventAt = function(e,x,y){
				var target = frameDocument.elementFromPoint(x,y);
				triggerMouseEvent(target,e);
			}

			if(this.data.url != ""){
				this.frame.src = this.data.url;
				this.frame.addEventListener("load",function(){
					frameDocument = _this.frame.contentWindow.document;
					_this.updateTexture();
				})
			}


		}
	});
})(
	typeof window !== "undefined" ? window : {},
	typeof module !== "undefined" ? module : {},
	typeof require !== "undefined" ? require("aframe") : (AFRAME || window.AFRAME),
	typeof require !== "undefined" ?  require("rasterizehtml") : rasterizeHTML
);
