angular.module('catoffline').factory('storageService',
['$q',
'$log',
'$cordovaFile',
'$localstorage',
'fileFactory',
'CommonFunctionFactory',
function(
    $q,
    $log,
    $cordovaFile,
    $localstorage,
    fileFactory,
    CommonFunctionFactory
) {

    var self = this;
    self.storagePathBase = ""; //cordova.file.externalApplicationStorageDirectory;
    self.storageMBTiles = "";
    self.storageFiles = "";

    self.updateStorageMBTiles = function(newPath){
      self.storageMBTiles = newPath;
    };

    /**** Inicialitza path d'emmagatzematge de l'app per Android ****/
    self.initAndroid2 =function(){

        var def = $q.defer();

        self.storageFiles = cordova.file.externalRootDirectory;
        $log.info("storageFiles: "+self.storageFiles);

        var targetPath_base = cordova.file.externalApplicationStorageDirectory;
        targetPath_base = targetPath_base.substring(0, targetPath_base.length - 1);
        var aux = targetPath_base.split("/");
        var appDir = aux[aux.length-1];//"com.ionicframework.excursionista512605";
        $log.info("STORAGESERVICE- AppDir: "+ appDir);

        $cordovaFile.checkDir("file:///storage/extSdCard/", "Android/data").then(function (success) {
            if(success){
                $cordovaFile.checkDir("file:///storage/extSdCard/Android/data/", appDir).then(function (success) {
                    self.storagePathBase = "file:///storage/extSdCard/Android/data/"+appDir+"/";
                    def.resolve(true);

                },function (error) {
                    if(error.code == 1){
                        $cordovaFile.createDir("file:///storage/extSdCard/Android/data/", appDir, false)
                        .then(function (success) {
                            self.storagePathBase = "file:///storage/extSdCard/Android/data/"+appDir+"/";
                            def.resolve(true);
                            // $log.info("STORAGESERVICE- 2.self.storagePathBase:"+self.storagePathBase);

                        }, function (error) {
                            self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                            def.resolve(true);
                            // $log.info("STORAGESERVICE- 3.self.storagePathBase:"+self.storagePathBase);

                        });
                    }else{
                        self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                        def.resolve(true);
                        //$log.info("STORAGESERVICE- Error check dir extSdCard/appDir, CODE:"+error.code);
                        // $log.info("STORAGESERVICE- 4.self.storagePathBase:"+self.storagePathBase);
                    }

                });

            }else{
                $cordovaFile.checkDir("file:///mnt/extSdCard/", "Android/data").then(function (success) {
                    if(success){
                        $cordovaFile.checkDir("file:///mnt/extSdCard/Android/data/", appDir).then(
                            function (success) {

                                self.storagePathBase = "file:///mnt/extSdCard/Android/data/"+appDir+"/";
                                def.resolve(true);

                            },function (error) {
                                if(error.code == 1){
                                    $cordovaFile.createDir("file:///mnt/extSdCard/Android/data/", appDir, false)
                                    .then(function (success) {
                                        self.storagePathBase = "file:///mnt/extSdCard/Android/data/"+appDir+"/";
                                        def.resolve(true);
                                        // $log.info("STORAGESERVICE- 2.self.storagePathBase:"+self.storagePathBase);

                                    }, function (error) {
                                        self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                                        def.resolve(true);
                                        // $log.info("STORAGESERVICE- 3.self.storagePathBase:"+self.storagePathBase);

                                    });
                                }else{
                                    self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                                    def.resolve(true);
                                    //$log.info("STORAGESERVICE- Error check dir extSdCard/appDir, CODE:"+error.code);
                                    // $log.info("STORAGESERVICE- 4.self.storagePathBase:"+self.storagePathBase);
                                }
                            });
                    }else{
                        self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                        def.resolve(true);
                        // $log.info("STORAGESERVICE- 9.self.storagePathBase:"+self.storagePathBase);
                    }
                },function (error) {
                    self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                    def.resolve(true);
                    // $log.info("STORAGESERVICE- 10.self.storagePathBase:"+self.storagePathBase);
                });
            }
        },function (error) {


            if(error.code == 1){
                $cordovaFile.checkDir("file:///storage/sdcard1/", "Android/data").then(function (success) {
                    if(success){
                        $cordovaFile.checkDir("file:///storage/sdcard1/Android/data/", appDir).then(
                            function (success) {

                                self.storagePathBase = "file:///storage/sdcard1/Android/data/"+appDir+"/";
                                def.resolve(true);

                            },function (error) {
                                if(error.code == 1){
                                    $cordovaFile.createDir("file:///storage/sdcard1/Android/data/", appDir, false)
                                    .then(function (success) {
                                        self.storagePathBase = "file:///storage/sdcard1/Android/data/"+appDir+"/";
                                        def.resolve(true);
                                        // $log.info("STORAGESERVICE- 11.self.storagePathBase:"+self.storagePathBase);

                                    }, function (error) {
                                        self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                                        def.resolve(true);
                                        // $log.info("STORAGESERVICE- 12.self.storagePathBase:"+self.storagePathBase);

                                    });
                                }else{
                                    self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                                    def.resolve(true);
                                    //$log.info("STORAGESERVICE- Error check dir extSdCard/appDir, CODE:"+error.code);
                                    // $log.info("STORAGESERVICE- 13.self.storagePathBase:"+self.storagePathBase);
                                }
                            });
                    }else{
                        self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                        def.resolve(true);
                        // $log.info("STORAGESERVICE- 14.self.storagePathBase:"+self.storagePathBase);
                    }
                },function (error) {
                    self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                    def.resolve(true);
                    // $log.info("STORAGESERVICE- 15.self.storagePathBase:"+self.storagePathBase);
                });
            }else{
                // $log.error("STORAGESERVICE- error: "+ JSON.stringify(error));
                self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                def.resolve(true);
                // $log.info("STORAGESERVICE- 16.self.storagePathBase:"+self.storagePathBase);
            }

        });

        return def.promise;
    };

    /**** Inicialitza path d'emmagatzematge de l'app per Android ****/
    self.initAndroid = function(){

        var def = $q.defer();
        self.storageFiles = cordova.file.externalRootDirectory;
        // $log.info("storageFiles: "+self.storageFiles);
        var targetPath_base = cordova.file.externalApplicationStorageDirectory;
        targetPath_base = targetPath_base.substring(0, targetPath_base.length - 1);
        var aux = targetPath_base.split("/");
        var appDir = aux[aux.length-1];//"com.ionicframework.excursionista512605";
        // $log.info("STORAGESERVICE- AppDir: "+ appDir);

        var path_localstorage = $localstorage.getObject("storageMBTiles");
        console.log("------ " + JSON.stringify(path_localstorage));
        if(null !== path_localstorage && (('object' === typeof path_localstorage && Object.keys(path_localstorage).length !== 0)  || ('string' == typeof path_localstorage)))
        {
            $log.info("localstorage no BUIT: "+path_localstorage);
            self.storageMBTiles = path_localstorage;
        }else{
            $log.info("localstoraege BUIT");
        }

        getExternalPath().then(
            function (path) {
                $log.info("Path sd:"+path);
                $cordovaFile.checkDir(path, appDir).then(
                    function (success) {
                        self.storagePathBase = path+appDir+"/";
                        if(self.storageMBTiles === "") self.storageMBTiles = self.storagePathBase;
                        def.resolve(true);
                    },function (error) {
                        if(error.code == 1){
                            $cordovaFile.createDir(path, appDir, false)
                            .then(function (success) {
                                self.storagePathBase =path+appDir+"/";
                                if(self.storageMBTiles === "") self.storageMBTiles = self.storagePathBase;
                                def.resolve(true);
                                // $log.info("STORAGESERVICE- 11.self.storagePathBase:"+self.storagePathBase);
                            }, function (error) {
                                self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                                if(self.storageMBTiles === "") self.storageMBTiles = self.storagePathBase;
                                def.resolve(true);
                                // $log.info("STORAGESERVICE- 12.self.storagePathBase:"+self.storagePathBase);
                            });
                        }else{
                            self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                            if(self.storageMBTiles === "") self.storageMBTiles = self.storagePathBase;
                            def.resolve(true);
                            // $log.info("STORAGESERVICE- Error check dir extSdCard/appDir, CODE:"+error.code);
                            // $log.info("STORAGESERVICE- 13.self.storagePathBase:"+self.storagePathBase);
                        }
                    });

            },function(error){
                self.storagePathBase = cordova.file.externalApplicationStorageDirectory;
                if(self.storageMBTiles === "")  self.storageMBTiles = self.storagePathBase;
                def.resolve(true);
            }
        );
        return def.promise;
    };

    //A partir android 6, la ruta real de la sd es monta amb estructura "0000-0000"
    function getExternalPathAndroid6(){
        var def = $q.defer();
        var pathAndroid6 = "file:///storage/";
        fileFactory.getEntries(pathAndroid6).then(
            function(entries){
                for (var i=0, trobat=false; i<entries.length && !trobat; i++){
                    if(/[0-9]{4}-[0-9]{4}/g.test(entries[i].name)){
                        pathAndroid6+=entries[i].name+"/";
                        trobat = true;
                    }
                }
                def.resolve(pathAndroid6);
            },function(){
            //   $log.error("Error get entries");
              def.resolve(pathAndroid6);
        });
        return def.promise;
    }

    /*Fem check de les rutes conegudes REALS a la SD, més comuns*/
    function getExternalPath(){
        var def = $q.defer();

        getExternalPathAndroid6().then(
            function(pathAndroid6){
                existsDir(pathAndroid6, "Android/data").then(
                    function(success){
                        def.resolve(pathAndroid6+"Android/data/");
                    },function(){
                        /*
                        /storage/sdcard1 //!< Motorola Xoom
                        /storage/extsdcard  //!< Samsung SGS3
                        /storage/sdcard0/external_sdcard  // user request
                        /mnt/extsdcard
                        /mnt/sdcard/external_sd  //!< Samsung galaxy family
                        /mnt/external_sd
                        /mnt/media_rw/sdcard1   //!< 4.4.2 on CyanogenMod S3
                        /removable/microsd              //!< Asus transformer prime
                        /mnt/emmc
                        /storage/external_SD            //!< LG
                        /storage/ext_sd                 //!< HTC One Max
                        /storage/removable/sdcard1      //!< Sony Xperia Z1
                        /data/sdext
                        /data/sdext2
                        /data/sdext3
                        /data/sdext4
                        */
                        $log.info("NO existeix android/data a path android 6");
                        existsDir("file:///storage/sdcard1/", "Android/data").then(
                            function(success){
                                def.resolve("file:///storage/sdcard1/Android/data/");
                            },function(){
                                existsDir("file:///storage/extSdCard/", "Android/data").then(
                                    function(success){
                                        def.resolve("file:///storage/extSdCard/Android/data/");
                                    },function(){
                                        existsDir("file:///storage/sdcard0/external_sdcard/", "Android/data").then(
                                            function(success){
                                                def.resolve("file:///storage/sdcard0/external_sdcard/Android/data/");
                                            },function(){
                                                existsDir("file:///mnt/extSdCard/", "Android/data").then(
                                                    function(success){
                                                        def.resolve("file:///mnt/extSdCard/Android/data/");
                                                    },function(){
                                                        existsDir("file:///mnt/sdcard/external_sd/", "Android/data").then(
                                                            function(success){
                                                                def.resolve("file:///mnt/sdcard/external_sd/Android/data/");
                                                            },function(){
                                                                existsDir("file:///mnt/external_sd/", "Android/data").then(
                                                                    function(success){
                                                                        def.resolve("file:///mnt/external_sd/Android/data/");
                                                                    },function(){
                                                                        existsDir("file:///mnt/media_rw/sdcard1/", "Android/data").then(
                                                                            function(success){
                                                                                def.resolve("file:///mnt/media_rw/sdcard1/Android/data/");
                                                                            },function(){
                                                                                existsDir("file:///storage/external_SD/", "Android/data").then(
                                                                                    function(success){
                                                                                        def.resolve("file:///storage/external_SD/Android/data/");
                                                                                    },function(){
                                                                                        existsDir("file:///storage/ext_sd/", "Android/data").then(
                                                                                            function(success){
                                                                                                def.resolve("file:///storage/ext_sd/Android/data/");
                                                                                            },function(){
                                                                                                existsDir("file:///storage/removable/sdcard1/", "Android/data").then(
                                                                                                    function(success){
                                                                                                        def.resolve("file:///storage/removable/sdcard1/Android/data/");
                                                                                                    },function(){
                                                                                                        existsDir("file:///data/sdext/", "Android/data").then(
                                                                                                            function(success){
                                                                                                                def.resolve("file:///data/sdext/Android/data/");
                                                                                                            },function(){
                                                                                                                existsDir("file:///data/sdext2/", "Android/data").then(
                                                                                                                    function(success){
                                                                                                                        def.resolve("file:///data/sdext2/Android/data/");
                                                                                                                    },function(){
                                                                                                                        existsDir("file:///data/sdext3/", "Android/data").then(
                                                                                                                            function(success){
                                                                                                                                def.resolve("file:///data/sdext3/Android/data/");
                                                                                                                            },function(){
                                                                                                                                existsDir("file:///data/sdext4/", "Android/data").then(
                                                                                                                                    function(success){
                                                                                                                                        def.resolve("file:///data/sdext4/Android/data/");
                                                                                                                                    },function(){
                                                                                                                                        existsDir("file:///mnt/sdcard/ext_sd/", "Android/data").then(
                                                                                                                                            function(success){
                                                                                                                                                def.resolve("file:///mnt/sdcard/ext_sd/Android/data/");
                                                                                                                                            },function(){
                                                                                                                                                existsDir("file:///mnt/sdcard/", "Android/data").then(
                                                                                                                                                    function(success){
                                                                                                                                                        def.resolve("file:///mnt/sdcard/Android/data/");
                                                                                                                                                    },function(){
                                                                                                                                                        $log.info("getExternalPath REJECT");
                                                                                                                                                        def.reject();
                                                                                                                                                    }
                                                                                                                                                );
                                                                                                                                            }
                                                                                                                                        );
                                                                                                                                    }
                                                                                                                                );
                                                                                                                            }
                                                                                                                        );
                                                                                                                    }
                                                                                                                );
                                                                                                            }
                                                                                                        );
                                                                                                    }
                                                                                                );
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                );
                                                                            }
                                                                        );
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                });
            }
        );
        return def.promise;
    }


    self.initIOS =function(){
        //TODO check correct ios directory!!!
        var def = $q.defer();

        self.storagePathBase = cordova.file.documentsDirectory;
        var path = cordova.file.dataDirectory;
        self.storageMBTiles = path.replace("NoCloud","LocalDatabase");//cordova.file.dataDirectory;
        //self.storageMBTiles = path;
        self.storageFiles = cordova.file.documentsDirectory;

        $log.info("storageFiles: "+self.storageFiles);
        $log.info("self.storagePathBase:"+self.storagePathBase);
        $log.info("self.storageMBTiles:"+self.storageMBTiles);

        self.logIOSFileSystem();

        def.resolve(true);
        return def.promise;
    };


    self.logAndroidFileSystem = function(){
        $log.info("--------------------- ANDROID FILE SYSTEM ----------------------");
        $log.info("cordova.file.applicationDirectory:"+cordova.file.applicationDirectory);
        $log.info("cordova.file.applicationStorageDirectory:"+cordova.file.applicationStorageDirectory);
        $log.info("cordova.file.cacheDirectory:"+cordova.file.cacheDirectory);
        $log.info("cordova.file.dataDirectory:"+cordova.file.dataDirectory);
        $log.info("cordova.file.externalRootDirectory:"+cordova.file.externalRootDirectory);
        $log.info("cordova.file.externalApplicationStorageDirectory:"+cordova.file.externalApplicationStorageDirectory);
        $log.info("cordova.file.externalCacheDirectory:"+cordova.file.externalCacheDirectory);
        $log.info("cordova.file.externalDataDirectory:"+cordova.file.externalDataDirectory);
        $log.info("-------------------------------------------");
    };

    self.logIOSFileSystem = function(){
        $log.info("--------------------- IOS FILE SYSTEM ----------------------");
        $log.info("cordova.file.applicationStorageDirectory:"+cordova.file.applicationStorageDirectory);
        $log.info("cordova.file.applicationDirectory:"+cordova.file.applicationDirectory);
        $log.info("cordova.file.documentsDirectory:"+cordova.file.documentsDirectory);
        $log.info("cordova.file.dataDirectory:"+cordova.file.dataDirectory);
        $log.info("cordova.file.syncedDataDirectory:"+cordova.file.syncedDataDirectory);
        $log.info("cordova.file.cacheDirectory:"+cordova.file.cacheDirectory);
        $log.info("cordova.file.tempDirectory:"+cordova.file.tempDirectory);
        $log.info("-------------------------------------------");
    };

    /**** Check a dir, and if doesn't exist, creates it ****/
    self.initDir = function(path, nameDir){

        var def = $q.defer();
        //existsDir(self.storagePathBase, nameDir).then(function(){},function(){});
        // CREATE
        $cordovaFile.createDir(path, nameDir, false)
            .then(function (success) {
                //$log.info("init dir ha creat el nou directori "+nameDir);
                def.resolve(true);
        }, function (error) {
            //$log.info("init dir ja existeix el directori "+nameDir);
            // error
                def.resolve(false);
        });

        return def.promise;
    };

    /***** Return true if the path+dir exists ****/
    var existsDir2 = function(path, dir){

        //$log.info("Exist dir:"+path);

        var def = $q.defer();

        $cordovaFile.checkDir(path,dir)
            .then(function (success) {
                if(success){
                    //$log.info("Existeix directori!");
                    def.resolve(true);
                }else{
                    //$log.info("No xisteix directori!");
                    // def.resolve(false);
                    def.reject();
                }
            },function (error) {
                //$log.info("Error al comprovar directori!");
                def.reject();
            });

        return def.promise;
    };

    /***** Return true if the path+dir exists ****/
    function existsDir(path, dir){

        //$log.info("Exist dir:"+path);

        var def = $q.defer();

        $cordovaFile.checkDir(path,dir)
            .then(function (success) {
                if(success){
                    //$log.info("Existeix directori!");
                    def.resolve(true);
                }else{
                    //$log.info("No xisteix directori!");
                    // def.resolve(false);
                    def.reject();
                }
            },function (error) {
                //$log.info("Error al comprovar directori!");
                def.reject();
            });

        return def.promise;
    }

    /***** Return true if the file exists ****/
    self.existsFile = function(path, filename){
        //$log.info("Exist dir:"+path);
        var def = $q.defer();

        $cordovaFile.checkFile(path,filename)
            .then(function (success) {
                if(success){
                    //$log.info("Existeix directori!");
                    def.resolve(true);
                }else{
                    //$log.info("No xisteix directori!");
                    def.resolve(false);
                }
            },function (error) {
                //$log.info("Error al comprovar directori!");
                def.reject();
            });
        return def.promise;
    };

    self.readFile = function(path, filename){

        var deferred = $q.defer();

        //$log.info("---Read file---");
        //$log.info("path:"+path);
        //$log.info("filename:"+filename);

        // READ
        $cordovaFile.readAsText(path, filename)
            .then(function (text) {
            // success
            //$log.info("read ok:"+text);
            deferred.resolve(text);
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("read ko, error:"+JSON.strinfigy(error));
            deferred.reject(error);
        });

        return deferred.promise;
    };

    self.removeFile = function(path, filename){

        var deferred = $q.defer();

        //$log.info("---Remove file---");
        //$log.info("path:"+path);
        //$log.info("filename:"+filename);

        $cordovaFile.removeFile(path, filename)
            .then(function (success) {
            // success
            //$log.info("removeFile ok");
            deferred.resolve();
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("removeFile ko, error:"+error);
            deferred.reject(error);
        });

        return deferred.promise;
    };


    self.removeRecursively = function(path, directory){

        var deferred = $q.defer();

        //$log.info("---Remove file---");
        //$log.info("path:"+path);
        //$log.info("filename:"+filename);

        $cordovaFile.removeRecursively(path, directory)
            .then(function (success) {
            // success
            //$log.info("removeFile ok");
            deferred.resolve();
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("removeRecursively ko, error:"+error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    self.writeFile = function(path, filename, data){

        var deferred = $q.defer();
        // $log.info("---Write file---");
        // $log.info("path:"+path);
        // $log.info("filename:"+filename);

        //var blob = new Blob(JSON.stringify(data), { type: 'text/plain' });

        if(!angular.isString(data)) data = JSON.stringify(data);

        // WRITE
        //provar si a android tb funciona el stringify!!!!
        $cordovaFile.writeFile(path, filename, data, true)
            .then(function (success) {
            // success
            // $log.info("writeFile ok");
            deferred.resolve();
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("writeFile ko, error:"+ JSON.stringify(error));
            deferred.reject(error);
        });

        return deferred.promise;
    };

    self.writeExistingFile = function(path, filename, data){

        var deferred = $q.defer();
        // $log.info("---writeExistingFile---");
        // $log.info("path:"+path);
        // $log.info("filename:"+filename);

        // $cordovaFile.readAsText(path, filename)
        //       .then(function (success) {
        //         // success
        //         // $log.info("---------------------------recupero:"+success);
        //         var nouString = success +"#"+data;
        //         // WRITE
        //         $cordovaFile.writeFile(path, filename, nouString, true)
        //             .then(function (success) {
        //             // success
        //             //$log.info("writeFile ok");
        //             deferred.resolve();
        //         }, function (error) {
        //             // error
        //             $log.error("writeExistingFile ko, error:"+error);
        //             deferred.reject(error);
        //         });
        //       }, function (error) {
        //         // error
        //       });

        $cordovaFile.writeExistingFile(path, filename, data)
         .then(function (success) {
             //             // success
             $log.info("writeFile ok");
             deferred.resolve();
         }, function (error) {
             //             // error
             CommonFunctionFactory.recordError("writeExistingFile ko, error:"+JSON.stringify(error));
             deferred.reject(error);
         });

        return deferred.promise;
    };

    self.appendFile = function(path, filename, dataObj, isAppend) {
        // Create a FileWriter object for our FileEntry (log.txt).
        var fileEntry = path + filename;
        fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            console.log("Successful file read...");
            readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file read: " + e.toString());
        };

        // If we are appending data to file, go to the end of the file.
        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
                console.log("file doesn't exist!");
            }
        }
        fileWriter.write(dataObj);
        });
    };

    self.createFile = function(path, filename){
        var deferred = $q.defer();
        $log.info("---createFile---");
        $log.info("path:"+path);
        $log.info("filename:"+filename);

        $cordovaFile.createFile(path, filename, true)
            .then(function (success) {
            deferred.resolve();
        }, function (error) {
            CommonFunctionFactory.recordError("writeFile ko, error:"+JSON.stringify(error));
            deferred.reject(error);
        });
        return deferred.promise;
    };

    self.moveFile = function(oldPath, oldFilename, newPath, newFilename){

        var deferred = $q.defer();
        //$log.info("---Move file---");
        //$log.info("newPath:"+newPath);
        //$log.info("newFilename:"+newFilename);

        // WRITE
        $cordovaFile.moveFile(oldPath, oldFilename, newPath, newFilename)
            .then(function (success) {
            // success
            //$log.info("moveFile ok");
            deferred.resolve();
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("moveFile ko, error:"+JSON.stringify(error));
            deferred.reject(error);
        });

        return deferred.promise;
    };

    self.copyFile = function(oldPath, oldFilename, newPath, newFilename){

        var deferred = $q.defer();
        //$log.info("---Move file---");
        //$log.info("newPath:"+newPath);
        //$log.info("newFilename:"+newFilename);

        // WRITE
        $cordovaFile.copyFile(oldPath, oldFilename, newPath, newFilename)
            .then(function (success) {
            // success
            //$log.info("copyFile ok");
            deferred.resolve();
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("copyFile ko, error:"+JSON.stringify(error));
            deferred.reject(error);
        });

        return deferred.promise;
    };

    /**Check if is valid path to read/write**/
    self.checkValidpath = function(path){
        var deferred = $q.defer();
        $log.info("---checkValidpath---");
        $log.info("path:"+path);

        $cordovaFile.createFile(path, "test_catoffline.txt", true).then(
            function(success){
                $cordovaFile.removeFile(path, "test_catoffline.txt").then(
                    function(success){
                        deferred.resolve(true);
                    }, function (error) {
                        CommonFunctionFactory.recordError("checkValidpath removeFile ko, error:"+JSON.stringify(error));
                        deferred.resolve(true);
                    });
            }, function (error) {
                CommonFunctionFactory.recordError("checkValidpath writeFile ko, error:"+JSON.stringify(error));
                deferred.resolve(false);
        });
        return deferred.promise;

    };

    return self;

}]);


/*
For the sake of completeness, all folders/mounts under /storage are:
- emulated
- remote
- sdcard0
- sdcard1
- uicc0
- usbdisk
- usbotg
-----------------------------------

/storage/sdcard1 //!< Motorola Xoom
/storage/extsdcard  //!< Samsung SGS3
/storage/sdcard0/external_sdcard  // user request
/mnt/extsdcard
/mnt/sdcard/external_sd  //!< Samsung galaxy family
/mnt/external_sd
/mnt/media_rw/sdcard1   //!< 4.4.2 on CyanogenMod S3
/removable/microsd              //!< Asus transformer prime
/mnt/emmc
/storage/external_SD            //!< LG
/storage/ext_sd                 //!< HTC One Max
/storage/removable/sdcard1      //!< Sony Xperia Z1
/data/sdext
/data/sdext2
/data/sdext3
/data/sdext4


/mnt/sdcard/ext_sd

http://stackoverflow.com/questions/13976982/removable-storage-external-sdcard-path-by-manufacturers

*/
