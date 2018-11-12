angular.module('catoffline').controller('DescriptionController',
[
'$scope',
'$log',
'$stateParams',
'$ionicPopup',
'$ionicPopover',
'downloadFactory',
'DBTallsTopoFactory',
'ngProgressFactory',
'$cordovaInAppBrowser',
'$cordovaGoogleAnalytics',
'$cordovaToast',
'$ionicHistory',
'CommonFunctionFactory',
function(
$scope,
$log,
$stateParams,
$ionicPopup,
$ionicPopover,
downloadFactory,
DBTallsTopoFactory,
ngProgressFactory,
$cordovaInAppBrowser,
$cordovaGoogleAnalytics,
$cordovaToast,
$ionicHistory,
CommonFunctionFactory
) {

    $scope.showSpinner = false;

    $cordovaGoogleAnalytics.trackView('description');

    $scope.mapa = DBTallsTopoFactory.getMapByIdx($stateParams.indexMap);

    $scope.showMapInfo = false;
    $scope.toggleShowMapInfo = function(){
      $scope.showMapInfo = !$scope.showMapInfo;
  };


    $scope.isDownloaded = function(){
        return ($scope.mapa.download == 'true');
    };

    $scope.isDownloadedOrto = function(){
        return ($scope.mapa.download_orto == 'true');
    };

    $scope.isAnyDownloaded = function(id){
        return (($scope.mapa.download_orto == 'true') || ($scope.mapa.download == 'true'));
    };

    $scope.isAdded = function(id){

        return (id > 77);
    };

    $scope.deleteMap = function(type){


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
                    if($scope.isAdded($scope.mapa.id)){
                      DBTallsTopoFactory.deleteMBTilesAdded($scope.mapa.id).then(function(res){

                        $ionicHistory.goBack();
                      });
                    }else{
                      downloadFactory.deleteMap($scope.mapa.id, $scope, type).then(function(res){

                      });
                    }

                }
            }]
        });

    };

    $scope.initDownloadProcess = function(type){

      $scope.checkConnection();

      //Si connexio WIFI fem descarrega directament
      if($scope.isWifiConnection()){

          $scope.showPopupProgress(type);
          downloadFactory.downloadMap($scope.mapa.id, $scope, type).then(function(res){
              $log.info("downbloadMap result:"+res);
              $scope.closePopupProgress();
              if(res){
                  /*GOOGLE ANALYTICS*/
                  $cordovaGoogleAnalytics.trackEvent('description', 'descarregar wifi ok', $scope.mapa.id+'#'+type, 100);
              }else{
                  /*GOOGLE ANALYTICS*/
                  $cordovaGoogleAnalytics.trackEvent('description', 'descarregar wifi error', 'diskSpace:'+$scope.mapa.id+'#'+type, 100);
                  $scope.showAlertError('Espai insuficient','No hi ha prou espai per fer més descarregues. Alliberi espai i torni a intentar-ho.');
              }


          },function(error){

            CommonFunctionFactory.recordError("reject description controller download map");

            if(!isEmpty(error) && error.code && error.code === 4){
              $scope.closePopupProgress();
              $scope.showToast("Descàrrega cancel·lada", "long", "center");

            }else{
              $cordovaGoogleAnalytics.trackEvent('description', 'descarregar wifi error', 'failed:'+$scope.mapa.id+'#'+type, 100);
              $scope.closePopupProgress();
              $scope.showAlertError("Descàrrega fallida", "Hi ha hagut un problema durant la descàrrega del mapa. Torni a intentar-ho i si el problema persisteix contacti amb els desenvolupadors.");
            }


          });

    }else if($scope.is3GConnection()) {

          var confirmPopupDownload3G = $ionicPopup.confirm({
              title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;Avís</b></div>',
              template: '<p>Vol descarregar el mapa sense connexió WIFI?</p><p>La descàrrega del mapa pot suposar un alt consum de les seves dades</p>',

              buttons: [
                  { text: 'No', type: 'button-light' },
                  {
                      text: 'Sí',
                      type: 'button-royal',
                      onTap: function(e) {

                                  $scope.showPopupProgress(type);
                                  downloadFactory.downloadMap($scope.mapa.id, $scope, type).then(function(res){
 
                                      $scope.closePopupProgress();
                                      if(res){
                                          /*GOOGLE ANALYTICS*/
                                          $cordovaGoogleAnalytics.trackEvent('description', 'descarregar 3g ok', $scope.mapa.id+'#'+type, 100);

                                      }else{

                                          $cordovaGoogleAnalytics.trackEvent('description', 'descarregar 3g error', 'diskSpace:'+$scope.mapa.id+'#'+type, 100);
 
                                          $scope.showAlertError('Espai insuficient','No hi ha prou espai per fer més descarregues. Alliberi espai i torni a intentar-ho.');
                                      }

                                  },function(){

                                      if(!isEmpty(error) && error.code && error.code === 4){//FileTransferError.ABORT_ERR
                                        $scope.closePopupProgress();
                                        $scope.showToast("Descàrrega cancel·lada", "long", "center");
                                      }else{
                                        $cordovaGoogleAnalytics.trackEvent('description', 'descarregar 3g error', 'failed:'+$scope.mapa.id+'#'+type, 100);
                                        // $scope.popupProgress.close();
                                        $scope.closePopupProgress();
                                        $scope.showAlertError("Descàrrega fallida", "Hi ha hagut un problema durant la descàrrega del mapa. Torni a intentar-ho i si el problema persisteix contacti amb els desenvolupadors.");
                                      }
                                  });

                      }
                  }]
          });

      }else{
          $scope.showAlertError("Sense connexió", "Impossible iniciar la descàrrega sense connexió a Internet");
      }
    };

    $scope.showAlertError = function(title, message) {
        var alertPopupError = $ionicPopup.alert({

            title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;'+title+'</b></div>',
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

              }, function (error) {
                CommonFunctionFactory.recordError("Error showing toast");
              });
      };


    $scope.showPopupProgress = function(type){

      var mb = (type=="_orto"? $scope.mapa.mb_orto: $scope.mapa.mb);

         $scope.popupProgress = $ionicPopup.show({
              title: '<div class="my-popup-title"><b>'+$scope.mapa.nom+'</b> ('+ mb +'MB)</div>',
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

    $scope.checkConnection = function(){
        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        console.info('Connection type: ' + states[networkState]);
    };

    $scope.isWifiConnection = function(){
        return (navigator.connection.type == Connection.WIFI);
    };

    $scope.is3GConnection = function(){
        return (navigator.connection.type == Connection.CELL_2G ||
            navigator.connection.type == Connection.CELL_3G ||
            navigator.connection.type == Connection.CELL_4G);
    };



    $scope.openWebBotiga = function(){

        $cordovaInAppBrowser.open(
            ''+$scope.mapa.url_botiga+'',
            '_blank',
            {location: 'yes'}).then(
        function(event) {
            $cordovaGoogleAnalytics.trackEvent('description', 'clic_botiga', $scope.mapa.id, 100);

        }).catch(function(event) {
            CommonFunctionFactory.recordError("cordovaInApp browser");
        });

    };

    $scope.$on('$ionicView.leave', function(){
        
        $scope.showSpinner = false;
    });

    $scope.toggleSpinner = function(){
 
            $scope.showSpinner = !$scope.showSpinner;
    };

    var isEmpty = function(name){
          if(name === undefined || name === "undefined" || name==="") return true;
          else return false;
      };

}]);
