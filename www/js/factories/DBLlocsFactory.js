angular.module('catoffline').factory('DBLlocsFactory',
[
    '$q',
    '$log',
    '$cordovaFile',
    'storageService',
    'fileFactory',
    'CommonFunctionFactory',
function(
    $q,
     $log,
     $cordovaFile,
     storageService,
     fileFactory,
     CommonFunctionFactory) {

    var self = this;
    self.db = null;

    self.init =function(){

        var def = $q.defer();
        try{

            if(window.sqlitePlugin){
                self.db = window.sqlitePlugin.openDatabase(

                    {name:"llocs_i_elevacions_v2.db3", location: 'default', createFromLocation: 1},
                    function(){
                        def.resolve(true);
                    });
            }else{
                def.reject();
            }
        }catch(e){
            def.reject(e);
        }

        return def.promise;

    };

    self.cercaLloc = function(lloc){


        var def = $q.defer();
        try{

            var llocs = [];

            self.db.executeSql(
                  "select toponim as toponim, latitud as latitud, longitud as longitud "+
                  "from llocs_elevacions where toponim like ? ;", ["%"+lloc+"%"],
                  function (res) {

                    for(var i = 0; i<res.rows.length; i++){

                        llocs.push({toponim: res.rows.item(i).toponim,
                                        latitud: res.rows.item(i).latitud,
                                        longitud: res.rows.item(i).longitud
                                        });
                    }
                    def.resolve(llocs);

                }, function(){
                    def.reject();
                });

        }catch(e){
            def.reject(e);
        }

        return def.promise;

    };

    self.closeDB = function(){
        self.db.close(function() {

        }, function(){
            CommonFunctionFactory.recordError("No s'ha tancat la db!");
        });
    };


        return self;
    }]);
