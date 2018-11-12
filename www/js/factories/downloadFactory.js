angular.module('catoffline').factory('downloadFactory', [
'$q',
'$log',
'$cordovaFile',
'$cordovaFileTransfer',
'$timeout',
'DBTallsTopoFactory',
'storageService',
'CommonFunctionFactory',
'CATOFFLINE_INFO',
function(
$q,
$log,
$cordovaFile,
$cordovaFileTransfer,
$timeout,
DBTallsTopoFactory,
storageService,
CommonFunctionFactory,
CATOFFLINE_INFO) {

    var self = this;

    self.currentDownloading = {};

    self.downloadMap = function(index, myScope, type){
        var def = $q.defer();

        var urlDownload = CATOFFLINE_INFO.urlDownload_base+index+type+".mbtiles";
        var targetPath = storageService.storageMBTiles+index+type+".mbtiles";

        $cordovaFile.getFreeDiskSpace().then(function (success) {
            // success in kilobytes
            //Si hi ha prou espai a disc
            if(success >= (parseInt(myScope.mapa.mb)*1000) ){

                $cordovaFile.createFile(storageService.storageMBTiles, index+type+".mbtiles" ,true).then(
                    function(result){

                        try{

                            self.currentDownloading = $cordovaFileTransfer.download(urlDownload, targetPath, {}, true);
                            self.currentDownloading.then(

                                function(result) {
                                    //Success!
                                    $log.info("SUCCESS download");
                                    result.getMetadata(
                                        function (metadata) {
                                            console.info("metadata: "+JSON.stringify(metadata)); // get file size

                                            if(Number(metadata.size) > 30000000){
                                                DBTallsTopoFactory.updateDownloadVal('true', myScope.mapa.id, type, CATOFFLINE_INFO.currentVtVersion).then(function(){
                                                    if(type.indexOf("orto")==-1){
                                                        myScope.mapa.download = 'true';
                                                    }else{
                                                        myScope.mapa.download_orto = 'true';
                                                    }
                                                    def.resolve(true);

                                                },function(res){

                                                    def.resolve(true);
                                                    CommonFunctionFactory.recordError("No ha fet update de download be!");
                                                });
                                            }else{
                                                CommonFunctionFactory.recordError("Error fitxer incorrecte, massa petit:"+result.name);
                                                storageService.removeFile(storageService.storageMBTiles, result.name).then(
                                                    function(){}
                                                );
                                                def.reject({});
                                            }
                                        },
                                        function (error) {
                                            $log.info("ERROR download");
                                            CommonFunctionFactory.recordError("Error get metada del fitxer, fitxer incorrecte!");
                                            def.reject(error);
                                        }
                                    );

                            }, function(err) {
                                // Error
                                CommonFunctionFactory.recordError("Error download: "+ JSON.stringify(err));
                                self.deleteMap(index, myScope, type).then(function() { def.reject(err); });

                            }, function (progress) {
                                $timeout(function () {
                                    myScope.downloadProgress = (progress.loaded / progress.total) * 100;

                                });
                            });
                        }catch(e){
                            CommonFunctionFactory.recordError("Catch get message:" + JSON.stringify(e));
                            def.reject(e);
                        }
                    },function(error){
                        def.reject(error);
                        CommonFunctionFactory.recordError("ERROR creant fitxer..." + JSON.stringify(error));
                    }
                );

            }else{
                $log.error("Error no hi ha espai!");
                def.resolve(false);
            }

        }, function (error) {
            // error
            $log.debug("getFreeDiskSpace error");
            CommonFunctionFactory.recordError("getFreeDiskSpace error");
            def.reject(error);
        });

        return def.promise;
    };

    self.abortDownloadMap = function(){
        var def = $q.defer();
        $log.info("Abort function...");
        $log.info(JSON.stringify(self.currentDownloading));
        self.currentDownloading.abort();
        def.resolve();
        return def.promise;

    };

    self.downloadZip = function(index, myScope, type){
        var def = $q.defer();

        var targetPath = storageService.storageMBTiles+index+".zip";


        $cordovaFile.getFreeDiskSpace().then(function (success) {
            // success in kilobytes
            //Si hi ha prou espai a disc
            if(success >= (parseInt(myScope.mapa.mb)*1000) ){

                $cordovaFile.createFile(storageService.storageMBTiles, index+".zip" ,true).then(
                    function(result){

                        try{

                            self.currentDownloading = $cordovaFileTransfer.download(CATOFFLINE_INFO.urlDownload_zipVt_AWS, targetPath, {}, true);
                            self.currentDownloading.then(

                                function(result) {
                                    //Success!
                                    $log.info("SUCCESS download");
                                    result.getMetadata(
                                        function (metadata) {

                                            if(Number(metadata.size) > 300000000){
                                                DBTallsTopoFactory.updateDownloadVal('true', myScope.mapa.id, type, CATOFFLINE_INFO.currentVtVersion).then(function(){
                                                    $log.info("Update download value correcte");

                                                    myScope.mapa.download = 'true';             
                                                    def.resolve({success: true, path: targetPath});

                                                },function(res){
                                                    def.resolve({success: true, path: targetPath});
                                                    CommonFunctionFactory.recordError("No ha fet update de download be!");
                                                });
                                            }else{
                                                CommonFunctionFactory.recordError("Error fitxer incorrecte, massa petit:"+result.name);
                                                storageService.removeFile(storageService.storageMBTiles, result.name).then(
                                                    function(){}
                                                );
                                                def.reject({});
                                            }
                                        },
                                        function (error) {
                                            $log.info("ERROR download");
                                            CommonFunctionFactory.recordError("Error get metada del fitxer, fitxer incorrecte!");
                                            def.reject(error);
                                        }
                                    );

                            }, function(err) {

                                CommonFunctionFactory.recordError("Error download: "+ JSON.stringify(err));
                                deleteZip(index).then(function() { def.reject(err); });

                            }, function (progress) {
                                $timeout(function () {
                                    myScope.downloadProgress = (progress.loaded / progress.total) * 100;

                                });
                            });
                        }catch(e){
                            CommonFunctionFactory.recordError("Catch get message:" + JSON.stringify(e));
                            def.reject(e);
                        }
                    },function(error){
                        def.reject(error);
                        CommonFunctionFactory.recordError("ERROR creant fitxer..." + JSON.stringify(error));
                    }
                );

            }else{
                $log.error("Error no hi ha espai!");
                def.resolve({success: false, path: targetPath});
            }

        }, function (error) {

            $log.debug("getFreeDiskSpace error");
            CommonFunctionFactory.recordError("getFreeDiskSpace error");
            def.reject(error);
        });

        return def.promise;
    };    

    self.deleteMap = function(index, myScope, type){
        var def = $q.defer();

        $cordovaFile.removeFile(storageService.storageMBTiles,  index+type+".mbtiles").then(function(){

            if(type.indexOf("orto")==-1){
                myScope.mapa.download = 'false';
            }else{
                myScope.mapa.download_orto = 'false';
            }

            DBTallsTopoFactory.updateDownloadVal('false', index, type, 1).then(function(){

                def.resolve(true);
            },function(res){

                CommonFunctionFactory.recordError("No ha fet update de download be!" + JSON.stringify(res));
                def.resolve(false);
            });
        },function(error){
            CommonFunctionFactory.recordError("Error file removed!" + JSON.stringify(error));
            def.reject(error);
        });

        return def.promise;
    };


    var deleteZip = function(index){

        var def = $q.defer();



        $cordovaFile.removeFile(storageService.storageMBTiles,  index+".zip").then(function(){

            myScope.mapa.download = 'false';

            DBTallsTopoFactory.updateDownloadVal('false', index, '', 1).then(function(){

                def.resolve(true);
            },function(res){

                CommonFunctionFactory.recordError("No ha fet update de download be!" + JSON.stringify(res));
                def.resolve(false);
            });
        },function(error){
            CommonFunctionFactory.recordError("Error file removed!" + JSON.stringify(error));
            def.reject(error);
        });

        return def.promise;
    };    

    return self;
}]);
