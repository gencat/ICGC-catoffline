angular.module('catoffline').factory('DBTallsTopoFactory', 
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
    cordovaFile, 
    storageService, 
    fileFactory, 
    CommonFunctionFactory
) {

    var self = this;
    self.db = null;
    self.mapes = [];
    self.mbtilesDB = null;

    self.initWebView = function(){
      self.mapes = [{id: 1, top: 'false', nom: 'P Nacional d Aigüestortes i Estany de Sant Maurici', download: 'true', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 2, top: 'true', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 3, top: 'false', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 4, top: 'false', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 5, top: 'false', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 6, top: 'true', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 7, top: 'false', nom: 'Girona', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 8, top: 'false', nom: 'Tarra', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 9, top: 'false', nom: 'Barcelona', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 10, top: 'false', nom: 'Paratge Natural dInterès Nacional de lAlbera', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'},
                       {id: 11, top: 'false', nom: 'Costa Brava centre - les Gavarres', download: 'false', edicio:'e1', data:'maig 2014', versio:'2', any_vol:'2012'}];
    };

    self.globalInitAndroid = function(){
        var def = $q.defer();

        self.init().then(function(){

            self.updateAvailableMaps().then(function(results){


                self.initMapList().then(function(results){

                    def.resolve(true);
                });

            }, function(){

                def.resolve(false);
            });

        }, function(){

            def.resolve(false);
        });
        return def.promise;
    };

    self.globalInitIOS = function(){
        var def = $q.defer();

        self.init().then(function(){

            self.updateAvailableMaps().then(function(results){

                self.initMapList().then(function(results){

                    def.resolve(true);
                });

            }, function(){

                def.resolve(false);
            });


        }, function(){

            def.resolve(false);
        });
        return def.promise;
    };


    self.init =function(){

        var def = $q.defer();
        try{

            if(window.sqlitePlugin){
                self.db = window.sqlitePlugin.openDatabase(
                    {name:"talls_topo25m_v5.db3", location: 'default', createFromLocation: 1},

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

    self.updateAvailableMaps = function(){
        var def = $q.defer();
        fileFactory.getEntries(storageService.storageMBTiles).then(
            function(entries){
                self.db.executeSql(
                    "UPDATE talls_topo25m "+
                    "SET download = 'false' WHERE id < 78;",
                    [],
                    function (res) {
                        for (var i=0; i<entries.length; i++){
                            if(strEndsWith(entries[i].name, "orto.mbtiles")){
                                self.updateDownloadTrue(entries[i].name.replace("_orto.mbtiles","").trim(), "download_orto", "data_download_orto");
                            }else if(strEndsWith(entries[i].name, ".mbtiles")){
                                self.updateDownloadTrue(entries[i].name.replace(".mbtiles","").trim(), "download", "data_download");
                            }
                        }
                        def.resolve();

                    }, function(res){
                        console.info("DBTallsTopoFactory NO update download!");
                        def.reject(res);
                    });

            },function(error){
                CommonFunctionFactory.recordError("DBTallsTopoFactory error get entries");
                def.reject();
            }
        );
        return def.promise;
    };

/* jshint ignore:start */
    self.updateAvailableMaps2 = function(){
        var def = $q.defer();
        fileFactory.getEntries(storageService.storageMBTiles).then(
            function(entries){
                self.db.executeSql(
                    "UPDATE talls_topo25m "+
                    "SET download = 'false';",
                    [],
                    function (res) {
                        for (var i=0; i<entries.length; i++){

                            console.info("entries[i]: "+JSON.stringify(entries[i]));
                            console.info("entries[i].name: "+entries[i].name);
                            console.info("entries[i].size: "+entries[i].size);



                            if(strEndsWith(entries[i].name, "orto.mbtiles")){

                                entries[i].getMetadata(
                                    function (metadata) {
                                        console.info("metadata: "+JSON.stringify(metadata)); // get file size
                                        console.info("metadata.size: "+metadata.size); // get file size

                                        self.isCorrectSize(entries[i].name.replace("_orto.mbtiles","").trim(), metadata.size, true).then(
                                            function(id){
                                                self.updateDownloadTrue(id, "download_orto", "data_download_orto");
                                            },function(){
                                                //TODO delete file!
                                            }
                                        );

                                    },
                                    function (error) {}
                                );

                            }else if(strEndsWith(entries[i].name, ".mbtiles")){

                                entries[i].getMetadata(
                                    function (metadata) {
                                        console.info("metadata: "+JSON.stringify(metadata)); // get file size
                                        console.info("metadata.size: "+metadata.size); // get file size

                                        self.isCorrectSize(entries[i].name.replace(".mbtiles","").trim(), metadata.size, false).then(
                                            function(id){
                                                self.updateDownloadTrue(id, "download", "data_download");
                                            },function(){

                                            }
                                        );
                                    },
                                    function (error) {}
                                );

                            }
                        }
                        def.resolve();

                    }, function(res){
                        console.info("DBTallsTopoFactory NO update download!");
                        def.reject(res);
                    });

            },function(error){
                CommonFunctionFactory.recordError("DBTallsTopoFactory error get entries");
                def.reject();
            }
        );
        return def.promise;
    };
/* jshint ignore:end */

    var strEndsWith = function(str, suffix) {
        return str.match(suffix+"$")==suffix;
    };

    self.reinitMapList = function(){
        var def = $q.defer();
        self.mapes = [];
        self.initMapList().then(
            function(){

                def.resolve();
            },function(){
                def.reject();
            }
        );
        return def.promise;
    };

    /* Retorna la info de tots els mapes de la taula, per omplir el llistat */
    self.initMapList = function(){

        var def = $q.defer();
        try{


            self.db.executeSql(
                  "select id as id, id_order as id_order, nom as nom, descripcio as descripcio, municipis as municipis, download as download, data_download as data_download, download_orto as download_orto, data_download_orto as data_download_orto, data as data, url_botiga as url_botiga, edicio as edicio, versio as versio, any_vol as any_vol, mb as mb, mb_orto as mb_orto, lon_center as lon_center, lat_center as lat_center, lon_min as lon_min, lon_max as lon_max, lat_min as lat_min, lat_max as lat_max "+
                  "from talls_topo25m order by id;", [],
                  function (res) {

                    for(var i = 0; i<res.rows.length; i++){

                        self.mapes.push({id: Number(res.rows.item(i).id),
                                        id_order: res.rows.item(i).id_order,
                                        nom: res.rows.item(i).nom,
                                        descripcio: res.rows.item(i).descripcio,
                                        municipis: res.rows.item(i).municipis,
                                        download: res.rows.item(i).download,
                                        data_download: res.rows.item(i).data_download,
                                        download_orto: res.rows.item(i).download_orto,
                                        data_download_orto: res.rows.item(i).data_download_orto,
                                        edicio: res.rows.item(i).edicio,
                                        url_botiga: res.rows.item(i).url_botiga,
                                        data: res.rows.item(i).data,
                                        versio: res.rows.item(i).versio,
                                        any_vol: res.rows.item(i).any_vol,
                                        mb: res.rows.item(i).mb,
                                        mb_orto: res.rows.item(i).mb_orto,
                                        lon_center: res.rows.item(i).lon_center,
                                        lat_center: res.rows.item(i).lat_center,
                                        lat_min: res.rows.item(i).lat_min,
                                        lat_max: res.rows.item(i).lat_max,
                                        lon_min: res.rows.item(i).lon_min,
                                        lon_max: res.rows.item(i).lon_max,
                                        top: (res.rows.item(i).download==='true' || res.rows.item(i).download_orto === 'true'),
                                        picture_path: ( res.rows.item(i).id < 78 ? res.rows.item(i).id +"-opt.jpg" :  "map-icon-pure.png" )
                                        });
                    }
                    def.resolve();

                }, function(){
                    def.reject();
                });

        }catch(e){
            def.reject(e);
        }

        return def.promise;
    };

    /* Retorna l'objecte mapa a la posicio 'index' */
    self.getMapByIdx = function(index){
        return self.mapes[index];
    };

    var getCurrentDate = function(){
        var date = new Date();
        return (date.getDate()) + "/" + (date.getMonth()+1) + "/" + date.getFullYear().toString();
    };

    /*Update download value: col_type indica si es de tipus orto o no */
    self.updateDownloadVal = function(downloaded, id, col_type, versionVT){

        var def = $q.defer();

        var data_download = getCurrentDate();

        var myVersio = (id===0 ? versionVT : self.mapes[id].versio); 

        try{
            self.db.executeSql(
                "UPDATE talls_topo25m "+
                "SET download"+col_type+" = ?, data_download"+col_type+" = ?, versio = ? "+
                "WHERE id = ?;",
                [downloaded, data_download, myVersio, id],

                function (res) {

                    if(res.rows.length > 0) {}

                    if(id>0 && col_type == "_orto") {
                        self.mapes[id].download_orto = downloaded;
                        self.mapes[id].data_download_orto = data_download;

                    }else if(id>0){
                        self.mapes[id].download = downloaded;
                        self.mapes[id].data_download = data_download;

                    }else if(id===0){
                        self.mapes[0].versio = versionVT;

                    }

                    self.mapes[id].top = (self.mapes[id].download === 'true' || self.mapes[id].download_orto === 'true');

                    def.resolve();
                }, function(res){

                    def.reject(res);
                });
        }catch(e){
            def.reject(e);
        }
        return def.promise;
    };

    self.isCorrectSize = function(id, size, isOrto){

        var def = $q.defer();

        try{
            self.db.executeSql(
                  "select mb as mb,  mb_orto as mb_orto "+
                  "from talls_topo25m WHERE id = ?;", [id],
                  function (res) {

                    var mb = 0;
                    mb = Number((isOrto? res.rows.item(0).mb_orto : res.rows.item(0).mb_orto));
                    console.info("mb: "+mb);

                    mb = mb/1000000;
                    console.info("number mb: "+mb);
                    console.info("size: "+size);

                    def.resolve(id);

                  }, function(res){

                      def.reject(res);
                  });

        }catch(e){
            def.reject(e);
        }
        return def.promise;
    };

    self.updateDownloadTrue = function(id, col_name, col_download){

        var def = $q.defer();

        try{
            self.db.executeSql(
                "UPDATE talls_topo25m "+
                "SET "+col_name+" = 'true' "+

                "WHERE id = ?;",
                [id],

                function (res) {

                    def.resolve();

                }, function(res){

                    def.reject(res);
                });

        }catch(e){
            def.reject(e);
        }
        return def.promise;
    };

    /**/

    self.initMBTilesDB =function(isAndroid, path){

        var def = $q.defer();


        try{

            if(isAndroid){

                if(window.sqlitePlugin){


                    self.mbtilesDB = window.sqlitePlugin.openDatabase(
 
                    {name: path, createFromLocation: 3, androidDatabaseImplementation: 2},
  
                    function(){
                        def.resolve(true);
                }, function(e){

                    def.reject(e);
                });

            }else{
                def.reject();
            }

            }else{

                self.mbtilesDB = window.sqlitePlugin.openDatabase({name:path, iosDatabaseLocation: 'Documents'},
                    function(){
                        //this.mbTilesDB = window.sqlitePlugin.openDatabase({name:url}, function(){
                            // console.info("------------------------MBTiles DB oberta OK!");
                            def.resolve(true);

                        }, function(){
                                // console.info("-------------------------MBTiles DB NO oberta KO!");
                            def.reject();
                        });


            }


        }catch(e){
            def.reject(e);
        }

        return def.promise;

    };

    self.getMBTilesValues =function(path){

        var def = $q.defer();

        try{

            self.mbtilesDB.executeSql(
                //   "select * "+
                  "select name as name, value as value "+
                  "from metadata;", [],
                  function (res) {
                      var name = "";
                      var value = "";
                    //   var values = [];
                      var values = {};
                      for(var i = 0; i<res.rows.length; i++){
                            name = res.rows.item(i).name;
                            value = res.rows.item(i).value;
                            values[name] = value;
                      }
                      values.path= path;

                    self.mbtilesDB.executeSql(
                        //   "select * "+
                          "select max(zoom_level) as max_zoom, min(zoom_level) as min_zoom "+
                          "from tiles;", [],
                          function (res) {

                              values.max_zoom = res.rows.item(0).max_zoom;
                              values.min_zoom = res.rows.item(0).min_zoom;

                              def.resolve(values);

                          }, function(){
                            def.reject();
                          });


                }, function(error){
                    CommonFunctionFactory.recordError("Execeute sql" + JSON.stringify(error));
                    def.reject();
                });

        }catch(e){
            CommonFunctionFactory.recordError(e);
            def.reject(e);
        }

        return def.promise;

    };

    self.insertMBTiles = function(values, order, path ) {

        var def = $q.defer();

        var query = "INSERT INTO talls_topo25m(" +
                    "ID, NOM, LON_MIN, LON_MAX, LAT_MIN, LAT_MAX, LON_CENTER, LAT_CENTER, DOWNLOAD, "+
                    "MB, DESCRIPCIO, MUNICIPIS, DATA_DOWNLOAD, EDICIO, DATA, VERSIO, ANY_VOL, URL_BOTIGA, "+
                    "DATA_DOWNLOAD_ORTO, DOWNLOAD_ORTO, MB_ORTO, ID_ORDER) "+
                    "VALUES (?,?)";

        //Catalunya bounds default: 0.1208,40.4887,3.3508,42.8629
        var prev_bounds = isEmpty(values.bounds) ? "0.1208,40.4887,3.3508,42.8629" : values.bounds;
        var bounds = prev_bounds.split(",");

        var name = isEmpty(values.name) ? "Mapa "+(order+1) : values.name;

        //Si no te format per defecte establim JPG
        if(isEmpty(values.format)) values.format = "jpg";
        if(isEmpty(values.min_zoom)) values.min_zoom = 8;
        if(isEmpty(values.max_zoom)) values.max_zoom = 18;


        values[path] = path;

        var obj = {     id: order,
                        id_order: order,
                        nom: name, //values.name,
                        descripcio: values,
                        municipis: "",
                        download: "true",
                        data_download: getCurrentDate(),
                        download_orto: "false",
                        data_download_orto: "",
                        edicio: "",
                        url_botiga: "",
                        data: "",
                        versio: "",
                        any_vol: "",
                        mb: "",
                        mb_orto: "",
                        lon_center: "",
                        lat_center: "",
                        lat_min: Number(bounds[1]).toFixed(10),
                        lat_max: Number(bounds[3]).toFixed(10),
                        lon_min: Number(bounds[0]).toFixed(10),
                        lon_max: Number(bounds[2]).toFixed(10)
        };

        try{
            self.db.executeSql(

                    "INSERT INTO talls_topo25m "+
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    [obj.id, obj.nom, obj.lon_min, obj.lon_max, obj.lat_min, obj.lat_max,
                        obj.lon_center, obj.lat_center, obj.download, obj.mb,
                        JSON.stringify(obj.descripcio), obj.municipis, obj.data_download, obj.edicio,
                        obj.data, obj.versio, obj.any_vol, obj.url_botiga, obj.data_download_orto,
                        obj.mb_orto, obj.id_order
                    ],
                function (resultSet) {
                    obj.picture_path = "map-icon-pure.png";
                    self.mapes.push(obj);
                    def.resolve(obj);

                },function(){
                    def.reject();
            });
        }catch(e){
            def.reject(e);
        }

        return def.promise;
      };

      self.deleteMBTilesAdded = function(id) {

          var def = $q.defer();


          self.db.transaction(function (tx) {

              var query = "DELETE FROM talls_topo25m WHERE id = ?";

              tx.executeSql(query, [id], function (tx, res) {

                console.log("delete from mapes id: "+id);

                updateIndexAddedMBTiles(id).then(
                    function(){
                        def.resolve(true);
                    },function(){
                        def.resolve(false);
                    }
                );

              },
              function (tx, error) {
                  CommonFunctionFactory.recordError('DELETE error: ' + error.message);
                  def.reject();
              });
          }, function (error) {
             CommonFunctionFactory.recordError('transaction error: ' + error.message);
              def.reject(error);
          }, function () {
              def.resolve(true);

          });


          def.resolve(true);
          return def.promise;
      };

    var updateIndexAddedMBTiles = function(id){

        var def = $q.defer();


          self.db.transaction(function (tx) {

              var query = "UPDATE talls_topo25m SET ID = ID - 1 WHERE id > ?";

              tx.executeSql(query, [id], function (tx, res) {
                  self.reinitMapList();
                  def.resolve(true);
              },
              function (tx, error) {
                  CommonFunctionFactory.recordError('update error: ' + error.message);
                  def.reject();
              });
          }, function (error) {
             CommonFunctionFactory.recordError('update transaction error: ' + error.message);
              def.reject(error);
          }
          );

        return def.promise;
    };

    var isEmpty = function(name){
        if(name === undefined || name === "undefined" || name==="") return true;
        else return false;
    };

    return self;
}]);
