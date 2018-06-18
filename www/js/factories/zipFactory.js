angular.module('catoffline').factory('zipFactory', [
'$q',
'$log',
'$cordovaZip',
'$timeout',
'storageService',
'CommonFunctionFactory',
    function(
$q,
$log,
$cordovaZip,
$timeout,
storageService,
CommonFunctionFactory
) {

    var self = this;


    self.currentDownloading = {};

    self.unzipFile = function(myScope, src, dest, deleteOnFinish){
        var def = $q.defer();

        var mydest = (CommonFunctionFactory.isEmpty(dest) ? storageService.storageMBTiles : dest );

        $cordovaZip.unzip(src, mydest).then(
            function () {
                console.log('success unzip');
                storageService.removeFile(storageService.storageMBTiles, "0.zip").then(
                    function(){}
                );
                def.resolve();
            }, function () {
                console.error('error unzip');
            CommonFunctionFactory.recordError("Error al descomprimir el fitxer.");

                def.reject({});            
            }, function (progressEvent) {

                $timeout(function () {
                    myScope.unzipProgress = (progressEvent.loaded / progressEvent.total) * 100;
                });
                
        });


        return def.promise;
    };
   
    return self;
}]);
