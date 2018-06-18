angular.module('catoffline').factory('uploadFactory',
[
    '$q',
    '$log',
    '$cordovaFileTransfer',
    'storageService',
    'CommonFunctionFactory',
function(
    $q,
    $log,
    $cordovaFileTransfer,
    storageService,
    CommonFunctionFactory) {

    var self = this;

    self.uploadFile = function(mapaId, uid, filename){

        var def = $q.defer();
        var filePath = storageService.storagePathBase+mapaId+"/pois/"+filename;

        var options = {
            fileKey: "file",
            fileName: filename
        };
        var params = {};
        params.uid = uid;
        options.params = params;

        $cordovaFileTransfer.upload(
            encodeURI("http://betaserver.icgc.cat/pintaservice/upload_catoff.php"),
            filePath, //"/android_asset/www/img/ionic.png",
            options
        ).then(function(result) {
            $log.info("SUCCESS: " + JSON.stringify(result.response));
            def.resolve(filename);

        }, function(err) {
            CommonFunctionFactory.recordError("ERROR: " + JSON.stringify(err));
            def.reject(err);

        }, function (progress) {

        });

        return def.promise;
    };

    return self;
}]);
