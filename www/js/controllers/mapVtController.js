angular.module('catoffline').controller('MapVtController',
['$scope',
'$log',
'$http',
'$stateParams',
'$ionicSideMenuDelegate',
'$ionicSlideBoxDelegate',
'$ionicModal',
'$ionicPopup',
'$cordovaGeolocation',
'$cordovaToast',
'$localstorage',
'$cordovaInAppBrowser',
'storageService',
'filePickerService',
'iconFactory',
'fileFactory',
'geojsonFactory',
'cameraFactory',
'DBLlocsFactory',
'DBTallsTopoFactory',
'CATOFFLINE_INFO',
'VT_STYLES',
'CommonFunctionFactory',
'$cordovaSocialSharing',
'$timeout',
'$cordovaGoogleAnalytics',
'authService',
'authInterceptor',
'INSTAMAPS_ACTIONS',
'$httpParamSerializerJQLike',
'DBExtraDataFactory',
'uploadFactory',
function(
	$scope,
	$log,
	$http,
  $stateParams,
	$ionicSideMenuDelegate,
	$ionicSlideBoxDelegate,
	$ionicModal,
	$ionicPopup,
	$cordovaGeolocation,
	$cordovaToast,
	$localstorage,
	$cordovaInAppBrowser,
	storageService,
	filePickerService,
	iconFactory,
	fileFactory,
	geojsonFactory,
	cameraFactory,
	DBLlocsFactory,
  DBTallsTopoFactory,
	CATOFFLINE_INFO,
	VT_STYLES,
	CommonFunctionFactory,
	$cordovaSocialSharing,
	$timeout,
	$cordovaGoogleAnalytics,
	authService,
	authInterceptor,
	INSTAMAPS_ACTIONS,
	$httpParamSerializerJQLike,
	DBExtraDataFactory,
	uploadFactory
) {


//Inicialitzem controller

	$scope.settings = {
			bsize : 2,
			myshape : 'button-rodo',
			bsizeClass: 'button-size2',
			navicon : 'img/gps_blue.png',
			navicon_modal : 'img/gps_blue.png'
	};

	//MODE DEBUG per escriure fitxer de logs
	$scope.debugMode = false;  

	//LListat de fitxers de punts
	$scope.poisFilesList = {};
	$scope.tracksFilesList = {};
	$scope.importedFilesList = {};
	$scope.extraDataList = {};

	$scope.showPoisFilesList = true;
	$scope.showTracksFilesList = true;
	$scope.showImportedFilesList = true;
	$scope.showExtraDataList = true;

	$scope.showRefugis = false;
	$scope.showCampings = false;
	$scope.showTurRural = false;
	$scope.showAlbergs = false;

	//Per fer proves de GPS, treure a PROD
	$scope.provalat = 0;
	$scope.provalng = 0;

	$scope.currentImported = {};
	$scope.currentTrack = {};


	var mbtiles_topo = {};
	var mbtiles_orto = {};
	var mbtiles_nat = {};

	$scope.enabledCercaLloc = false;
	$scope.showSpinner = false;
	$scope.resCerca = [];

	$scope.currentWatchHeading = null;

	/*
	MODE TRACKING
	0 -> off
	1 -> on
	2 -> pause
	*/
	$scope.modeTracking = 0;

	$scope.GPSactiu = false;
	$scope.GPSgettingPos = false;
	$scope.currentPositionGettingPos = false;
	$scope.focusMap = false;
	$scope.estilFocusMap = '';
	$scope.countErrorGPS = 0;

	$scope.doingLogin = false;
	$scope.doingPublish = false;

	$scope.myFileDataMap = {filename: "",downloadFormat: "gpx"};
	$scope.fileFormatList = [{ text: "GPX", value: "gpx" },{ text: "KML", value: "kml" }];

	var mapState;
	var rotationChanged = false;

	var timeEventTouch = 0;
	var isDrag = false;
	var isTouchEvent = false;
	

/******************************************************/
/********************* ESTATS  ************************/
/******************************************************/

	$scope.$on('$ionicView.enter', function() {

      $scope.mapa = DBTallsTopoFactory.getMapByIdx($stateParams.idMap);
      $scope.initType = $stateParams.type;

			mapState = $localstorage.getObject(""+$scope.mapa.id+"");
			$log.info(mapState);

			// L.mapbox.accessToken = 'pk.eyJ1IjoiaWJlc29yYSIsImEiOiJjajNkYzFjZXAwMDAwMndwY2w4bDUyN2VtIn0.q1VJCpeta1ZYDNNZJcyPbw';
			mapboxgl.accessToken = 'pk.eyJ1IjoiaWJlc29yYSIsImEiOiJjajNkYzFjZXAwMDAwMndwY2w4bDUyN2VtIn0.q1VJCpeta1ZYDNNZJcyPbw';

			initTemplates();
			loadMap();
			initDirectories();

			$scope.currentWatchHeading = null;
			backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;
			$scope.isAndroid = ionic.Platform.isAndroid();

	});

	$scope.$on('$ionicView.beforeEnter', function() {

      $scope.settings = {
        bsize : 2,
        myshape : 'button-rodo',
        bsizeClass: 'button-size2',
        navicon : 'img/gps_blue.png',
        navicon_modal : 'img/gps_blue.png'
      };

			backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;
			$scope.isAndroid = ionic.Platform.isAndroid();

			//init cerca llocs_i_elevacions
			DBLlocsFactory.init();
			DBExtraDataFactory.init();

	});

	//Al sortir, desactivem GPS en cas que estigui actiu i parem tracking si esta actiu
	$scope.$on('$ionicView.leave', function(){

			navigator.compass.clearWatch($scope.currentWatchHeading);
			if($scope.GPSactiu){
					$scope.disableGPS();
			}else if($scope.modeTracking !== 0){
					$scope.showAlert("Traça finalitzada", "S'ha finalitzat la traça en curs.");
					$scope.stopTracking();
			}

			$localstorage.setObject(""+$scope.mapa.id+"", {"prevBounds": $scope.mapVT.getBounds(), "prevCenter": $scope.mapVT.getCenter(), "prevZoom": $scope.mapVT.getZoom(), "poisFilesList": $scope.poisFilesList, "tracksFilesList": $scope.tracksFilesList, "importedFilesList": $scope.importedFilesList });

			//tanquem DB
			DBLlocsFactory.closeDB();
			DBExtraDataFactory.closeDB();

	});

/***************************************2***************/
/********************* GENERAL ************************/
/******************************************************/

	var updateCompassFunction = function() {

		if(rotationChanged)
		{

			var newHeading = 360 - Math.floor($scope.mapVT.getBearing());
			document.getElementById("compass-icon").style.transform = "rotate(" + newHeading + "deg)";
			rotationChanged = false;

		}

	};

	$scope.veureInstaMaps = function(){
			if(authService.isAuthenticated){
					publicarMapaInstamaps();
			}else{
					$scope.modalLogingInstamaps.show();
			}
	};

	$scope.doLoginInstamaps = function(dataLogin){

				$cordovaGoogleAnalytics.trackEvent('mapvt', 'login instamaps', dataLogin.username, 100);

				$scope.doingLogin = true;
				authService.login(dataLogin.username, dataLogin.password).then(

						function(success){
								$scope.doingLogin = false;
								if(success){
										$scope.modalLogingInstamaps.hide();
										publicarMapaInstamaps();
								}else{
										$scope.showAlert("Error", "Nom d'usuari o contrasenya incorrecte");

								}
						},function(error){
								$scope.doingLogin = false;

								CommonFunctionFactory.recordError("Error al fer inici de sessió " + JSON.stringify(error));

								$scope.showAlert("Error", "Error inici de sessió");
						}
				);
		};

		$scope.doLogoutInstamaps = function(){

				authService.logout();
		};

		$scope.checkLogin = function(){

				return authService.isAuthenticated;
		};

		$scope.doLoginInstamapsGoogle = function() {

				$scope.doingLogin = true;

				var html = authService.loginSocialGoogle();

				$scope.modalLoginGoogle = $ionicModal.fromTemplate(html, {
						scope: $scope,
						animation: 'slide-in-up'
					});

					$scope.modalLoginGoogle.show();

		};

		var publicarMapaInstamaps = function(){


				$cordovaGoogleAnalytics.trackEvent('mapvt', 'publicar instamaps', $scope.mapa.id+"#"+authService.uid, 100);

				$scope.doingPublish = true;
				$scope.modalPusblishInstamaps.show();
				$scope.urlMapInstamapsEmbed = "";

				var currentZoom = Math.round($scope.mapVT.getZoom());
				var currentLat = $scope.mapVT.getCenter().lat;
				var currentLng = $scope.mapVT.getCenter().lng;

				var options = {
						zoom: currentZoom,
						center: currentLat+","+currentLng
				};


				$scope.map.mapNameInstamaps = ( CommonFunctionFactory.isEmpty($scope.map.mapNameInstamaps) ? 'Catalunya Offline ' + CommonFunctionFactory.getCurrentDate()+'' : $scope.map.mapNameInstamaps );

				var mydata = {
						"token": ''+authService.authToken+'',
						"mapName": $scope.map.mapNameInstamaps, //'Catalunya Offline ' + getCurrentDate()+'',
						"uid": ''+authService.uid+'',
						"myFile": ''+JSON.stringify(getCurrentDataMap($scope.map.uploadPictures))+'',
						"options": ''+JSON.stringify(options)+''
				};

				var myUrl = INSTAMAPS_ACTIONS.host_app_https + INSTAMAPS_ACTIONS.createMapInstamaps;// + toparams(mydata) +'&';

				$http({
						method: "POST",
						url: myUrl,
						data: $httpParamSerializerJQLike(mydata),
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				}).then(function successCallback(response) {

						$scope.map.mapNameInstamaps = "";
						$scope.doingPublish = false;
						if(response.data.status == "OK"){
								$log.info("url visor:" + response.data.url);
								$scope.urlMapInstamaps = response.data.url;
								$scope.urlMapInstamapsEmbed = $scope.urlMapInstamaps.replace("http://", "https://") + "&embed=1" + "#"+currentZoom+"/"+currentLat+"/"+currentLng+"";

						}else if(response.data.results == "expired"){

								$scope.doLogoutInstamaps();
								$scope.doingPublish = false;
								$scope.modalPusblishInstamaps.hide();
								$scope.modalLogingInstamaps.show();
						}else{

								CommonFunctionFactory.recordError("Error create map!");
								$scope.showAlert("Mapa no publicat", "No s'ha pogut publicar el mapa. Torni a intentar-ho.");
								$scope.doingPublish = false;
								$scope.modalPusblishInstamaps.hide();
						}

					}, function errorCallback(response) {

						CommonFunctionFactory.recordError("KO: "+ JSON.stringify(response));
						$scope.showAlert("Error", "No s'ha pogut publicar el mapa. Torni a intentar-ho.");
						$scope.doingPublish = false;
						$scope.modalPusblishInstamaps.hide();
				});
		};

		$scope.socialShare = function(socialType){

				$cordovaGoogleAnalytics.trackEvent('mapvt', 'share instamaps', $scope.mapa.id+"#"+socialType, 100);

				if(socialType == "twitter"){
						$cordovaSocialSharing.shareViaTwitter('El meu mapa de '+$scope.mapa.nom+' a #instamaps, fet amb #CatalunyaOffline: ', null, $scope.urlMapInstamaps)
								.then(socialShareSuccess());

				}else if(socialType == "facebook"){
						$cordovaSocialSharing.shareViaFacebook('El meu mapa de '+$scope.mapa.nom+' a #instamaps, fet amb #CatalunyaOffline: ', null, $scope.urlMapInstamaps)
								.then(socialShareSuccess());

				}else if(socialType == "whatsapp"){
						$cordovaSocialSharing.shareViaWhatsApp('El meu mapa de '+$scope.mapa.nom+' a InstaMaps, fet amb CatalunyaOffline: ', null, $scope.urlMapInstamaps)
								.then(socialShareSuccess());

				}else if(socialType == "email"){
						$cordovaSocialSharing.shareViaEmail('El meu mapa de '+$scope.mapa.nom+' a InstaMaps, fet amb CatalunyaOffline:<br><br>'+$scope.urlMapInstamaps, 'Mapa de Catalunya Offline a InstaMaps', null, null, null, null)
								.then(socialShareSuccess());
				}
		};

		var socialShareSuccess = function(){

		};
		var socialShareError = function(){

				$scope.showAlert("Problema al compartir", "No s'ha pogut compartir el mapa. Torni a intentar-ho.");
		};

		$scope.openWebInstamaps2 = function(url){

				$cordovaInAppBrowser.open(
						url,
						'_blank',
						{location: 'yes'}).then(
				function(event) {

				}).catch(function(event) {
						CommonFunctionFactory.recordError("cordovaInApp browser " + JSON.stringify(event));
				});
		};

		$scope.openWebInstamaps = function(url){

				window.open(url, '_system');
		};

		$scope.isDoingLogin = function(){
				return $scope.doingLogin;
		};
		$scope.isDoingPublish = function(){
				return $scope.doingPublish;
		};

  	var loadMap = function(){

  	  var mapStyle = VT_STYLES.estil25000_elevation; //default2;
  	  var maxZoom = 14.99;
  	  var minZoom = 7;

  	  if($scope.mapa.id === 0){


  	  	//mapStyle = VT_STYLES.estil_mamata_ombra;

  	  	if(ionic.Platform.isAndroid()){

	      var path = storageService.storagePathBase + $scope.mapa.id +".mbtiles";	 
	      mapStyle.sources.mtc25mcatoff.tiles[0] = JSON.stringify({
	      	name: path.substring(7),
	      	location: 2,
	      	createFromLocation: 2,
	      	androidDatabaseImplementation: 2
	      });
      
	      var path_normals = storageService.storagePathBase + "normal6-12_v12.mbtiles";
	      mapStyle.sources.normals0.tiles[0] = JSON.stringify({
	      	name: path_normals.substring(7),
	      	location: 2,
	      	createFromLocation: 2,
	      	androidDatabaseImplementation: 2
	      });
      
	      mapStyle.glyphs = storageService.storagePathBase + "glyphs/{fontstack}/{range}.pbf";
	      mapStyle.sprites = storageService.storagePathBase + "sprites/maki";

  	  }else if(ionic.Platform.isIOS()){

  	  	mapStyle.sources.mtc25mcatoff.tiles[0] = JSON.stringify({name:$scope.mapa.id +".mbtiles", location: 'default' });
  	  	mapStyle.sources.normals0.tiles[0] = JSON.stringify({name: "normal6-12_v12.mbtiles", location: 'default' });

  	  	mapStyle.glyphs = storageService.storageMBTiles + "glyphs/{fontstack}/{range}.pbf";
	    mapStyle.sprites = storageService.storageMBTiles + "sprites/maki";
  	  }


  	  } else {

	  	mapStyle = VT_STYLES.mode_raster; //default2;
	  	
	  	maxZoom = 16;
  	 	minZoom = 8;

		var path_topo = "";
		var path_orto = "";

		if(ionic.Platform.isIOS()){
			path_topo = $scope.mapa.id +".mbtiles";
			path_orto = $scope.mapa.id +"_orto.mbtiles";

	  	  	mapStyle.sources.orto.tiles[0] = JSON.stringify({name: path_orto, location: 'default' });
	  	  	mapStyle.sources.topo.tiles[0] = JSON.stringify({name: path_topo, location: 'default' });		

		}else{

			var prev_path = storageService.storageMBTiles+ $scope.mapa.id +".mbtiles";
			path_topo = prev_path.substring(7);

			var prev_path_orto = storageService.storageMBTiles+ $scope.mapa.id +"_orto.mbtiles";
			path_orto = prev_path_orto.substring(7);

			if($scope.mapa.download == 'true'){
				mapStyle.sources.topo.tiles[0] = JSON.stringify({
					name: path_topo,
					location: 2,
					createFromLocation: 2,
					androidDatabaseImplementation: 2
				});
			}

			if($scope.mapa.download_orto == 'true'){

				mapStyle.sources.orto.tiles[0] = JSON.stringify({
					name: path_orto,
					location: 2,
					createFromLocation: 2,
					androidDatabaseImplementation: 2
				});
			}


	      	mapStyle.sources.base.tiles[0] = JSON.stringify({
					name: "A250plus_gm_8a12.mbtiles",
					location: 1,
					createFromLocation: 2,
					androidDatabaseImplementation: 2
				});

			mapStyle.glyphs = storageService.storagePathBase + "glyphs/{fontstack}/{range}.pbf";
			mapStyle.sprites = storageService.storagePathBase + "sprites/maki";

		}

  	  }


  		$scope.mapVT = new mapboxgl.Map({
  			container: 'mapvt',
  			center:    (mapState.prevCenter ? [mapState.prevCenter.lng, mapState.prevCenter.lat]:[2.6360,41.7447]),//[2.6360,41.7447], //[2.0023, 41.418], //[8.3221, 46.5928],
  			zoom:      (mapState.prevZoom ? mapState.prevZoom : 13),
  			maxZoom:   maxZoom, //14.99,
  			minZoom:   minZoom, //7,
  			style:     mapStyle 
  		});		

  		setInterval(updateCompassFunction, 100);

  		$scope.mapVT.on("dragend", function(event, args) {
  			$scope.focusMap = false;
  			// $log.info("dragend");
  			$scope.toggleCompass(true);
  		});

		
  		$scope.mapVT.on("rotate", function(event, args) {
  			rotationChanged = true;
  		});


  		if(ionic.Platform.isAndroid()){

  			$scope.mapVT.on("contextmenu", function(e) {
  				$scope.currentMarker = new Marker(e.lngLat.lat, e.lngLat.lng);
  				addNewPosition(e.lngLat.lng, e.lngLat.lat, "", false);
  			});

  		}else{

  			$scope.mapVT.on("touchstart", function(e) {

	  			isTouchEvent = true;

	  			$timeout(function(){
	  				if(!isDrag && isTouchEvent){
						$scope.currentMarker = new Marker(e.lngLat.lat, e.lngLat.lng);
  						addNewPosition(e.lngLat.lng, e.lngLat.lat, "", false);
	  				}
	  				isDrag = false;
	  			}, 2000);
  			});

	  		$scope.mapVT.on("touchend", function(e) {

	  			isTouchEvent = false;
	  		});

	  		$scope.mapVT.on("dragstart", function(event, args) {

				isDrag = true;
  			});
  		}


      $scope.mapVT.on('load', function () {
        // $log.info("Map loaded.......");
        loadPunts();
      });

  	};


    var loadPunts = function(){


      $scope.mapVT.addLayer({
        "id": "points",
        "type": "symbol",
        "source": {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [2.6360,41.7447]
                    },
                    "properties": {
                        "title": "Mapbox DC",
                        "icon": "monument"
                    }
                }, {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [1.9281, 41.32733]
                    },
                    "properties": {
                        "title": "Mapbox SF",
                        "icon": "harbor"
                    }
                }]
            }
        },
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
        }
    });

    };

  	var initDirectories = function(){

  			storageService.initDir(storageService.storagePathBase , ""+$scope.mapa.id+"").then(
  					function(){

  							storageService.initDir(storageService.storagePathBase+$scope.mapa.id+"/" , "pois").then(
  									function(){
  											$scope.initPoisFilesList((mapState.poisFilesList || {}));
  							});
  							storageService.initDir(storageService.storagePathBase+$scope.mapa.id+"/" , "tracks").then(
  									function(){
  											$scope.initTracksFilesList((mapState.tracksFilesList || {}));
  							});
  							storageService.initDir(storageService.storagePathBase+$scope.mapa.id+"/" , "imported").then(
  									function(){
  											$scope.initImportedFilesList((mapState.importedFilesList || {}));
  							});

  							$scope.initExtraDataList((mapState.extraDataList || {}));

  							if($scope.debugMode){
  									storageService.initDir(storageService.storagePathBase+$scope.mapa.id+"/" , "logs").then(
  											function(){
  													storageService.createFile(storageService.storagePathBase+$scope.mapa.id+"/logs", $scope.filenameLog).then(
  															function(){
  																	$scope.writeLog("initDirLog", "Directori i fitxer de logs creat ok!");
  															},function(){
  															}
  													);
  									});
  							}
  					}
  			);

  	};

		var initTemplates = function(){

			$ionicModal.fromTemplateUrl('modals/trackInfo.html', {
								scope: $scope,
								animation: 'slide-in-up'
						}).then(function(modal) {
								$scope.modalTrackInfo = modal;
			});

			$ionicModal.fromTemplateUrl('modals/createTrackInfo.html', {
							scope: $scope,
							animation: 'slide-in-up'
					}).then(function(modal) {
							$scope.modalCreateTrackInfo = modal;
			});

			$ionicModal.fromTemplateUrl('modals/loginInstamaps.html', {
							scope: $scope,
							animation: 'slide-in-up'
					}).then(function(modal) {
							$scope.modalLogingInstamaps = modal;
			});

			$ionicModal.fromTemplateUrl('modals/publishInstamaps.html', {
							scope: $scope,
							animation: 'slide-in-up'
					}).then(function(modal) {
							$scope.modalPusblishInstamaps = modal;
			});

			$ionicModal.fromTemplateUrl('modals/addPosition.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					$scope.modalPosition = modal;
			});

			$ionicModal.fromTemplateUrl('modals/image-popover.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					$scope.modalImagePopover = modal;
			});

			$ionicModal.fromTemplateUrl('modals/importedInfo.html', {
							scope: $scope,
							animation: 'slide-in-up'
					}).then(function(modal) {
							$scope.modalImportedInfo = modal;
			});

			$ionicModal.fromTemplateUrl('modals/openFilesList.html', {
								scope: $scope,
								animation: 'slide-in-up'
						}).then(function(modal) {
								$scope.modalFilesList = modal;
			});     

			$ionicModal.fromTemplateUrl('modals/settings.html', {
								scope: $scope,
								animation: 'slide-in-up'
						}).then(function(modal) {
								$scope.modalSettings = modal;
			}); 

			$ionicModal.fromTemplateUrl('modals/resultatCercaLlocs.html', {
							scope: $scope,
							animation: 'slide-in-up'
					}).then(function(modal) {
							$scope.modalResCercaLlocs = modal;
			});               

		};

		$scope.toggleFocusMap2 = function(){

	      if(!$scope.enabledCercaLloc){

	        if( ($scope.GPSactiu && !$scope.focusMap) || ($scope.modeTracking !== 0 && !$scope.focusMap) ){
	                
	                $scope.focusMap = true;
	                $scope.mapVT.setCenter([($scope.GPSactiu ? $scope.now.getLngLat().lng : $scope.now.lng ), ($scope.GPSactiu ? $scope.now.getLngLat().lat : $scope.now.lat )]);
	        
	        } else if($scope.GPSactiu && $scope.focusMap) {

	        	$scope.disableGPS();

	    	}else{
	            $scope.locate();
	            $scope.showToast("Iniciem posicionament...", "short", "center");
	        }
	      }

		};

	$scope.closeModalSettings = function(){

					$scope.modalSettings.hide();

					if($scope.settings.bsize === '0'){
							$scope.settings.bsizeClass = 'button-size0';

					}else if($scope.settings.bsize === '1'){
							$scope.settings.bsizeClass = 'button-size1';

					}else if($scope.settings.bsize === '2'){
							$scope.settings.bsizeClass = 'button-size2';

					} else if($scope.settings.bsize === '3'){
							$scope.settings.bsizeClass = 'button-size3';
					}

					if($scope.now){
						var newNow = creaMarcador($scope.settings.navicon.replace("gps_", ""));
						var latlng = $scope.now.getLngLat();
						
						$scope.now.remove();	
						delete $scope.now;
						$scope.now = newNow.setLngLat(latlng).addTo($scope.mapVT);

					} 

					$localstorage.setObject("settings", $scope.settings);

					$cordovaGoogleAnalytics.trackEvent('mapvt', 'settings_size', $scope.settings.bsize, 100);
					$cordovaGoogleAnalytics.trackEvent('mapvt', 'settings_shape', $scope.settings.myshape, 100);
					$cordovaGoogleAnalytics.trackEvent('mapvt', 'settings_navicon', $scope.settings.navicon, 100);
	};

/******************************************************************/
/************************** GESTIONAR DADES    ********************/
/******************************************************************/

	$scope.toggleGroupPois = function() {
			$scope.showPoisFilesList = !$scope.showPoisFilesList;
	};
	$scope.toggleGroupTracks = function() {
			$scope.showTracksFilesList = !$scope.showTracksFilesList;
	};
	$scope.toggleGroupImported = function() {
			$scope.showImportedFilesList = !$scope.showImportedFilesList;
	};
	$scope.togglePublishInstamaps = function() {
			$scope.showPublishInstamaps = !$scope.showPublishInstamaps;
	};
	$scope.toggleDownloadData = function() {
			$scope.showDownloadData = !$scope.showDownloadData;
	};
	$scope.toggleGroupExtraData = function() {
			$scope.showExtraDataList = !$scope.showExtraDataList;
	};
	

	$scope.openFolder = function(){

				$scope.map = {
						mapNameInstamaps : '',
						uploadPictures: true
				};
				$scope.modalFilesList.show();
	};


/****************************************************/
/********************* GPS **************************/
/****************************************************/

	$scope.locate = function(){

			if($scope.debugMode) $scope.writeLog("LOCATE", "Entrem a locate... gps actiu:"+$scope.GPSactiu);

			if(!$scope.GPSactiu){

					if($scope.debugMode) $scope.writeLog("LOCATE", "Activem GPS.....");
					$scope.GPSgettingPos = true;

					var posOptions = {timeout: 60000, enableHighAccuracy: true};

					$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {

							if($scope.debugMode) $scope.writeLog("LOCATE", "GPS Iniciat OK, troba primera posicio");

							$scope.GPSgettingPos = false;

							$scope.mapVT.setCenter([position.coords.longitude, position.coords.latitude]);

							$scope.now = creaMarcador($scope.settings.navicon.replace("gps_", ""));
							$scope.now.setLngLat([position.coords.longitude, position.coords.latitude])
								.addTo($scope.mapVT);


							var iconAngle = (position.coords.heading!==null ? position.coords.heading: 0);
							
							$scope.GPSactiu = true;
							$scope.focusMap = true;

							var watchOptions = {
									maximumAge:Infinity,
									timeout : 30000,
									enableHighAccuracy: true // may cause errors if true
							};


							$scope.currentWatchPosition = $cordovaGeolocation.watchPosition(watchOptions);

							var count = 0;
							$scope.currentWatchPosition.then(
									function(){
											count++;
											// $log.info("on success watchPosition:"+count);

									},function(err) {
											count++;
											$scope.countErrorGPS++;
											$log.error("ERROR watchPosition "+count+": "+JSON.stringify(err));

											if($scope.debugMode) $scope.writeLog("LOCATE", "ERROR watchPosition "+count+": "+JSON.stringify(err));
									},
									function(position) {
											count++;
											$scope.countErrorGPS = 0;

											if($scope.focusMap){
													$scope.mapVT.setCenter([position.coords.longitude, position.coords.latitude]);
											}

											var iconAngle = (position.coords.heading!==null ? position.coords.heading: 0);

											$scope.now.setLngLat([position.coords.longitude, position.coords.latitude])
												.addTo($scope.mapVT);

							});

					}, function(error) {
							$scope.GPSgettingPos = false;
							$log.error("Location error!");
							$log.error("GPS error code:"+error.code);
							if ($scope.debugMode) $scope.writeLog("LOCATE", "ERROR getCurrentPosition:" +JSON.stringify(error));
							logErrorLocation(error);

							$scope.disableGPS();
					});

			}else{
					$scope.disableGPS();
			}
	};

	$scope.disableGPS = function(){
		if($scope.now)
			$scope.now.remove();
		
		delete $scope.now;

		if ($scope.currentWatchPosition !== undefined) $scope.currentWatchPosition.clearWatch();
		$scope.focusMap = false;
		$scope.GPSactiu = false;
		$scope.provalat = -1;
		$scope.provalng = -1;
	};

	var logErrorLocation = function(error){
			$cordovaGoogleAnalytics.trackEvent('mapvt', 'location error', $scope.mapa.id+"#"+error.code, 100);

			$log.error("logErrorLocation");

			$log.error("GPS error:"+JSON.stringify(error));

			switch (error.code) {
					case error.PERMISSION_DENIED:
							$log.warn("Please share your location with us to move ahead.");
							$scope.showAlert("Impossible geolocalitzar","Si us plau , compartiu la vostra ubicació amb nosaltres per geolocalitzar");
							if($scope.debugMode) $scope.writeLog("logErrorLocation", "Si us plau , compartiu la vostra ubicació amb nosaltres per geolocalitzar");
							break;
					case error.POSITION_UNAVAILABLE:
							$log.warn("Location information is not available, Check your internet connection.");
							$scope.showAlert("Impossible geolocalitzar", "La informació d'ubicació no està disponible.");
							if($scope.debugMode) $scope.writeLog("logErrorLocation", "La informació d'ubicació no està disponible.");
							break;
					case error.TIMEOUT:
							$log.warn("The request to get user location timed out.");
							$scope.showAlert("Impossible geolocalitzar", "La sol·licitud per obtenir la ubicació actual no ha obtingut resposta.");
							if($scope.debugMode) $scope.writeLog("logErrorLocation", "La sol·licitud per obtenir la ubicació actual no ha obtingut resposta.");
							break;
					case error.UNKNOWN_ERROR:
							$log.warn("We are not able to fetch your location details.");
							$scope.showAlert("Impossible geolocalitzar", "Per motius desconeguts, és impossibe mostrar la ubicació.");
							if($scope.debugMode) $scope.writeLog("logErrorLocation", "Per motius desconeguts, és impossibe mostrar la ubicació.");
							break;
			}
	};

/******************************************************/
/********************* EXTRA DATA *******************/
/******************************************************/

    $scope.initExtraDataList = function(localExtraDataList){


        var defaultVis = false;
        if(angular.equals({}, localExtraDataList)){
            $scope.extraDataList = {
                1: {
                    name: "Campings",
                    visible: false,
                    path_icon: 'camping.png',
                    markers: []
                },
                0: {
                    name: "Refugis",
                    visible: false,
                    path_icon: 'refugi.png',
                    markers: []
                },
                2: {
                    name: "Turisme Rural",
                    visible: false,
                    path_icon: 'rural.png',
                    markers: []
                },
                3: {
                    name: "Albergs",
                    visible: false,
                    path_icon: 'alberg.png',
                    markers: []
                }
            };
        }else{
            $scope.extraDataList = JSON.parse(localExtraDataList);
        }
    };

    $scope.visibleExtraData = function(id){

        if($scope.extraDataList[id].visible){

            //for(marker of $scope.extraDataList[id].markers) {
            for(var i=0, len=$scope.extraDataList[id].markers.length; i<len; ++i) {

            	var marker = $scope.extraDataList[id].markers[i];
            	marker.remove();
            	//delete marker;

            }

            $scope.extraDataList[id].visible = false;

        }else{

            $log.info("Fem extra data VISIBLE...");

            DBExtraDataFactory.getGeojsonData($scope.mapa.id, id).then(
                function(geojson){

                    if(CommonFunctionFactory.isEmpty(geojson)){
                        $scope.showToast("No existeix informació disponible sobre "+$scope.extraDataList[id].name+" a la zona actual", "long", "center");
                    }else{

                    	var obj = JSON.parse(geojson);
                    	for(var i=0, len=obj.features.length; i<len; ++i) {
                    		var feature = obj.features[i];
                    	//for(feature of obj.features) {

                    		var path_icon = 'img/'+$scope.extraDataList[id].path_icon;
                    		var tipus_name = $scope.extraDataList[id].name;
                    		var marker = creaMarcador(path_icon, [20, 20]);
                        	
                        	var isLinkNotNull = (null !== feature.properties["enllaç"]);

     
                    		var hasProtocol = (isLinkNotNull && ((-1 != feature.properties["enllaç"].indexOf('http://')) || -1 != feature.properties["enllaç"].indexOf('https://')));
                    		
                    		var link = isLinkNotNull ? (!hasProtocol ? "http://" : "") + feature.properties["enllaç"] : "";


                    		var html =
	                          "<div>"+
	                              "<p>"+tipus_name+": <b>"+ feature.properties.nom.toUpperCase() +"</b><br>"+
	                              "Municipi: <b>"+feature.properties.nommuni+"</b>"+
	                              (null !== feature.properties["enllaç"] ? 
	                              	// "<br>Enllaç: <a href=\"" + openWebLink(link) +"\">"+feature.properties["enllaç"]+"</a><br>" :
	                              	"<br>Enllaç: "+feature.properties["enllaç"]+"<br>" :
	                              	""
	                              ) +
	                          "</p></div>";

	                      marker.setLngLat(feature.geometry.coordinates).setPopup(new mapboxgl.Popup({}).setHTML(html)).addTo($scope.mapVT);
	                      $scope.extraDataList[id].markers.push(marker);

                    	}

                      $scope.extraDataList[id].visible = true;

                    }

                },function(error){
                    CommonFunctionFactory.recordError("Error llegint fitxer:"+JSON.stringify(error));
                    $scope.showAlert("Informació no afegida", "No s'ha pogut afegir la informació al mapa.");
                }
            );
        }
    };

	var openWebLink = function(link){
		$log.info(link);

    };


/******************************************************************/
/*************************** CERCA LLOCS    ***********************/
/******************************************************************/

	$scope.openCercaLloc = function(){
			$scope.cercaLloc = "";
			$scope.enabledCercaLloc = !$scope.enabledCercaLloc;
	};

	$scope.initCercaLloc = function(event){

      event.stopPropagation();
      event.preventDefault();

			$scope.showSpinner = true;
			$scope.enabledCercaLloc = !$scope.enabledCercaLloc;
			$scope.resCerca = [];

			DBLlocsFactory.cercaLloc($scope.cercaLloc).then(
					function(res){
							$scope.showSpinner = false;
							if(res.length === 0){
									$scope.showAlert("Sense resultats","La cerca no ha trobat cap resultat");
							}else{
									$scope.resCerca = res;
									$scope.modalResCercaLlocs.show();
							}
					},
					function(){
							$scope.showSpinner = false;
							$scope.showAlert("Sense resultats","La cerca no ha trobat cap resultat");
					}
			);
	};

	$scope.addLlocPosition = function(toponim, latitud, longitud){

		$cordovaGoogleAnalytics.trackEvent('mapvt', 'currentposition point', $scope.mapa.id, 100);
		$scope.modalResCercaLlocs.hide();
		addNewPosition(longitud, latitud, toponim, true);

	};


/**************************************************************/
/********************* TRACTEM PUNTS **************************/
/**************************************************************/

	var Marker = function(lat,lng) {

			var coordsETRS89 = proj4('+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs', [ lng, lat]);//$scope.coordsToETRS89(lat, lng);
			this.id = "";
			this.lat  = lat;
			this.lng  = lng;
			this.x = coordsETRS89[0];
			this.y = coordsETRS89[1];
			this.name = "";
			this.description = "";
			this.icon = iconFactory.orangeIcon;
			this.iconName = 'orangeIcon';
			this.images = [];
	};
	//Init de current Marker
	$scope.currentMarker = new Marker(0,0);

	var getNewMarker = function(color){
		return new mapboxgl.AwesomeMarker(color);
	};

	$scope.initPoisFilesList = function(localPoisList){


		//Quan es mati l'aplicació, sortira tot activat
		var defaultVis = true;

		fileFactory.getEntries(storageService.storagePathBase+$scope.mapa.id+"/pois/").then(
				/* jshint ignore:start */
				function(entries){

						for (var i=0; i<entries.length; i++){

								if(entries[i].name.indexOf(".geojson")!=-1){
										storageService.readFile(storageService.storagePathBase+$scope.mapa.id+"/pois/", entries[i].name).then(
												function(text){

														var obj = JSON.parse(text);
														var isVisible = (!localPoisList[obj.properties.id] ? defaultVis : localPoisList[obj.properties.id].visible);

														$scope.poisFilesList[obj.properties.id] = {
																name: obj.properties.name, //nom,
																visible: isVisible,
																data: obj
														};

														var imagesObj = [];

														if(angular.isArray(obj.properties.images)){
															imagesObj = obj.properties.images;
														}else if(!CommonFunctionFactory.isEmpty(obj.properties.images)){
															imagesObj = obj.properties.images.split(",");
														}


                            $scope.mapVT.addSource(""+obj.properties.id+"", {
                                "type": "geojson",
                                "data": $scope.poisFilesList[obj.properties.id].data//obj
                            });

                            var pointColor = iconNameToHexColor(obj.properties.iconName);
                            $scope.mapVT.addLayer({ 
                                "id": ""+obj.properties.id+"",

                                "type": "circle",
                                "source": ""+obj.properties.id+"",
         
                                "paint": {
                                    "circle-radius": 10,
                                    "circle-color": pointColor //iconNameToHexColor(obj.properties.iconName)
                                }
                            });

                            $scope.mapVT.on('click', ""+obj.properties.id+"", function (e) {

                              $log.info(e.features[0]);

                              openModalPosition(
                                  e.features[0].properties.id,
                                  obj.geometry.coordinates[1],
                                  obj.geometry.coordinates[0],
                                  e.features[0].properties.name,
                                  e.features[0].properties.description,
                                  e.features[0].properties.iconName,
                                  iconFactory[e.features[0].properties.iconName],
                                  imagesObj);
                              // }
                            });                            
														
														if(!isVisible){																	
                              $scope.mapVT.setLayoutProperty(obj.properties.id, "visibility", "none");		
														}
														
												},function(error){
														$log.error("Error llegintfitxer");
												});
								}
						}
				},function(error){
						$log.error("error get entries");
				}
				/* jshint ignore:end */
		);
	};

	$scope.getCurrentPosition = function(){

		$cordovaGoogleAnalytics.trackEvent('mapvt', 'currentposition point', $scope.mapa.id, 100);

		var posOptions = {timeout: 30000, enableHighAccuracy: true};
		$scope.currentPositionGettingPos = true;
		$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {

				//$log.info("Acaba current position...");
				$scope.currentPositionGettingPos = false;

				addNewPosition(position.coords.longitude, position.coords.latitude, "", true);

		}, function(err) {
					// error
					$scope.currentPositionGettingPos = false;
					logErrorLocation(err);
			});

	};

	var createGeojsonMarker = function(id, name, icon, lng, lat) {

		return {
					"type": 'Feature',
					"geometry": {
						"type": 'Point',
						"coordinates": [lng, lat]
					},
					"properties": {
						"id": id,
						"name": name,
						"description": "",
						"images": [],
						"icon": icon,
						"iconName": "orangeIcon",
						"marker-symbol": "marker"
					}
				};

	};

	var addNewPosition = function(lng, lat, pname, flyTo){

				var id = makeId();
				
				var name = (CommonFunctionFactory.isEmpty(pname) ? CommonFunctionFactory.getCurrentDate() : pname );
				//var name = CommonFunctionFactory.getCurrentDate();

				var geojsonMarker = createGeojsonMarker(id, name, iconFactory.orangeIcon, lng, lat);

				//Afegim el nou poi al llistat de files pois
				$scope.poisFilesList[id] = {
						name: name, //"Punt", //nom,
						visible: true,
						data: geojsonMarker
				};


				$scope.mapVT.addSource(""+id+"", {
						"type": "geojson",
						"data": $scope.poisFilesList[id].data //geojsonMarker
				});


				$scope.mapVT.addLayer({
						"id": ""+id+"",
						"type": "circle",
						"source": ""+id+"",         
						"paint": {
								"circle-radius": 10,
								"circle-color": "#E46C0A"
						}
				});

				$scope.mapVT.on('click', ""+id+"", function (e) {

					openModalPosition(
							e.features[0].properties.id,
							lat,
							lng,
							e.features[0].properties.name,
							e.features[0].properties.description,
							e.features[0].properties.iconName,
							iconFactory[e.features[0].properties.iconName],
							JSON.parse(e.features[0].properties.images));
					// }
				});




				//Creem fitxer geojson associat
				geojsonFactory.createGeojsonPointVT(geojsonMarker, $scope.mapa.id).then(function(){
						//mostrem dialeg del punt
						openModalPosition(
								id,
								lat,
								lng,
								name,
								"",
								'orangeIcon',
								iconFactory.orangeIcon,
								[]);

				}, function(){
						$log.error("Create geojson file of point KO...");
						$scope.showToast("Problema en la creació del fitxer associat al punt", "long", "center");

				});

				if(flyTo){
					$scope.mapVT.flyTo({
						center: [lng, lat],
						zoom: $scope.mapVT.getZoom()
					});  
				} 
	};

	var openModalPosition = function(id, lat, lng,name,description,iconName,icon,images){
		$scope.modalPosition.show();
		var coordsETRS89 = proj4('+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs', [ lng, lat]);//$scope.coordsToETRS89(lat, lng);
		$scope.currentMarker.id = id;
		$scope.currentMarker.lat = lat;
		$scope.currentMarker.lng = lng;
		$scope.currentMarker.x = coordsETRS89[0];
		$scope.currentMarker.y = coordsETRS89[1];
		$scope.currentMarker.name = name;
		$scope.currentMarker.description = description;
		$scope.currentMarker.iconName = iconName;
		$scope.currentMarker.icon = icon;
		$scope.currentMarker.images = images;
		$ionicSlideBoxDelegate.update();
	};

	$scope.saveLocation = function() {

		$scope.modalPosition.hide();

		if(CommonFunctionFactory.isEmpty($scope.currentMarker.name)){
				$scope.currentMarker.name = CommonFunctionFactory.getCurrentDate();//$scope.currentTrack.id;
		}

		var geojsonMarker = $scope.poisFilesList[$scope.currentMarker.id].data; //$scope.mapVT.getSource($scope.currentMarker.id)._data;
		geojsonMarker.properties.name = $scope.currentMarker.name;
		geojsonMarker.properties.description = $scope.currentMarker.description;
		geojsonMarker.properties.icon = iconFactory[$scope.currentMarker.iconName];
		geojsonMarker.properties.iconName = $scope.currentMarker.iconName;
		geojsonMarker.properties.images = $scope.currentMarker.images;

		//Actualitzem llista de files pois
		$scope.poisFilesList[$scope.currentMarker.id].name = $scope.currentMarker.name;

		//Creem fitxer geojson associat, si ja existia el substitueix
		geojsonFactory.createGeojsonPointVT(geojsonMarker, $scope.mapa.id).then(
				function(){
					$scope.poisFilesList[$scope.currentMarker.id].data = geojsonMarker;
					$scope.mapVT.getSource($scope.currentMarker.id).setData(geojsonMarker);
					$scope.mapVT.setPaintProperty($scope.currentMarker.id, 'circle-color', iconNameToHexColor($scope.currentMarker.iconName));
				}, function(){
					$log.error("Create geojson file of point KO...");
					$scope.showToast("Punt no actualitzat correctament", "short", "bottom");
				}
		);
	};

	$scope.updateIcon = function(iconName){
				$scope.currentMarker.iconName = iconName;
	};

	$scope.takePointPicture = function(){

				$cordovaGoogleAnalytics.trackEvent('mapvt', 'picture point', $scope.mapa.id, 100);

				var options = {
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: Camera.PictureSourceType.CAMERA,
						correctOrientation: true
				};

				cameraFactory.getPicture(options).then(function(imageURI) {

						var oldFilename = imageURI.substr(imageURI.lastIndexOf('/') + 1);
						var oldPath = imageURI.substr(0, imageURI.lastIndexOf('/') + 1);
						var newFilename = "pic_"+ makeId()+".jpg";
						var newPath = storageService.storagePathBase+$scope.mapa.id+"/pois/";

						storageService.moveFile(oldPath, oldFilename, newPath, newFilename).then(
								function(){

										$scope.currentMarker.images.push(newFilename);

										$ionicSlideBoxDelegate.update();
								},function(){
						});
				}, function(err) {
						$log.error("get picture error!");
						$log.error(err);
				});
	};

	$scope.urlForImage = function(imageName){
			var trueOrigin = storageService.storagePathBase+$scope.mapa.id+"/pois/"+ imageName;

			return trueOrigin;
	};

	$scope.showImages = function(index) {

		$scope.activeSlide = index;
		$scope.modalImagePopover.show();
	};

	$scope.deleteCameraPicture = function(indexPicture){

		$scope.currentMarker.images.splice(indexPicture, 1);
		$scope.modalImagePopover.hide();
	};

	$scope.sharePoiPicture = function(picture){

			$cordovaGoogleAnalytics.trackEvent('mapvt', 'share poi picture', $scope.mapa.id, 100);
			var file = $scope.urlForImage(picture);


			var name = (CommonFunctionFactory.isEmpty($scope.currentMarker.name) ? "Punt a ": "Punt "+$scope.currentMarker.name+" a ");
			var description = (CommonFunctionFactory.isEmpty($scope.currentMarker.description) ? ". ": ": "+$scope.currentMarker.description+". ");
			var coordenades = "GEO: ("+$scope.currentMarker.lat.toFixed(3)+" - "+$scope.currentMarker.lng.toFixed(3)+") i UTM: ("+$scope.currentMarker.x.toFixed(3)+" - "+$scope.currentMarker.y.toFixed(3)+")";
			var message = name + $scope.mapa.nom+""+description+" Capturat amb #CatalunyaOffline. "+coordenades;


			$cordovaSocialSharing.share(
													message,
													"#CatalunyaOffline", //subject
													file,
													null) //link
					.then(function(result) {

					}, function(err) {
							$log.error("ERROR social sharing...");
					});
	}; 

	$scope.cleanMarker = function(){
		$scope.modalPosition.hide();
		if($scope.currentMarker.id){
				$scope.deletePoi($scope.currentMarker.id);
		}
	};

	$scope.deletePoi = function(poiId){
			//Delete del seu fitxer
			storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/pois/", poiId+".geojson").then(
					function(){
						
						$scope.mapVT.removeLayer(poiId);
						$scope.mapVT.removeSource(poiId);
						
						//Delete del llistat de pois
						delete  $scope.poisFilesList[poiId];

					},function(error){
							$scope.showAlert("Punt no eliminat", "No s'ha pogut eliminar el punt. Torni a intentar-ho.");
					}
			);

	};

	$scope.visiblePoi = function(poiId){

			if($scope.poisFilesList[poiId].visible){

					$scope.mapVT.setLayoutProperty(poiId, 'visibility', 'none');
					$scope.poisFilesList[poiId].visible = false;
			}else{
				$scope.mapVT.setLayoutProperty(poiId, 'visibility', 'visible');
				$scope.poisFilesList[poiId].visible = true;
			}

	};

	$scope.isPoiVisible = function(poiId){

			return ($scope.poisFilesList[poiId] && $scope.poisFilesList[poiId].visible === true);
	};


	$scope.goToPoi = function(poiId){
			//$log.info("goToPoi");
			$scope.focusMap = false;

			$log.info(poiId);
			var coord = $scope.poisFilesList[poiId].data.geometry.coordinates; //$scope.mapVT.getSource(poiId)._data.geometry.coordinates;
			$scope.mapVT.flyTo({
				center: [coord[0], coord[1]],
				zoom: 12
			});

			$scope.modalFilesList.hide();
	};

	$scope.showInfoPoiFilesList= function(poiId){

			if($scope.isPoiVisible(poiId)){
					openModalPosition(
							poiId,
							$scope.poisFilesList[poiId].data.geometry.coordinates[1],
							$scope.poisFilesList[poiId].data.geometry.coordinates[0],
							$scope.poisFilesList[poiId].data.properties.name,
							$scope.poisFilesList[poiId].data.properties.description,
							$scope.poisFilesList[poiId].data.properties.iconName,
							$scope.poisFilesList[poiId].data.properties.icon,//iconFactory[$scope.markers[poiId].iconName]
							$scope.poisFilesList[poiId].data.properties.images);
			}else{ }
	};       

/******************************************************************/
/*************************** TRACTEM TRACKS ***********************/
/******************************************************************/

	$scope.openModalTrack = function(){
			//currentTrack.timeInterval
			if($scope.modeTracking === 0){
					$scope.currentTrack = {
							color: '#E46C0A',
							numPosicions: 0,
							longitudTrack: 0,
							timeInterval: 5,
							latlngs: [],
							t_ini: '', t_fi: '',
							duration: '',
							current_lat: '',
							current_lng: '',
							current_alt: '',
							alt_max: 0, alt_min: 1000000
					};
					$scope.timeIntervalTag = $scope.currentTrack.timeInterval + " sec.";
			}
			$scope.modalCreateTrackInfo.show();
	};


	var callbackFnTrack = function(location) {

			if($scope.debugMode) $scope.writeLog("callbackFnTrack", JSON.stringify(location));

					 $scope.currentPosition = location;

					 if($scope.focusMap){
							$scope.mapVT.setCenter([location.longitude, location.latitude]);
					 }

					 $scope.now.lat  = (!CommonFunctionFactory.isEmpty(location.latitude) ? location.latitude: $scope.now.lat); //location.latitude;
					 $scope.now.lng = (!CommonFunctionFactory.isEmpty(location.longitude) ? location.longitude: $scope.now.lng); //location.longitude;
					 $scope.now.iconAngle = (!CommonFunctionFactory.isEmpty(location.bearing) ? location.bearing: 0);
					 $scope.now.setLngLat([$scope.now.lng, $scope.now.lat]).addTo($scope.mapVT);

					 $scope.currentTrack.current_lat = (!CommonFunctionFactory.isEmpty(location.latitude) ? location.latitude: $scope.now.lat);
					 $scope.currentTrack.current_lng = (!CommonFunctionFactory.isEmpty(location.longitude) ? location.longitude: $scope.now.lng);//location.longitude;
					 $scope.currentTrack.current_alt = (!CommonFunctionFactory.isEmpty(location.altitude) ? location.altitude: 0);
	};

	var failureFnTrack = function(error) {
		 CommonFunctionFactory.recordError('BackgroundGeolocation error:' + JSON.stringify(error));
	};

	$scope.startTracking = function(){

			if($scope.debugMode) $scope.writeLog("startTracking", "");

			$scope.modalCreateTrackInfo.hide();
			CommonFunctionFactory.onStartTracking($scope);

			if($scope.GPSactiu){
					if($scope.now)
						$scope.now.remove();

					delete  $scope.now;
					$scope.currentWatchPosition.clearWatch();
					$scope.GPSactiu = false;
			}

			//Inicialitzem GPS
			var posOptions = {timeout: 30000, enableHighAccuracy: true};
			$scope.GPSgettingPos = true;
			$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
					$scope.GPSgettingPos = false;
					$scope.focusMap = true;

					//Inicialitzaem variables current
					$scope.currentPosition = position.coords;
					$scope.lastPosition = position.coords;

					$scope.modeTracking = 1;

					//Centrem el mapa
					$scope.mapVT.setCenter([position.coords.longitude, position.coords.latitude]);

					$scope.currentTrack.id = makeId();
					$scope.currentTrack.numPosicions = 1;
					$scope.average = 0.0;
					var alt = (position.coords.altitude!==null ? position.coords.altitude: 0);
					$scope.currentTrack.current_lat = position.coords.latitude;
					$scope.currentTrack.current_lng = position.coords.longitude;
					$scope.currentTrack.current_alt = alt; //(position.coords.altitude!==null ? position.coords.altitude: 0)
					$scope.currentTrack.t_ini = CommonFunctionFactory.getCurrentDate();


					var newGeojsonTrack = {
							"type": "FeatureCollection",
							"style": {
								"opacity": 0.75,
								"weight": 4,
								"fillColor": $scope.currentTrack.color,
								"color": $scope.currentTrack.color,
								"fillOpacity": 0.75
							},
							"features": [{
									"type": "Feature",
									"geometry": {
											"type": "LineString",
											"coordinates": [[position.coords.longitude, position.coords.latitude]]
									}
							}]
						};

					$scope.tracksFilesList[$scope.currentTrack.id] = {
						name: $scope.currentTrack.name,
						visible: true,
						data: newGeojsonTrack
					};

					addTrackToMap($scope.currentTrack.id);

					if(!$scope.now) 
						$scope.now = creaMarcador($scope.settings.navicon.replace("gps_", ""));

					$scope.now.setLngLat([position.coords.longitude, position.coords.latitude]).addTo($scope.mapVT);


					if($scope.isAndroid){

							backgroundGeolocation.configure(callbackFnTrack, failureFnTrack, {
									desiredAccuracy: 10,
									stationaryRadius: 15,
									distanceFilter: 5,
									debug: false,
									interval: 5000 //TODO canviar al parametre del timer tick directament?
							});

					}else{

							backgroundGeolocation.configure(callbackFnTrack, failureFnTrack, {
									desiredAccuracy: 10,
									stationaryRadius: 15,
									distanceFilter: 5,
									activityType: 'Fitness',
									pauseLocationUpdates: false //TODO canviar al parametre del timer tick directament?
							});
					}

					backgroundGeolocation.start();

					$scope.startTimer();

					/*GOOGLE ANALYTICS*/
					$cordovaGoogleAnalytics.trackEvent('mapvt', 'start tracking', $scope.mapa.id, 100);

			}, function(err) {
					$scope.GPSgettingPos = false;
					// error
					$log.error("Location error!");
					$log.error(err);
					$scope.showAlert("Impossible geolocalitzar","Senyal insuficient");
			});

	};

	$scope.restartTracking = function(){

			$scope.modalCreateTrackInfo.hide();
			$scope.modeTracking = 1;
			$scope.resumeTimer();
			CommonFunctionFactory.onRestartTracking($scope);
	};

	var compassOk = function(heading) {

		$scope.mapVT.setBearing(heading.magneticHeading);

	};

	var compassError = function(error) {
		CommonFunctionFactory.recordError("Compass error: " + error.code);

	};

	$scope.changeTilt = function() {

		$scope.mapVT.setPitch(($scope.mapVT.getPitch() + 30) % 90);

	};

	$scope.toggleCompass = function(maintain) {

		var shouldMaintain = maintain || false;

		if(null !== $scope.currentWatchHeading || shouldMaintain) 
		{

			navigator.compass.clearWatch($scope.currentWatchHeading);
			$scope.currentWatchHeading = null;

			if(!shouldMaintain) {

				document.getElementById("compass-icon").style.transform = "rotate(0deg)";
				$scope.mapVT.setBearing(0);

			}

		}
		else
		{

			$scope.currentWatchHeading = navigator.compass.watchHeading(compassOk, compassError);

		}

	};

	$scope.stopTracking = function(){

			$scope.modalCreateTrackInfo.hide();
			$scope.modeTracking = 0;

			if($scope.now)
					$scope.now.remove();

			if(!$scope.focusMap) {

				delete $scope.now;

			}

			CommonFunctionFactory.onStopTracking($scope);

			$log.info("Desactivem watch tracking...");
			// $scope.currentTrackingPosition.clearWatch();
			backgroundGeolocation.stop();
			backgroundGeolocation.finish();

			if($scope.debugMode) $scope.writeLog("stopTracking", "");

			if(CommonFunctionFactory.isEmpty($scope.currentTrack.name)){
					$scope.currentTrack.name = CommonFunctionFactory.getCurrentDate();//$scope.currentTrack.id;
			}

			$scope.stopTimer();

			$scope.currentTrack.t_fi = CommonFunctionFactory.getCurrentDate();

			$cordovaGoogleAnalytics.trackEvent('mapvt', 'stop tracking', $scope.mapa.id, 100);

			$scope.locate();

			//Creem fitxer geojson associat, si ja existia el substitueix
			geojsonFactory.createGeojsonTrack($scope.currentTrack, $scope.mapa.id).then(
					function(geojsonFile){
							//$log.info("Create geojson file of track OK:    "+geojsonFile);
							geojsonFileObj = JSON.parse(geojsonFile);

							$scope.tracksFilesList[$scope.currentTrack.id] = {
									name: $scope.currentTrack.name,//name,
									visible: true,
									data: geojsonFileObj
							};

					}, function(){
							CommonFunctionFactory.recordError("Create geojson file of track KO...");
			});

	};

	$scope.pauseTracking = function(){

			$scope.modalCreateTrackInfo.hide();
			$scope.modeTracking = 2;
			$scope.stopTimer();
			CommonFunctionFactory.onPauseTracking($scope);
	};

	$scope.initTracksFilesList = function(localTracksList){

			var defaultVis = true;

			/* jshint ignore:start */
			fileFactory.getEntries(storageService.storagePathBase+$scope.mapa.id+"/tracks/").then(
					function(entries){
							for (var i=0; i<entries.length; i++){
									if(entries[i].name.indexOf(".geojson")!=-1){
											storageService.readFile(
													storageService.storagePathBase+$scope.mapa.id+"/tracks/", entries[i].name).then(
															function(text){

																	var obj = JSON.parse(text);
																	var isVisible = (!localTracksList[obj.id] ? defaultVis : localTracksList[obj.id].visible);
																	$scope.tracksFilesList[obj.id] = {
																			name: obj.name, //nom,
																			visible: isVisible,
																			data: obj
																	};

                                  addTrackToMap(obj.id);

                                  $scope.mapVT.on('click', obj.id, function (e) {
                                    showInfoTrack(e.features[0]);
                                  });

                                  if(!isVisible){
                                    $scope.mapVT.setLayoutProperty(obj.id, "visibility", "none");
                                  }
                                  

															},function(error){
																	//Error
																	CommonFunctionFactory.recordError("Error llegint fitxer " + JSON.stringify(error));
													});
									}
							}
					},function(error){
							CommonFunctionFactory.recordError("error get entries " + JSON.stringify(error));
					}
			);
			/* jshint ignore:end */
	};

	$scope.cleanTrack = function(){
			$scope.modalTrackInfo.hide();
			if($scope.currentImported.id){
					deleteTrack($scope.currentImported.id);
			}
	};

	var addTrackToMap = function(trackId){

		$scope.mapVT.addLayer({
				"id": "" + trackId,
				"type": "line",
				 "source": {
						"type": "geojson",
						"data": $scope.tracksFilesList[trackId].data
				 },
				"layout": {
						"line-join": "round",
						"line-cap": "round"
            // "visibility": modeVisible
				},
				"paint": {
						"line-color": $scope.tracksFilesList[trackId].data.style.color,
						"line-width": $scope.tracksFilesList[trackId].data.style.weight,
						"line-opacity": $scope.tracksFilesList[trackId].data.style.opacity
				}
		});		 

	};

	$scope.deleteTrack = function(trackId){

			storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/tracks/", trackId+".geojson").then(
					function(){

							$scope.mapVT.removeLayer(trackId);
							$scope.mapVT.removeSource(trackId);

							delete  $scope.tracksFilesList[trackId];
					},function(error){
							$scope.showAlert("Track no eliminat", "No s'ha pogut eliminar la traça. Torni a intentar-ho.");
					}
			);
	};

	$scope.visibleTrack= function(trackId){


		if($scope.tracksFilesList[trackId].visible){
				//$log.info("Fem poi NO visible!");
				$scope.mapVT.setLayoutProperty(trackId, 'visibility', 'none');
				$scope.tracksFilesList[trackId].visible = false;
		}else{
			$scope.mapVT.setLayoutProperty(trackId, 'visibility', 'visible');
			$scope.tracksFilesList[trackId].visible = true;
		}    

	};

	$scope.isTrackVisible = function(trackId){

			return ($scope.tracksFilesList[trackId] && $scope.tracksFilesList[trackId].visible === true);
	};

	$scope.goToTrack = function(trackId){

			$scope.focusMap = false;
      var bbox = turf.bbox($scope.tracksFilesList[trackId].data);
			$scope.mapVT.fitBounds(bbox);
			$scope.modalFilesList.hide();
	};

	var showInfoTrack = function(feature){

			$scope.currentImported.idLayer = feature.layer.id;
			$scope.currentImported.description = feature.properties.description; //$scope.geojson[trackId].data.features[0].properties.description;
			$scope.currentImported.name = feature.properties.name;

			$scope.currentImported.color = feature.layer.paint["line-color"];
			$scope.currentImported.geomType = feature.layer.type;
			$scope.currentImported.index = feature.properties.index;
			$scope.currentImported.longitud = feature.properties.longitud;
			$scope.currentImported.id = feature.properties.id;
			$scope.currentImported.num_positions = feature.properties.num_positions;

			$scope.currentImported.t_ini = feature.properties.t_ini;
			$scope.currentImported.t_fi = feature.properties.t_fi;
			$scope.currentImported.duration = feature.properties.duration;
			$scope.currentImported.alt_max = feature.properties.alt_max;
			$scope.currentImported.alt_min = feature.properties.alt_min;

			$scope.modalTrackInfo.show();
	};

	$scope.showInfoTrackFilesList = function(trackId){

			var dataSource = $scope.tracksFilesList[trackId].data; //$scope.mapVT.getSource(trackId)._data;

			$scope.currentImported.idLayer = trackId; //feature.layer.id;
			$scope.currentImported.description = dataSource.features[0].properties.description; //$scope.geojson[trackId].data.features[0].properties.description;
			$scope.currentImported.name = dataSource.features[0].properties.name;

			$scope.currentImported.color = dataSource.style.color;
			$scope.currentImported.geomType = 'LineString';

			$scope.currentImported.index = dataSource.features[0].properties.index;
			$scope.currentImported.longitud = dataSource.features[0].properties.longitud;
			$scope.currentImported.id = dataSource.features[0].properties.id;
			$scope.currentImported.num_positions = dataSource.features[0].properties.num_positions;

			$scope.currentImported.t_ini = dataSource.features[0].properties.t_ini;
			$scope.currentImported.t_fi = dataSource.features[0].properties.t_fi;
			$scope.currentImported.duration = dataSource.features[0].properties.duration;
			$scope.currentImported.alt_max = dataSource.features[0].properties.alt_max;
			$scope.currentImported.alt_min = dataSource.features[0].properties.alt_min;

			$scope.modalTrackInfo.show();
	};

	$scope.startTimer = function (){
			$scope.$broadcast('timer-start');
			//$scope.timerRunning = true;
	};
	$scope.resumeTimer = function (){
			$scope.$broadcast('timer-resume');
			//$scope.timerRunning = true;
	};
	$scope.stopTimer = function (){
		$scope.$broadcast('timer-stop');
	};
	$scope.onTimeout = function() {
		$scope.$broadcast('timer-tick-gps');
	};

	$scope.$on('timer-start', function (event, data){

			$scope.myTimerTracking = $timeout($scope.onTimeout, $scope.currentTrack.timeInterval*1000);
			$scope.timerRunning = true;
	});
	$scope.$on('timer-resume', function (event, data){

			$scope.myTimerTracking = $timeout($scope.onTimeout, $scope.currentTrack.timeInterval*1000);
			$scope.timerRunning = true;
	});
	$scope.$on('timer-stop', function (event, data){
			$scope.timerRunning = false;

	});

	$scope.$on('timer-tick-gps', function (event, args) {

			CommonFunctionFactory.onTimerTickUpdate($scope, event, args, false);

	});

	$scope.$on('timer-stopped', function (event, data){

			$scope.currentTrack.duration = data.hours+"h:"+data.minutes+"m:"+ data.seconds +"s";
	});

	//Funcio per calcular el tag de l'interval que es mostra al quadre info del track
	$scope.getTimeIntervalTag = function(){
			if($scope.currentTrack.timeInterval<60){
					$scope.timeIntervalTag = $scope.currentTrack.timeInterval + " sec.";
			}else{
					var minutes = parseInt( $scope.currentTrack.timeInterval / 60 ) % 60;
					var seconds = $scope.currentTrack.timeInterval % 60;
					$scope.timeIntervalTag = minutes + " min. i "+seconds+" sec.";
			}
	};


	/*Guardem els canvis al track, difereneciem mode = [imported, tracks]*/
	var saveTrack = function(idLayer) {

			$scope.modalTrackInfo.hide();

			var currentSourceData = $scope.tracksFilesList[idLayer].data; //$scope.mapVT.getSource(idLayer)._data;
			currentSourceData.features[0].properties.name = $scope.currentImported.name;
			currentSourceData.features[0].properties.description = $scope.currentImported.description;
			currentSourceData.name = $scope.currentImported.name;

			currentSourceData.style.color = $scope.currentImported.color;
			currentSourceData.style.fillColor = $scope.currentImported.color;

			$scope.mapVT.setPaintProperty(idLayer, 'line-color', $scope.currentImported.color);


			storageService.writeFile(storageService.storagePathBase+$scope.mapa.id+"/tracks/", idLayer +".geojson", currentSourceData).then(
					function(success){
							$log.info("Fitxer geojson imported escrit OK!");
							$scope.mapVT.getSource(idLayer).setData(currentSourceData);
							$scope.tracksFilesList[idLayer].name = $scope.currentImported.name;              
							$scope.tracksFilesList[idLayer].data = currentSourceData;
					},function(error){
							CommonFunctionFactory.recordError("Error escrivint geojson tracks " + JSON.stringify(error));
					});
	};



/******************************************************************/
/********************* TRACTEM IMPORTATS **************************/
/******************************************************************/

					
	$scope.updateColor = function(color){
		$scope.currentImported.color = color;
	};

	$scope.updateTrackColor = function(color){
	    $scope.currentTrack.color = color;
	};

	$scope.updateImportedIcon = function(iconName){
	    $scope.currentImported.iconName = iconName;
	    $scope.currentImported.color = iconNameToHexColor(iconName);
	};

	/* jshint ignore:start */
	$scope.initImportedFilesList = function(localImportedList){

			var defaultVis = false;
			if(angular.equals({}, localImportedList)){
					defaultVis = true;
			}

			fileFactory.getEntries(storageService.storagePathBase+$scope.mapa.id+"/imported/").then(

					function(entries){

							for (var i=0; i<entries.length; i++){

									if(entries[i].name.indexOf(".geojson")!=-1){
											storageService.readFile(storageService.storagePathBase+$scope.mapa.id+"/imported/", entries[i].name).then(
													function(text){

															if(!CommonFunctionFactory.isEmpty(text)){
																	//$log.info("Text imported: "+text);
																	var obj = JSON.parse(text);
																	var isVisible = (!localImportedList[obj.id] ? defaultVis : localImportedList[obj.id].visible);

																	$scope.importedFilesList[obj.id] = {
																			name: obj.name, //nom,
																			visible: isVisible,
																			data: obj
																	};

                                  addImportedToMap(obj.id);

																	if(!isVisible){																		   
                                    $scope.mapVT.setLayoutProperty(obj.id+"_point", 'visibility', "none");
                                    $scope.mapVT.setLayoutProperty(obj.id+"_line", 'visibility', "none");
                                    $scope.mapVT.setLayoutProperty(obj.id+"_polygon", 'visibility', "none");
																	} 

															}
														 
													},function(error){
															//Error
															$log.error("Error llegintfitxer");
													});
									}
							}
					},function(error){
							$log.error("error get entries");
					}

			);
	};
	/* jshint ignore:end */

	var addImportedToMap = function(importedId){

			$scope.mapVT.addSource(""+importedId+"", {
					"type": "geojson",
					"data": $scope.importedFilesList[importedId].data //obj
			});

			//afegim layer de points                                      
			$scope.mapVT.addLayer({ 
						"id": ""+importedId+"_point",
						"type": "circle",
						"source": ""+importedId+"",          
						"paint": {
								"circle-radius": 10,
								"circle-color": $scope.importedFilesList[importedId].data.style.color //iconNameToHexColor(obj.properties.iconName)
						},
						"filter": ["==", "$type", "Point"]
				});

				$scope.mapVT.on('click', ""+importedId+"_point", function (e) {

					$scope.showInfoImported(e.features[0], "Point");
				});                                    

			//afegim layer de lines
			$scope.mapVT.addLayer({
					"id": ""+importedId+"_line",
					"type": "line",
					"source": ""+importedId+"",
					"layout": {
							"line-join": "round",
							"line-cap": "round"
					},
					"paint": {
							"line-color": $scope.importedFilesList[importedId].data.style.color,
							"line-width": $scope.importedFilesList[importedId].data.style.weight,
							"line-opacity": $scope.importedFilesList[importedId].data.style.opacity
					},
					"filter": ["==", "$type", "LineString"]
			});

			$scope.mapVT.on('click', ""+importedId+"_line", function (e) {
				$scope.showInfoImported(e.features[0], "LineString");
			}); 

			//afegim layer de polygon
			$scope.mapVT.addLayer({
					"id": ""+importedId+"_polygon",
					"type": "fill",
					"source": ""+importedId+"",
					"paint": {
							"fill-color": $scope.importedFilesList[importedId].data.style.color,
							"fill-opacity": 0.4 //$scope.importedFilesList[importedId].data.style.opacity
					},
					"filter": ["==", "$type", "Polygon"]
			});

			$scope.mapVT.on('click', ""+importedId+"_polygon", function (e) {
				// $log.info(e.features);
        $scope.showInfoImported(e.features[0], "Polygon");
				// $scope.showInfoTrackFilesList(e.features[0]);
			});

	};

	$scope.showInfoImported = function(feature, geomType){

		$scope.currentImported = {};
		$scope.currentImported.idLayer = feature.layer.id;

		$scope.currentImported.description = feature.properties.description;
		$scope.currentImported.name = feature.properties.name;

		$scope.currentImported.index = feature.properties.index;
		$scope.currentImported.id = feature.properties.id;

		if(geomType === "Point"){
			$scope.currentImported.lat = feature.geometry.coordinates[1];
			$scope.currentImported.lng = feature.geometry.coordinates[0];			
      $scope.currentImported.color = feature.layer.paint['circle-color'];
      $scope.currentImported.iconName = hexColorToIconName($scope.currentImported.color);
			$scope.currentImported.geomType =  "Point";

		}else if(geomType === "LineString"){
			$scope.currentImported.geomType =  "LineString";
			$scope.currentImported.longitud =  (feature.properties.longitud ? feature.properties.longitud : "");
			$scope.currentImported.color =  feature.layer.paint['line-color'];


		}else if(geomType === "Polygon"){
			$scope.currentImported.geomType =  "Polygon";
			$scope.currentImported.color =  feature.layer.paint['fill-color'];

		}

		$scope.modalImportedInfo.show();

	};


	/*Guardem els canvis al track, difereneciem mode = [imported, tracks]*/
	$scope.saveImported = function(idLayer, mode) {

			if(mode.indexOf("tracks")!=-1){

				saveTrack(idLayer);

			}else{

				$scope.modalImportedInfo.hide();


				var currentSourceData = $scope.importedFilesList[$scope.currentImported.id].data; //$scope.mapVT.getSource($scope.currentImported.id)._data;
				currentSourceData.features[$scope.currentImported.index].properties.name = $scope.currentImported.name;
				currentSourceData.features[$scope.currentImported.index].properties.description = $scope.currentImported.description;

				currentSourceData.style.color = $scope.currentImported.color;
				currentSourceData.style.fillColor = $scope.currentImported.color;

        $scope.mapVT.setPaintProperty($scope.currentImported.id+"_point", 'circle-color', $scope.currentImported.color);
        $scope.mapVT.setPaintProperty($scope.currentImported.id+"_line", 'line-color', $scope.currentImported.color);
        $scope.mapVT.setPaintProperty($scope.currentImported.id+"_polygon", 'fill-color', $scope.currentImported.color);

			
				storageService.writeFile(storageService.storagePathBase+$scope.mapa.id+"/imported/", $scope.currentImported.id +".geojson", currentSourceData).then(
					function(success){

							$scope.mapVT.getSource($scope.currentImported.id).setData(currentSourceData);
							$scope.importedFilesList[$scope.currentImported.id].data = currentSourceData;              
					},function(error){
							CommonFunctionFactory.recordError("Error escrivint geojson imported del punt " + JSON.stringify(error));
				});

			}
	};

	$scope.cleanImported = function(){
			$scope.modalImportedInfo.hide();
			if($scope.currentImported.id){
					$scope.deleteImported($scope.currentImported.id);
			}
	};

	$scope.deleteImported = function(importedId){
			//Delete del seu fitxer
			storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/imported/", importedId+".geojson").then(
					function(){

						$scope.mapVT.removeLayer(importedId+"_point");
						$scope.mapVT.removeLayer(importedId+"_line");
						$scope.mapVT.removeLayer(importedId+"_polygon");
						$scope.mapVT.removeSource(importedId);

						//Delete del llistat de imported files
						delete  $scope.importedFilesList[importedId];

					},function(error){
							$scope.showAlert("Fitxer importat no eliminat", "No s'ha pogut eliminar el fitxer importat. Torni a intentar-ho.");
					}
			);
	};

	$scope.visibleImported = function(importedId){

			if($scope.importedFilesList[importedId].visible){

				$scope.importedFilesList[importedId].visible = false;

        $scope.mapVT.setLayoutProperty(importedId+"_point", 'visibility', "none");
        $scope.mapVT.setLayoutProperty(importedId+"_line", 'visibility', "none");
        $scope.mapVT.setLayoutProperty(importedId+"_polygon", 'visibility', "none");

			}else{
				$scope.importedFilesList[importedId].visible = true;

        $scope.mapVT.setLayoutProperty(importedId+"_point", 'visibility', "visible");
        $scope.mapVT.setLayoutProperty(importedId+"_line", 'visibility', "visible");
        $scope.mapVT.setLayoutProperty(importedId+"_polygon", 'visibility', "visible");

			}
	};

	$scope.isImportedVisible = function(importedId){

		return ($scope.importedFilesList[importedId] && $scope.importedFilesList[importedId].visible === true);
	};

	$scope.goToImported = function(importedId){

	    $scope.focusMap = false;
	    var bbox = turf.bbox($scope.importedFilesList[importedId].data);
	    $scope.mapVT.fitBounds(bbox);
	    $scope.modalFilesList.hide();
	};

	$scope.pickImportFile = function(){

		$scope.showToast('Navega i selecciona el fitxer (gpx, kml, geojson)', 'long', 'center');

		filePickerService.chooseImportFile().then(function(url) {

				var originalName = url.substr(url.lastIndexOf('/') + 1);
				var originalPath = url.substr(0, url.lastIndexOf('/') + 1);
				var ext = url.substr(url.lastIndexOf('.') + 1).toLowerCase();

				var responsePromise = $http.get(url);
				responsePromise.success(function(data, status, headers, config) {

						if( ext.indexOf("geojson") == -1){
								var x2js = new X2JS();
								var json = x2js.xml_str2json(data);
								var xml = x2js.json2xml(json);
								doImportFile(xml, ext, originalName);
						}else{
								doImportFile(data, ext, originalName);
						}

				});
				responsePromise.error(function(data, status, headers, config) {
						CommonFunctionFactory.recordError("get del fitxer a importar ha fallat! " + JSON.stringify(data));
				});

		}, function(error) {

				$scope.showToast('El tipus de fixer seleccionat no és correcte. Només s\'admeten fitxers GPX, KML o GEOJSON', 'long', 'center');

		});
	};  

	var doImportFile = function(data, ext, originalName){

			$cordovaGoogleAnalytics.trackEvent('mapvt', 'import file', $scope.mapa.id+'#'+ext, 100);

			var geojsonData = data;

			if(ext.indexOf("gpx")!=-1){
					geojsonData = toGeoJSON.gpx(data);
			}else if(ext.indexOf("kml")!=-1){
					geojsonData = toGeoJSON.kml(data);
			}


			var id = makeId();
			var path = storageService.storagePathBase+$scope.mapa.id+"/imported/";
			var filename = id + ".geojson";

			geojsonData.id = id;
			geojsonData.name = originalName;

			for(var i=0;i<geojsonData.features.length;i++){
					geojsonData.features[i].properties.index = i;
					geojsonData.features[i].properties.id = id;
					//Calcul de la longitud i posicions en cas que sigui un string
					if(geojsonData.features[i].geometry.type == 'LineString'){

							var coords = geojsonData.features[i].geometry.coordinates;
							var latlngs = [];
							for (var j in coords) {
									latlngs.push(L.GeoJSON.coordsToLatLng(coords[j]));
							}
							geojsonData.features[i].properties.longitud = (parseFloat(L.GeometryUtil.length(latlngs))/1000).toFixed(3);

							geojsonData.features[i].properties.num_positions = latlngs.length;

					}else if(geojsonData.features[i].geometry.type == 'Point'){
							geojsonData.features[i].properties.icon = iconFactory.orangeIcon;
							geojsonData.features[i].properties.iconName = 'orangeIcon';
							geojsonData.features[i].properties.images = "";
					}

			}

			geojsonData.style = {
					"fillColor": "#E46C0A",
					"weight": 4,
					"opacity": 0.75,
					"color": '#E46C0A',
					// dashArray: '3',
					"fillOpacity": 0.75
			};

			storageService.writeFile(path, filename, geojsonData).then(
					function(success){
							
							$scope.importedFilesList[id] = {
									name: originalName, //nom,
									visible: true,
									data: geojsonData
							};
							//Afegim
							addImportedToMap(id);

							$scope.showImportedFilesList = true;

					},function(error){
							CommonFunctionFactory.recordError("Error al crear nou fitxer importat! " + JSON.stringify(error));
					});

	};  




/******************************************************************/
/********************* DESCARREGAR DADES **************************/
/******************************************************************/

	$scope.downloadMyDataMap = function(){

			$cordovaGoogleAnalytics.trackEvent('mapvt', 'download data map', $scope.mapa.id+"#"+format, 100);

			var format = $scope.myFileDataMap.downloadFormat;
			var filename =  ( CommonFunctionFactory.isEmpty($scope.myFileDataMap.filename)? makeIdMapDate() : $scope.myFileDataMap.filename);

			var geojson = getCurrentDataMap(false);
			var newFile = "";
			if(format == "gpx"){
					newFile = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + togpx(geojson);
			}else{
					newFile = tokml(geojson);
			}

			//Si iOS: Fem compartir del fitxer al nuvol que tingui l'usuari disponible al dispositiu
			if (ionic.Platform.isIOS()){


					storageService.writeFile(storageService.storagePathBase+$scope.mapa.id, filename +"."+ format, newFile).then(
							function(success){

									var pathFile = storageService.storagePathBase+$scope.mapa.id+"/"+ filename +"."+ format;
									$cordovaSocialSharing.share(
																			filename +"."+ format, //message
																			"#CatalunyaOffline", //subject
																			pathFile, 
																			null) //link
											.then(function(result) {

												 storageService.removeFile(storageService.storagePathBase+$scope.mapa.id, filename +"."+ format);
											}, function(err) {
													CommonFunctionFactory.recordError("ERROR social sharing... " + JSON.stringify(err));
													$scope.showAlert("Dades no descarregades", "No s'ha pogut compartir el fitxer "+ filename +"."+ format+ " correctament.");
													storageService.removeFile(storageService.storagePathBase+$scope.mapa.id, filename +"."+ format);
											});

							},function(error){
									CommonFunctionFactory.recordError("Error escrivint nou download map " + JSON.stringify(error));
									$scope.showAlert("Dades no descarregades", "No s'ha pogut crear el fitxer "+ filename +"."+ format+ " correctament.");
							});

			}else{//Si es Android, es guarda el fixter al directori arrel del dispositiu
					storageService.writeFile(storageService.storageFiles, filename +"."+ format, newFile).then(
							function(success){
									$scope.showAlert("Dades descarregades", "Fitxer:<br> <b>"+ filename +"."+ format+ "</b><br> creat correctament al directori arrel del dispositiu.");
							},function(error){
									CommonFunctionFactory.recordError("Error escrivint nou download map" + JSON.stringify(error));
									$scope.showAlert("Dades no descarregades", "No s'ha pogut crear el fitxer "+ filename +"."+ format+ " correctament.");
							});
			}
	};

	/* jshint ignore:start */
	var getCurrentDataMap = function(publishPictures){

		//Geojson buit on anirem afegint totes les dades visibles actuals
		var geojson = {type: "FeatureCollection",features: []};

		//Afegim punts visibles
		angular.forEach($scope.poisFilesList, function(value, key){

				if(value.visible && publishPictures){

					var mydesc = $scope.poisFilesList[key].data.properties.description;
					var myimages = $scope.poisFilesList[key].data.properties.images;

					for(var i=0, imglength = myimages.length; i<imglength; i++){

						mydesc = mydesc + " http://betaserver.icgc.cat/catoffline/"+authService.uid+"/"+ myimages[i];
						uploadFactory.uploadFile($scope.mapa.id, authService.uid, myimages[i]).then(
								function(res){},function(error){ console.log("Couldn't upload image " + JSON.stringify(error));}
						);
					}

					geojson.features.push({
							type: "Feature",
							properties: {
									name: $scope.poisFilesList[key].data.properties.name,
									description: mydesc //$scope.markers[key].description
							},
							geometry: $scope.poisFilesList[key].data.geometry
					});

				}else if (value.visible) {

					geojson.features.push({
							type: "Feature",
							properties: {
									name: $scope.poisFilesList[key].data.properties.name,
									description: $scope.poisFilesList[key].data.properties.description
							},
							geometry: $scope.poisFilesList[key].data.geometry
					});
				}

		});

		//Afegim tracks visibles
		//Ull!: La llibreria que utilitza instamaps per llegir els geojson no 
		//soporta objectes dins del properties, és per això que treiem la propietat
		//icon
		angular.forEach($scope.tracksFilesList, function(value, key){

				if(value.visible){
						geojson.features.push({
							type: "Feature",
							properties: CommonFunctionFactory.objectWithoutKey($scope.tracksFilesList[key].data.features[0].properties, "icon"),
							geometry: $scope.tracksFilesList[key].data.features[0].geometry
					});
				}
		});

		//Afegim imported visibles
		//Ull!: La llibreria que utilitza instamaps per llegir els geojson no 
		//soporta objectes dins del properties, és per això que treiem la propietat
		//icon
		angular.forEach($scope.importedFilesList, function(value, key){

				if(value.visible){
						angular.forEach($scope.importedFilesList[key].data.features, function(feature, key){
								geojson.features.push({
									type: "Feature",
									properties: CommonFunctionFactory.objectWithoutKey(feature.properties, "icon"),
									geometry: feature.geometry
							});
						});
				}
		});

		$log.info(geojson);
		$log.info("geojson.length: " +geojson.length);
		return geojson;
	};
			/* jshint ignore:end */

/******************************************************/
/********************* UTILS **************************/
/******************************************************/

	/*
	duration: 'short', 'long'
	position: 'top', 'center', 'bottom'
	*/
	$scope.showToast = function(message, duration, position){
		$cordovaToast.show(message, duration, position)
			.then(function(success) {
				// success
			}, function (error) {
				CommonFunctionFactory.recordError("Error showing toast " + JSON.stringify(error));
			});
	};

	//PopUP alert error generic, passem titol i missatge a mostrar
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
			$timeout(function() {
					alertPopupError.close();
			}, 5000);
	};

	$scope.writeLog = function(codi, message){
			var data = CommonFunctionFactory.getCurrentDate() +" - "+codi+" - "+message+"\n";

			storageService.writeExistingFile(storageService.storagePathBase+$scope.mapa.id+"/logs", $scope.filenameLog, data);

	};

	var makeIdMapDate = function(){
			var date = new Date();
			var minutes = date.getMinutes();
			if(minutes < 10) minutes = "0"+minutes;
			return $scope.mapa.id + "_" +date.getFullYear().toString() + (date.getMonth()+1) + date.getDate() +"_"+ date.getHours()+"h"+minutes+"m";
	};

	var makeId = function() {


			var d = new Date();
			return d.getTime();
	};

	$scope.makeIdPicture = function(){
			//AAAAMMDD_HHMMSS_<CODI>
			var date = new Date();
			var h = addZero(date.getHours());
			var m = addZero(date.getMinutes());
			var s = addZero(date.getSeconds());
			var dateString = date.getFullYear().toString() + (date.getMonth()+1) + date.getDate() + "_" + h+""+m+""+s;


			return dateString;
	};

	var addZero = function(i) {
		if (i < 10) {
				i = "0" + i;
		}
		return i;
	};

	//PopUP alert error generic, passem titol i missatge a mostrar
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
			$timeout(function() {
					alertPopupError.close(); //close the popup after 3 seconds for some reason
			}, 5000);
	};

	var toparams = function(obj) {
			var p = [];
			for (var key in obj) {
					p.push(key + '=' + encodeURIComponent(obj[key]));
			}
			return p.join('&');
	};

	var iconNameToHexColor = function(iconName){

		switch (iconName) {
			case "beigeIcon":
				return "#FFCB92";

			case "orangeIcon":
				return "#E46C0A";

			case "redIcon":
				return "#C00000";

			case "purpleIcon":
				return "#D252B9";

			case "blueIcon":
				return "#38AADD";

			case "greenIcon":
				return "#72B026";

			case "darkgreenIcon":
				return "#728224";

			default: 
					return "#E46C0A";
		}

	};

  var hexColorToIconName = function(hex){

    switch (hex) {
      case "#FFCB92":
        return "beigeIcon";

      case "#E46C0A":
        return "orangeIcon";

      case "#C00000":
        return "redIcon";

      case "#D252B9":
        return "purpleIcon";

      case "#38AADD":
        return "blueIcon";

      case "#72B026":
        return "greenIcon";

      case "#728224":
        return "darkgreenIcon";

      default: 
          return "orangeIcon";
    }

  };  

	var creaMarcador = function(icon, inSize) {

		var size = inSize || [24, 24];

		var el = document.createElement('div');
		el.className = 'marker';
		el.style.backgroundImage = 'url(' + icon + ')';
		el.style.backgroundSize = 'cover';

		el.style.width = size[0] + 'px';
		el.style.height = size[1] + 'px';

		return new mapboxgl.Marker(el);
	};

}]);
