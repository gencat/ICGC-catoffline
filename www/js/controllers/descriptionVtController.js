angular.module('catoffline').controller('DescriptionVtController',
[
'$scope',
'$log',
'$stateParams',
'$ionicPopup',
'$ionicPopover',
'downloadFactory',
'zipFactory',
'storageService',
'DBTallsTopoFactory',
'ngProgressFactory',
'$cordovaInAppBrowser',
'$cordovaGoogleAnalytics',
'$cordovaToast',
'$ionicHistory',
'$localstorage',
'CommonFunctionFactory',
'CATOFFLINE_INFO',
function(
$scope,
$log,
$stateParams,
$ionicPopup,
$ionicPopover,
downloadFactory,
zipFactory,
storageService,
DBTallsTopoFactory,
ngProgressFactory,
$cordovaInAppBrowser,
$cordovaGoogleAnalytics,
$cordovaToast,
$ionicHistory,
$localstorage,
CommonFunctionFactory,
CATOFFLINE_INFO
) {



    $scope.showSpinner = false;
    $scope.currentMajorVersion = 0;
    $scope.minAndroidVersionRequired = CATOFFLINE_INFO.minAndroidVersionWebGL;
    $scope.mapa = DBTallsTopoFactory.getMapByIdx($stateParams.indexMap);

    $cordovaGoogleAnalytics.trackView('descriptionvt');
    
    

    $scope.$on('$ionicView.enter', function(){

        if(!$scope.isDownloaded() && ("true" === $stateParams.triggerDownload)) {
        $scope.initDownloadProcess();
      }

      //Comprovar si hi hagut alguna actualitzacío del mbtiles
      if($scope.mapa.download === "true" && (Number($scope.mapa.versio) < CATOFFLINE_INFO.currentVtVersion)){

        var confirmUpdateVectorTiles = $ionicPopup.confirm({
              title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;Avís</b></div>',
              template: '<p>S\'ha detectat una nova versió del mapa. Vol descarregar la versió actualitzada?</p>',
              buttons: [
                  { text: 'No', type: 'button-light' },
                  {
                      text: 'Sí',
                      type: 'button-royal',
                      onTap: function(e) {
                        $scope.initDownloadProcess("");
                      }
                  }]
          });
      }

    });

    $scope.$on('$ionicView.beforeEnter', function() {

      if(ionic.Platform.isAndroid() ){
        var version = ""+ ionic.Platform.version() + "";
        $scope.currentMajorVersion = Number(version.split(".")[0]);
      }

    });

    $scope.makeAndroidDisabled = function(){

      return ionic.Platform.isAndroid() && ($scope.currentMajorVersion < $scope.minAndroidVersionRequired);

    };  

    $scope.isDownloaded = function(){
        return ($scope.mapa.download == 'true');
    };

    $scope.deleteMapVt = function(){

        var confirmDeleteMap = $ionicPopup.confirm({
            title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;Avís</b></div>',
            template: 'Vol eliminar el mapa?',
            buttons: [
            { text: 'No',
              type: 'button-light' },
            {
            text: 'Sí',
            type: 'button-royal',
            onTap: function(e) {

                      downloadFactory.deleteMap($scope.mapa.id, $scope, '').then(function(res){

                          storageService.removeRecursively(storageService.storageMBTiles, "glyphs").then(function(res){

                            showToast("Mapa i fitxers associats eliminats correctament", "long", "bottom");
                          });
                      });
                      
                      storageService.removeFile(storageService.storageMBTiles, "normal6-12_v12.mbtiles").then(
                        function(){}, function(error){
                          $log.error("Error esborrant Mbtiles ombres ");
                        }
                      );                   
                }
            }]
        });
    };

    var startUnzip = function(src){

      showPopupProgressUnzip('');  
      zipFactory.unzipFile($scope, src, '').then(
        function(){

          $localstorage.set("VTInfoSeen", true);
          $scope.closePopupProgressUnzip();
        },function(){
          $scope.closePopupProgressUnzip();
        }
      );

    };

    var startDownloading = function(mode){

      showPopupProgress('');          
      downloadFactory.downloadZip($scope.mapa.id, $scope, '').then(function(res){

          $log.info("startDownloading result:"+res);
          $scope.closePopupProgress();
          if(res.success){
              /*GOOGLE ANALYTICS*/
              $cordovaGoogleAnalytics.trackEvent("descriptionvt", "descarregar "+mode+" ok", $scope.mapa.id+'#', 100);
              startUnzip(res.path);
          }else{
              /*GOOGLE ANALYTICS*/
              $cordovaGoogleAnalytics.trackEvent("descriptionvt", "descarregar "+mode+" error", "diskSpace:"+$scope.mapa.id+'#'+type, 100);
              showAlertError("Espai insuficient","No hi ha prou espai per fer més descarregues. Alliberi espai i torni a intentar-ho.");
          }

      },function(error){

        CommonFunctionFactory.recordError("reject description controller download map");

        if(!CommonFunctionFactory.isEmpty(error) && error.code && error.code === 4){
          $scope.closePopupProgress();
          showToast("Descàrrega cancel·lada", "long", "center");

        }else{

          $scope.closePopupProgress();
          showAlertError("Descàrrega fallida", "Hi ha hagut un problema durant la descàrrega del mapa. Torni a intentar-ho i si el problema persisteix contacti amb els desenvolupadors.");
        }

      });
    };

    $scope.initDownloadProcess = function(type){

      if(isWifiConnection()){

        startDownloading("wifi");

      }else if(is3GConnection()) {//Informem connexió no wifi

          var confirmPopupDownload3G = $ionicPopup.confirm({
              title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;Avís</b></div>',
              template: '<p>Vol descarregar el mapa sense connexió WIFI?</p><p>La descàrrega del mapa pot suposar un alt consum de les seves dades</p>',
              buttons: [
                  { text: 'No', type: 'button-light' },
                  {
                      text: 'Sí',
                      type: 'button-royal',
                      onTap: function(e) {
                        startDownloading("3G");
                      }
                  }]
          });

      }else{
          showAlertError("Sense connexió", "Impossible iniciar la descàrrega sense connexió a Internet");
      }
    };


    //PopUP alert error generic, passem titol i missatge a mostrar
    var showAlertError = function(title, message) {
        var alertPopupError = $ionicPopup.alert({
            title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;'+title+'</b></div>',
            template: message,
            buttons: [
                {text: 'Ok',
                 type: 'button-royal'}]
        });
        alertPopupError.then(function(res) {});
    };

    var showToast = function(message, duration, position){
          $cordovaToast.show(message, duration, position)
              .then(function(success) {
                // success
              }, function (error) {
                CommonFunctionFactory.recordError("Error showing toast");
              });
    };


    var showPopupProgress = function(type){

         $scope.popupProgress = $ionicPopup.show({
              title: '<div class="my-popup-title"><b>'+$scope.mapa.nom+'</b> ('+ $scope.mapa.mb +'MB)</div>',
              template: 'Descarregant<span class="one">.</span><span class="two">.</span><span class="three">.<br><progress ng-hide="downloadProgress==100;" max="100" value="{{downloadProgress}}"></progress>'+
              '<span ng-show="downloadProgress==100;">Descàrrega finalitzada</span>'+
              '',
              scope: $scope,
              buttons: [
                {
                  text: '<b>Cancel·la</b>',
                  type: 'button-outline button-royal',
                  onTap: function(e) {
                      $log.info("cancel.la descarrega!!");
                      downloadFactory.abortDownloadMap();
                      $scope.popupProgress.close();
                  }
                 }
               ]
          });

          $scope.closePopupProgress = function(){
              $scope.popupProgress.close();
          };

    };

    //Popup progres unzip
    var showPopupProgressUnzip = function(type){

         $scope.popupProgressUnzip = $ionicPopup.show({
              title: '<div class="my-popup-title"><b>'+$scope.mapa.nom+'</b> ('+ $scope.mapa.mb +'MB)</div>',
              template: 'Descomprimint fitxers<span class="one">.</span><span class="two">.</span><span class="three">.<br>'+
              '',
              scope: $scope,
              buttons: [

               ]
          });

          $scope.closePopupProgressUnzip = function(){
              $scope.popupProgressUnzip.close();
          };

    };    

    var isWifiConnection = function(){
        return (navigator.connection.type == Connection.WIFI);
    };

    var is3GConnection = function(){
        return (navigator.connection.type == Connection.CELL_2G ||
            navigator.connection.type == Connection.CELL_3G ||
            navigator.connection.type == Connection.CELL_4G);
    };

}]);
