angular.module('catoffline').controller('MapListController',
['$scope',
'$state',
'$log',
'$location',
'$localstorage',
'DBTallsTopoFactory',
'$ionicModal',
'$ionicPopup',
'$cordovaGoogleAnalytics',
'filePickerService',
'fileFactory',
'storageService',
'$cordovaToast',
'CommonFunctionFactory',
function(
  $scope,
  $state,
  $log,
  $location,
  $localstorage,
  DBTallsTopoFactory,
  $ionicModal,
  $ionicPopup,
  $cordovaGoogleAnalytics,
  filePickerService,
  fileFactory,
  storageService,
  $cordovaToast,
  CommonFunctionFactory
) {


    $scope.clearSearch = function() {
        // $log.info("Clear search");
        $scope.search = '';
    };

    $scope.isDownloaded = function(id){
        return ($scope.mapes[id].download == 'true');
    };

    $scope.isDownloadedOrto = function(id){
        return ($scope.mapes[id].download_orto == 'true');
    };

    $scope.isAnyDownloaded = function(id){

        // $log.info($scope.mapes);
        if(!isEmptyObject($scope.mapes[id])){
          return (($scope.mapes[id].download_orto == 'true') || ($scope.mapes[id].download == 'true'));
        }else{
          return false;
        }
    };

    $scope.isAdded = function(id){
        // $log.debug("Is added: "+ (id > 77));
        return (id > 77);
    };

    $scope.isValidMBTiles = function(isDirectory, filename){

      $log.info("isValidMBTiles: "+filename);
      var aux = filename.split(".");

      if(isDirectory || aux[1].indexOf("mbtiles")===-1 || aux[0].match(/[1-77](_orto){0,1}/gi) ){
        return false;
      }else{
        return true;
      }

    };


    $scope.initAddAreaAndroid = function(){

        filePickerService.chooseMBTilesAndroid().then(function(url){

            var originalName = url.substr(url.lastIndexOf('/') + 1);
            var originalPath = url.substr(0, url.lastIndexOf('/') + 1);
            var ext = url.substr(url.lastIndexOf('.') + 1).toLowerCase();


            DBTallsTopoFactory.initMBTilesDB(true, url).then(
              function(){
                DBTallsTopoFactory.getMBTilesValues(url).then(
                  function(res){

                      DBTallsTopoFactory.insertMBTiles(res, $scope.mapes.length, url).then(
                        function(obj){

                        }, function(error){
                          CommonFunctionFactory.recordError("insertMBTiles KO " + JSON.stringify(error));
                        }
                      );

                  },function(error){
                    CommonFunctionFactory.recordError("getMBTilesValues KO " + JSON.stringify(error));
                    $scope.showToast('No s\'han pogut recuperar les metadades del fitxer del mapa.', 'long', 'center');
                  }
                );

              },function(error){
                CommonFunctionFactory.recordError("MBTiles no obert! " + JSON.stringify(error));
                $scope.showToast('Fitxer de mapa no obert correctament.', 'long', 'center');
              }
            );

        },function(error) {
            // something wrong, log it or show a message
            $scope.showToast('El tipus de fixer seleccionat no és correcte.', 'long', 'center');
        });

    };

  $scope.openModalAddAreaIOS = function(){


    fileFactory.getEntries(storageService.storageFiles).then(
                function(entries){

                      $scope.listFiles = entries;
                      $scope.selectedFile = {};

                      $scope.modalAddAreaIOS.show();

                },function(error){
                  $scope.showToast('No s\'ha pogut recuperar el llistat de fitxers disponibles al dispositiu.', 'long', 'center');
                }
            );



  };


    $scope.initAddAreaIOS = function(){

            fileFactory.getEntries(storageService.storageFiles).then(
                function(entries){

                    $log.info(JSON.stringify(entries));

                      $scope.listFiles = entries;
                      $scope.selectedFile = {};

                      var myPopupSelectMBTiles = $ionicPopup.show({                        
                        template: '<ion-list><div ng-repeat="item in listFiles"><ion-radio ng-if="isValidMBTiles(item.isDirectory, item.name)" ng-model="selectedFile.path" ng-value="item.name">{{item.name}}</ion-radio></div></ion-list>',
                        title: 'MBTiles disponibles:',
                        scope: $scope,
                        buttons: [
                          { text: 'Cancel·la',
                            type: 'button-light' },
                          {
                            text: '<b>Ok</b>',
                            type: 'button-royal',
                            onTap: function(e) {

                                if(!isEmpty($scope.selectedFile.path)){
                                  $log.info("File selected: "+ $scope.selectedFile.path);
                                  $scope.addArea($scope.selectedFile.path);
                                }else{
                                  $log.info("File selected empty!");
                                }                                  

                            }
                           }
                         ]
                      });

                },function(){
                  $scope.showToast('No s\'ha pogut recuperar el llistat de fitxers disponibles al dispositiu.', 'long', 'center');
                }
            );

    };

    $scope.addArea = function(url){

            $scope.doingAddArea = true;
            $log.info("Add Area");

            var originalName = url.substr(url.lastIndexOf('/') + 1);
            var originalPath = url.substr(0, url.lastIndexOf('/') + 1);
            var ext = url.substr(url.lastIndexOf('.') + 1).toLowerCase();

            $log.info("addArea url: "+url);
            $log.info("Extensio fitxer: "+ext);

            DBTallsTopoFactory.initMBTilesDB($scope.isAndroid, url).then(
              function(){
                DBTallsTopoFactory.getMBTilesValues(url).then(
                  function(res){

                      $log.info("getMBTilesValues OK: "+JSON.stringify(res));
                      $log.info("$scope.mapes.length: "+ $scope.mapes.length);
                      $log.info("url: "+ url);

                      DBTallsTopoFactory.insertMBTiles(res, $scope.mapes.length, url).then(
                        function(obj){

                          if(!$scope.isAndroid){
                            $scope.modalAddAreaIOS.hide();
                          }
                          $scope.doingAddArea = false;

                        }, function(){
                          CommonFunctionFactory.recordError("insertMBTiles KO");
                          $scope.doingAddArea = false;
                          $scope.showToast('Fitxer de mapa no afegit correctament.', 'long', 'center');

                        }
                      );

                  },function(){
                    CommonFunctionFactory.recordError("getMBTilesValues KO");
                    $scope.doingAddArea = false;
                    $scope.showToast('No s\'han pogut recuperar les metadades del fitxer del mapa.', 'long', 'center');
                  }
                );

              },function(){
                CommonFunctionFactory.recordError("MBTiles no obert!");
                $scope.doingAddArea = false;
                $scope.showToast('Fitxer de mapa no obert correctament.', 'long', 'center');
              }
            );
    };

    $scope.isDoingAddArea = function(){
        return $scope.doingAddArea;
    };

    $scope.pickStoragePath = function(){

      var storagePathPopup = $ionicPopup.confirm({
          title: '<div class="my-popup-title"><b><i class="icon ion-android-folder"></i>&nbsp;RUTA ACTUAL DE DESCÀRREGA:</b></div>',          
          template: '<p class="path-style">'+storageService.storageMBTiles+'</p><div class="separator-path"></div><p class="disclaimer-path-style"><i class="icon ion-alert"></i>&nbsp;&nbsp;Un cop seleccionada una nova ruta no es visualitzaran els mapes ja descarregats a la ruta actual.</p>',

          buttons: [
              { text: 'Cancel·lar', type: 'button-light' },
              {
                  text: 'Modificar',
                  type: 'button-royal',
                  onTap: function(e) {
                          filePickerService.chooseAndroidFolder().then(
                            function(res){
                              $scope.showSpinner = true;
                              storageService.checkValidpath("file://"+res+"/").then(
                                function(success){
                                  if(success){
                                    storageService.updateStorageMBTiles("file://"+res+"/");
                                    $localstorage.setObject("storageMBTiles", "file://"+res+"/");
                                    $scope.showToast("Carpeta de descàrrega actualitzada: file://"+res+"/", "long", "center");
                                    DBTallsTopoFactory.updateAvailableMaps().then(
                                      function(res){
                                        DBTallsTopoFactory.reinitMapList().then(
                                          function(){
                                            $scope.showToast("Mapes disponibles actualitzats", "long", "center");
                                            $scope.mapes = DBTallsTopoFactory.mapes;
                                            $scope.showSpinner = false;

                                          }
                                        );
                                      },function(){
                                        $scope.showSpinner = false;
                                      });
                                  }else{
                                    $scope.showSpinner = false;
                                    $scope.showAlert("Avís", "La carpeta seleccionada no és apta per l'ús de l'aplicació.");
                                  }
                                },function(e){
                                  CommonFunctionFactory.recordError(e);
                                }
                              );
                            },function(e){
                              CommonFunctionFactory.recordError(e);
                            }
                          );
                  }
              }]
      });

    };


    $scope.goToDescription = function(indexMap){

      if(indexMap === 0){
        $state.go('description_vt', {indexMap: indexMap, triggerDownload: false});
      }else{
        $state.go('description', {indexMap: indexMap});
      }

    };

    $scope.showAlert = function(title, message) {
        var alertPopupError = $ionicPopup.alert({
            title: '<div class="my-popup-title"><b>'+title+'</b></div>',
            template: message,
            buttons: [
                {text: 'Ok',
                 type: 'button-royal'}]
        });
        alertPopupError.then(function(res) {
        });
    };

    $scope.showToast = function(message, duration, position){
          $cordovaToast.show(message, duration, position)
              .then(function(success) {
                // success
              }, function (error) {
                CommonFunctionFactory.recordError("Error showing toast " + JSON.stringify(error));
              });
    };

    var isEmpty = function(name){
          if(name === undefined || name === "undefined" || name==="") return true;
          else return false;
    };

    var isEmptyObject = function(obj) {
      for(var prop in obj) {
          if(obj.hasOwnProperty(prop))
              return false;
      }
      return true;
    };


  $scope.$on('$ionicView.beforeEnter', function(){

      $scope.isAndroid = ionic.Platform.isAndroid();
      $scope.mapes = DBTallsTopoFactory.mapes;
      $scope.showSpinner = false;
      $scope.selectFile = "";
      $scope.doingAddArea = false;

  });

  $scope.$on('$ionicView.enter', function(){

      $log.info("$ionicView.enter");
      $log.info($scope.mapes);

      if(!$scope.isAndroid){
              $ionicModal.fromTemplateUrl('modals/addAreaIOS.html', {
                  scope: $scope,
                  animation: 'slide-in-up'
              }).then(function(modal) {
                  $scope.modalAddAreaIOS = modal;
              });
      }

      $ionicModal.fromTemplateUrl('modals/infoVectorTiles.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modalInfoVectorTiles = modal;
                if(true !== $scope.infoVectorTilesShown)
                {
                
                  $scope.infoVectorTilesShown = false;
                  showInfoVectorTiles();

                }
        });

  });

  var showInfoVectorTiles = function() {

    if(!$scope.infoVectorTilesShown && !$localstorage.get("VTInfoSeen", false)) {

      $scope.modalInfoVectorTiles.show();
      $scope.infoVectorTilesShown = true;

    }

  };

  $scope.goToVTDownload = function() {

    $scope.modalInfoVectorTiles.hide();
    $state.go('description_vt', {indexMap: 0, triggerDownload: true});

  };

  $scope.disableVTModal = function() {

    $scope.modalInfoVectorTiles.hide();
    $localstorage.set("VTInfoSeen", true);

  };


}]).filter('searchMaps', function(){
    return function (items, query) {
        var filtered = [];
        var letterMatch = new RegExp(query, 'gi');
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (query) {

                if (letterMatch.test(item.nom) || letterMatch.test(item.municipis) || letterMatch.test(item.id)) {
                    filtered.push(item);
                }
            } else {
                filtered.push(item);
            }
        }
        return filtered;
    };
});
