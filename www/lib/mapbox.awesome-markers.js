/*
  Mapbox.AwesomeMarkers a port of Leaflet.AwesomeMarkers
  (c) 2017, Geostarters

  https://github.com/geostarters
  https://github.com/lvoogdt
*/

"use strict";
/*global mapboxgl*/

function AwesomeMarker(options) {

	var defaultOptions = {
		iconSize: [35, 45],
		iconAnchor:   [17, 42],
		popupAnchor: [1, -32],
		shadowAnchor: [10, 12],
		shadowSize: [36, 16],
		className: 'awesome-marker',
		prefix: 'glyphicon',
		spinClass: 'fa-spin',
		extraClasses: '',
		icon: 'home',
		markerColor: 'blue',
		iconColor: 'white'
	};

	this.options = {};
	Object.assign(this.options, defaultOptions, options);

	var el = this._createIcon();
	return new mapboxgl.Marker(el, {offset: [0,0]});

}

AwesomeMarker.prototype = {
	_createIcon: function () {

		var div = document.createElement('div'),
			options = this.options;

		if (options.icon) {
			div.innerHTML = this._createInner();
		}

		if (options.bgPos) {
			div.style.backgroundPosition =
				(-options.bgPos[0]) + 'px ' + (-options.bgPos[1]) + 'px';
		}

		this._setIconStyles(div, 'icon-' + options.markerColor);
		return div;

	},

	_createInner: function() {
		var iconClass, 
			iconSpinClass = "", 
			iconColorClass = "", 
			iconColorStyle = "", 
			options = this.options;

		if(options.icon.slice(0, options.prefix.length + 1) === options.prefix + "-") {
			iconClass = options.icon;
		} else {
			iconClass = options.prefix + "-" + options.icon;
		}

		if(options.spin && typeof options.spinClass === "string") {
			iconSpinClass = options.spinClass;
		}

		if(options.iconColor) {
			if(options.iconColor === 'white' || options.iconColor === 'black') {
				iconColorClass = "icon-" + options.iconColor;
			} else {
				iconColorStyle = "style='color: " + options.iconColor + "' ";
			}
		}

		return "<i " + iconColorStyle + "class='" + 
			options.extraClasses + " " + options.prefix + " " + 
			iconClass + " " + iconSpinClass + " " + iconColorClass + "'></i>";

	},

	_setIconStyles: function (img, name) {

		var options = this.options,
			size = options[name === 'shadow' ? 'shadowSize' : 'iconSize'],
			anchor;

		if (name === 'shadow') {
			anchor = options.shadowAnchor || options.iconAnchor;
		} else {
			anchor = options.iconAnchor;
		}

		if (!anchor && size) {
			anchor = [size[0]/2, size[1]/2];
		}

		img.className = 'awesome-marker-' + name + ' ' + options.className;

		if (anchor) {
			img.style.marginLeft = (-anchor[0]) + 'px';
			img.style.marginTop  = (-anchor[1]) + 'px';
		}

		if (size) {
			img.style.width  = size[0] + 'px';
			img.style.height = size[1] + 'px';
		}
	},

		createShadow: function () {
			var div = document.createElement('div');

			this._setIconStyles(div, 'shadow');
			return div;
	  }
};

if (window.mapboxgl) {
	mapboxgl.AwesomeMarker = AwesomeMarker;
}
else if (typeof module !== 'undefined') {
	module.exports = AwesomeMarker;
}