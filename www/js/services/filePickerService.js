angular.module('catoffline').service('filePickerService',
    [
    '$q', 
    '$log',
    'fileFactory',
    '$ionicPopup',
    'CommonFunctionFactory',
function(
    $q, 
    $log,
    fileFactory,
    $ionicPopup,
    CommonFunctionFactory 
) {

    var self = this;

    function checkFileType(path, fileExt) {
        //return path.match(new RegExp(fileExt + '$', 'i'));
        return (fileExt === "gpx" || fileExt === "kml" || fileExt === "geojson");
    }

    function chooseFileOk(deferred, uri, fileExt) {
        $log.debug('FileManager#chooseFile - uri: ' + uri + ', fileType: ' + fileExt);

        if (!checkFileType(uri, fileExt)) {
            deferred.reject('wrong_file_type');
        } else {
            deferred.resolve(uri);
        }
    }

    function chooseFileError(deferred, source) {
        //$log.debug('FileManager#chooseFile - ' + source + ' error: ' + JSON.stringify(error));

        // assume operation cancelled
        deferred.reject('cancelled');
    }

    self.chooseFile = function (fileExt) {
        var deferred = $q.defer();
        // $log.info("Choose FILE:");

        // iOS (NOTE - only iOS 8 and higher): https://github.com/jcesarmobile/FilePicker-Phonegap-iOS-Plugin
        if (ionic.Platform.isIOS()) {
            // $log.info("Platform IOS....");
            window.FilePicker.pickFile(
            //Sense el window ¿?¿?¿?FilePicker.pickFile(
                function (uri) {
                    // $log.debug("Choose file ok, msg: "+uri);
                    var ext = uri.substr(uri.lastIndexOf('.') + 1).toLowerCase();
                    // $log.info("Extensio uri: "+ext);
                    chooseFileOk(deferred, uri, ext);
                },
                function (error) {
                    CommonFunctionFactory.recordError("Choose file error, msg: "+JSON.stringify(error));
                    chooseFileError(deferred, 'FilePicker');
                }
            );

        // Android: https://github.com/don/cordova-filechooser
        /*} else {

            fileChooser.open(
                function (uri) {
                $log.info("Choosed file uri:"+uri);
                    chooseFileOk(deferred, uri, fileExt);
                },
                function (error) {
                    $log.error("Choosed file error:"+JSON.stringify(error));
                    chooseFileError(deferred, 'fileChooser');
                }
            );
        }*/
            // Android: https://github.com/MaginSoft/MFileChooser
        } else {

            window.plugins.mfilechooser.open([fileExt],
                function (uri) {
                //$log.info("Choosed file uri:"+uri);
                    chooseFileOk(deferred, uri, fileExt);
                },
                function (error) {
                    CommonFunctionFactory.recordError("Choosed file error:"+JSON.stringify(error));
                    chooseFileError(deferred, 'fileChooser');
                }
            );
        }

        return deferred.promise;

    };

    //Nomes per importar GPX i GEOJSON
    self.chooseImportFile = function () {
        var deferred = $q.defer();

        // iOS (NOTE - only iOS 8 and higher): https://github.com/jcesarmobile/FilePicker-Phonegap-iOS-Plugin
        if (ionic.Platform.isIOS()) {

            var utis = ["public.content", "public.item", "public.data", "public.text"];

            window.FilePicker.pickFile(
                function (uri, fileType) {
                    var ext = uri.substr(uri.lastIndexOf('.') + 1).toLowerCase();
                    chooseFileOk(deferred, uri, ext);
                },
                function (error) {
                    chooseFileError(deferred, 'FilePicker');
                },
                utis //"public.data"
            );
        // Android: https://github.com/MaginSoft/MFileChooser
        }else{

            window.plugins.mfilechooser.open(['.gpx', '.geojson', '.kml'],
                function (uri) {
                    // $log.info("Choosed file uri:"+uri);
                    deferred.resolve(uri);
                },
                function (error) {
                    CommonFunctionFactory.recordError("Choosed file error:"+JSON.stringify(error));
                    deferred.reject();
                });
        }

        return deferred.promise;

    };

    self.chooseMBTilesAndroid = function () {
        var deferred = $q.defer();

        window.plugins.mfilechooser.open(['.mbtiles'],
            function (uri) {

                $log.info("Choosed file uri:"+uri);
                deferred.resolve(uri);
            },
            function (error) {
                CommonFunctionFactory.recordError("Choosed file error:"+JSON.stringify(error));
                deferred.reject();
            });
        

        return deferred.promise;

    };

    self.chooseAndroidFolder = function(){
        var deferred = $q.defer();

        window.plugins.mfilechooser.open(['Folder'],
          function (uri) {
              $log.info("Choosed file uri:"+uri);
              deferred.resolve(uri);
          },
          function (error) {
              CommonFunctionFactory.recordError("Choosed file error:"+JSON.stringify(error));
              deferred.reject();
          });

          return deferred.promise;
    };

    return self;

}]);
