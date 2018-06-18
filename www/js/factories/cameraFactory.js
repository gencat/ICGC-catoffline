angular.module('catoffline').factory('cameraFactory',
                                      ['$q', '$log', '$cordovaCamera',
function($q, $log, $cordovaCamera) {

    return {
        getPicture: function(options) {
            var q = $q.defer();

            $cordovaCamera.getPicture(options).then(function(result) {
                q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    };
}]);
