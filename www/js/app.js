
angular.module('catoffline', [
  'ionic',
  'ngCordova',
  'leaflet-directive',
  'igTruncate',
  'ngProgress',
  'timer',
  'ionicScroller',
  'ionMdInput',
  'ion-floating-menu',
  'templates'
])

.run(function($ionicPlatform, DBTallsTopoFactory, storageService, GA, $cordovaSplashscreen, $rootScope, $state, $ionicPopup) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

      if(window.analytics){

          window.analytics.startTrackerWithId(GA.id);
      }else{
          //console.info("JESS window.analytics KO");
      }

      //Init storage path
      if(ionic.Platform.isIOS()){

          storageService.initIOS().then(function(){
              if(window.sqlitePlugin){
                  DBTallsTopoFactory.globalInitIOS().then(function(data) {
                          $cordovaSplashscreen.hide();
                    });
              }
          },function(){});

      }else if(ionic.Platform.isAndroid()){

        cordova.plugins.diagnostic.requestRuntimePermissions(function(statuses){
            for (var permission in statuses){
                switch(statuses[permission]){
                    case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                        // $log.info("1Permission granted to use "+permission);
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                        // $log.info("1Permission to use "+permission+" has not been requested yet");
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED:
                        // $log.info("1Permission denied to use "+permission+" - ask again?");
                        break;
                    case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                        // $log.info("1Permission permanently denied to use "+permission+" - guess we won't be using it then!");
                        break;
                }
            }
            // $log.info("Finish");
            }, function(error){
                console.error("The following error occurred: "+error);
            },[
                cordova.plugins.diagnostic.runtimePermission.ACCESS_FINE_LOCATION,
                cordova.plugins.diagnostic.runtimePermission.ACCESS_COARSE_LOCATION,
                cordova.plugins.diagnostic.runtimePermission.READ_EXTERNAL_STORAGE,
                cordova.plugins.diagnostic.runtimePermission.WRITE_EXTERNAL_STORAGE
            ]);

          storageService.logAndroidFileSystem();

          storageService.initAndroid().then(function(){
              if(window.sqlitePlugin){
                  DBTallsTopoFactory.globalInitAndroid().then(function(data) {
                    $cordovaSplashscreen.hide();
                  });
              }
          },function(){
              //console.info("JESS ------------- Init Android Maps KO");
          });
      }

  });
})

    .config(function($stateProvider, $urlRouterProvider, $cordovaInAppBrowserProvider) {

    //$cordovaInAppBrowserProvider.setDefaultOptions(options);

    $stateProvider

    .state('mapList', {
      url: '/',
      templateUrl: 'mapList.html',
      controller: 'MapListController'
    })

    .state('information', {
      url: '/information/',
      templateUrl: 'information.html',
      controller: 'InformationController'
    })

    .state('description', {
      url: '/description/:indexMap',
      templateUrl: 'description.html',
      controller: 'DescriptionController'
    })

    .state('description_vt', {
      url: '/description_vt/:indexMap/:triggerDownload',
      templateUrl: 'description_vt.html',
      controller: 'DescriptionVtController'
    })    

    .state('map', {
      url: '/map/:idMap?type',
      templateUrl: 'map.html',
      controller: 'MapController'
    })

    .state('map_vt', {
      url: '/map_vt/:idMap?type',
      templateUrl: 'map_vt.html',
      controller: 'MapVtController'
    });

    $urlRouterProvider.otherwise('/');

});
