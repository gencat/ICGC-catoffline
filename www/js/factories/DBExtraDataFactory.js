angular.module('catoffline').factory('DBExtraDataFactory',
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

                    {name:"extra_layers_v1.db3", location: 'default', createFromLocation: 1},
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

    self.getGeojsonData = function(id_mapa, layer_type){

        var def = $q.defer();
        try{

            var geojson = "";

            self.db.executeSql( "select geojson_data as geojson_data "+
                  "from data_layers where id_mapa = ? and layer_type = ? ;", [id_mapa, layer_type],
                  function (res) {

                    for(var i = 0; i<res.rows.length; i++){
                        geojson = res.rows.item(i).geojson_data;
                    }

                    def.resolve(geojson);

                }, function(e){
                    CommonFunctionFactory.recordError("ERROR:" +JSON.stringify(e));
                    def.reject();
                });

        }catch(e){
            CommonFunctionFactory.recordError("catch ERROR:" +JSON.stringify(e));
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
