
angular.module('adaptiveSlider', []).filter('adaptive', function (){

	return {
		require: ['^ionSlideBox'],
		link: function(scope, elem, attrs, slider) {
				scope.$watch(function() {
						return slider[0].__slider.selected();
				}, function(val) {

						var newHeight = window.getComputedStyle(elem.parent()[0], null).getPropertyValue("height");
						if (newHeight) {
								elem.find('ion-scroll')[0].style.height = newHeight;
						}
				});
		}
};
});
