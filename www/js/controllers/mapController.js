angular.module('catoffline').controller('MapController',
['$scope',
'$log',
'$cordovaGeolocation',
'$stateParams',
'$ionicPopup',
'$ionicModal',
'$timeout',
'$localstorage',
'$sce',
'$cordovaInAppBrowser',
'$ionicPopover',
'$cordovaSocialSharing',
'$cordovaToast',
'$cordovaOauth',
'DBTallsTopoFactory',
'DBLlocsFactory',
'DBExtraDataFactory',
'leafletMapEvents',
'leafletGeoJsonEvents',
'leafletData',
'iconFactory',
'geojsonFactory',
'storageService',
'filePickerService',
'fileFactory',
'cameraFactory',
'uploadFactory',
'$ionicSlideBoxDelegate',
'$http',
'leafletBoundsHelpers',
'authService',
'authInterceptor',
'INSTAMAPS_ACTIONS',
'CATOFFLINE_TALLS',
'$cordovaGoogleAnalytics',
'$ionicPlatform',
'$ionicHistory',
'CommonFunctionFactory',
'$httpParamSerializerJQLike',
function(
$scope,
$log,
$cordovaGeolocation,
// $cordovaBackgroundGeolocation,
$stateParams,
$ionicPopup,
$ionicModal,
$timeout,
$localstorage,
$sce,
$cordovaInAppBrowser,
$ionicPopover,
$cordovaSocialSharing,
$cordovaToast,
$cordovaOauth,
DBTallsTopoFactory,
DBLlocsFactory,
DBExtraDataFactory,
leafletMapEvents,
leafletGeoJsonEvents,
leafletData,
iconFactory,
geojsonFactory,
storageService,
filePickerService,
fileFactory,
cameraFactory,
uploadFactory,
$ionicSlideBoxDelegate,
$http,
leafletBoundsHelpers,
authService,
authInterceptor,
INSTAMAPS_ACTIONS,
CATOFFLINE_TALLS,
$cordovaGoogleAnalytics,
$ionicPlatform,
$ionicHistory,
CommonFunctionFactory,
$httpParamSerializerJQLike
) {



//Inicialitzem controller

    $scope.settings = {
        bsize : 2,
        myshape : 'button-rodo',
        bsizeClass: 'button-size2',
        navicon : 'img/gps_blue.png',
        navicon_modal : 'img/gps_blue.png'
    };

    var backgroundGeolocation = null;

    //MODE DEBUG per escriure fitxer de logs
    $scope.debugMode = false;

    $scope.marcMode = true;

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

    // $log.info("backgroundGeolocation: "+ JSON.stringify(backgroundGeolocation));

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

    $scope.mapa = DBTallsTopoFactory.getMapByIdx($stateParams.idMap);
    $scope.initType = $stateParams.type;

    $cordovaGoogleAnalytics.trackEvent('map', 'veure mapa', $scope.mapa.id+'#'+$scope.initType, 100);

    var mapState = $localstorage.getObject(""+$scope.mapa.id+"");
    //Per centrar el mapa a la posicio previa, si existia
    var centerlat = $scope.mapa.lat_center;
    var centerlng = $scope.mapa.lon_center;
    if(mapState.prevCenter){
        centerlat = mapState.prevCenter.lat;
        centerlng = mapState.prevCenter.lng;
    }

    angular.extend($scope, {
        center: {

        },
        controls: {
            scale: {metric:true, imperial:false}
        },
        maxbounds: {
            northEast: {
                lat: $scope.mapa.lat_max,
                lng: $scope.mapa.lon_max
            },
            southWest: {
                lat: $scope.mapa.lat_min,
                lng: $scope.mapa.lon_min
            }
        },
        layers: {
            baselayers: {},
            overlays: {
                GeoSuau8_12: {
                    name: "GeoSuau8_12",
                    type: "custom",
                    visible: true,
                    layer: L.tileLayer.mbtiles("A250plus_gm_8a12.mbtiles", {

                      showOnSelector: false,
                      modeAssets: 1,
                      crs:L.CRS.EPSG3857,
                      tms:true,
                      imageFormat: 'png',
                      attribution: '<a target="_blank" href="http://www.icgc.cat">ICGC</a>-<a target="_blank" href="http://www.icgc.cat/L-ICGC/Informacio-publica/Transparencia2/Reutilitzacio-de-la-informacio/Condicions-d-us-de-la-geoinformacio-ICGC">CC-BY</a>',
                      minZoom: 8,
                      maxZoom: 12
                    }),
                    layerParams: {showOnSelector: false}
                },
                layer_talls:{
                    name:'77 talls',
                    type: 'geoJSONShape',
                    data: JSON.parse(CATOFFLINE_TALLS.talls), //$scope.geojson_talls,
                    visible: false,
                    // minZoom: 8,
                    // maxZoom: 11,
                    layerOptions: {
                        style: {
                            "fillColor": '#8E8E93',
                            "weight": 1,
                            "opacity": 0.3,
                            "color": '#444',
                            // dashArray: '3',
                            "fillOpacity": 0.3
                        },
                        onEachFeature: function (feature, layer) {

                            leafletData.getMap('mymap').then(function(map) {
                                var label = L.marker(layer.getBounds().getCenter(), {
                                    minZoom: 8,
                                    maxZoom: 11,
                                      icon: L.divIcon({
                                          className: 'label',
                                        //   html: '<b>'+feature.properties.OBJECTID+"</b>",
                                          html: '<span style="color: #555; font-size: 16px;"><b>'+feature.properties.OBJECTID+"</b></span>",
                                          iconSize: new L.Point(20, 20)
                                      })
                                    }).addTo(map);
                            });
                        }
                    }
                },

                layer_rectangle: {
                    name: 'layer_ractangle',
                    visible: false,
                    type: 'group'//,
                }
            }
        },
        markers : {},
        paths : {
            rectangle: {
                color: "#E46C0A",
                weight: 3,
                type: "rectangle",
                latlngs: [{
                        lat: $scope.mapa.lat_max,
                        lng: $scope.mapa.lon_max
                    },{
                        lat: $scope.mapa.lat_min,
                        lng: $scope.mapa.lon_min
                }],
                layer: 'layer_rectangle'
            }
        },
        geojson: {},
        events: {
            map: {
                enable: ['context', 'contextmenu', 'zoomend', 'baselayerchange', 'moveend', 'dragend'],
                logic: 'emit'
            },
            geojson:{
                enable: ['click'],
                logic: 'emit'
            }
        }
    });


    var loadNatural = function(){
        var path = storageService.storagePathBase + $scope.mapa.id +"_nat.mbtiles";
        $scope.layers.baselayers.mbtiles_nat = {
            name: $scope.mapa.nom + "-nat",
            type: "custom",
            visible: false,
            layer: L.tileLayer.mbtiles(path.substring(7), {
                showOnSelector: true,
                modeAssets: 2,//BD que es llegeix de descarregues (path al name de bd)
                crs:L.CRS.EPSG3857,
                tms:true,
                imageFormat: 'png',
                minZoom: 13,
                maxZoom: 16
            })
        };
    };


    $scope.initDirectories = function(){

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


    $scope.initMap_marc = function(){

        var path = "";
        var path_orto = "";

        if(ionic.Platform.isIOS()){
            path = $scope.mapa.id +".mbtiles";
            path_orto = $scope.mapa.id +"_orto.mbtiles";
        }else{
            var prev_path = storageService.storageMBTiles+ $scope.mapa.id +".mbtiles";
            path = prev_path.substring(7);

            var prev_path_orto = storageService.storageMBTiles+ $scope.mapa.id +"_orto.mbtiles";
            path_orto = prev_path_orto.substring(7);
        }

        if($scope.mapa.download == 'true'){
            $scope.mbtiles_topo = {
                name: $scope.mapa.nom+ "-map",
                type: "custom",
                visible: true,
                layer: L.tileLayer.mbtiles(path, {
                    showOnSelector: true,
                    modeAssets: 2,//BD que es llegeix de descarregues (path al name de bd)
                    crs:L.CRS.EPSG3857,
                    tms:true,
                    imageFormat: 'jpg',
                    minZoom: 10,
                    maxZoom: 16
                })
            };

            $scope.layers.baselayers.mbtiles_topo = $scope.mbtiles_topo;
        }

    };

    $scope.initMap = function(){

        var path = "";
        var path_orto = "";

        if(ionic.Platform.isIOS()){
            path = $scope.mapa.id +".mbtiles";
            path_orto = $scope.mapa.id +"_orto.mbtiles";
        }else{
            var prev_path = storageService.storageMBTiles+ $scope.mapa.id +".mbtiles";
            path = prev_path.substring(7);

            var prev_path_orto = storageService.storageMBTiles+ $scope.mapa.id +"_orto.mbtiles";
            path_orto = prev_path_orto.substring(7);
        }


        //Si el topo esta descarregat carreguem la capa com a base
        if($scope.mapa.download == 'true'){
            $scope.mbtiles_topo = {
                name: $scope.mapa.nom+ "-map",
                type: "custom",
                visible: ($scope.initType == 'topo'),
                layer: L.tileLayer.mbtiles(path, {
                    showOnSelector: true,
                    modeAssets: 2,//BD que es llegeix de descarregues (path al name de bd)
                    crs:L.CRS.EPSG3857,
                    tms:true,
                    imageFormat: 'png',
                    minZoom: 13,
                    maxZoom: 17,
                    maxNativeZoom: 16
                })
            };
        }

        //Si la orto esta descarregada la carreguem com a base
        if($scope.mapa.download_orto == 'true'){
            path = storageService.storagePathBase + $scope.mapa.id +"_orto.mbtiles";
            $scope.mbtiles_orto = {
                name: $scope.mapa.nom + "-img",
                type: "custom",
                visible: ($scope.initType == 'orto'),
                layer: L.tileLayer.mbtiles(path_orto, {
                    showOnSelector: true,
                    modeAssets: 2,//BD que es llegeix de descarregues (path al name de bd)
                    crs:L.CRS.EPSG3857,
                    //tms:true,
                    imageFormat: 'png',
                    minZoom: 13,
                    maxZoom: 18,
                    maxNativeZoom: 16
                })
            };
        }

        if($scope.initType == 'topo'){
            $scope.layers.baselayers.mbtiles_topo = $scope.mbtiles_topo;
         }else{
            $scope.layers.baselayers.mbtiles_orto = $scope.mbtiles_orto;
        }

        $scope.allBaselayers = ( $scope.mapa.download == 'true' &&  $scope.mapa.download_orto == 'true' );
    };

    $scope.initMapAdded = function(){

        $log.info("initMapAdded: "+$scope.mapa.descripcio);

        if(angular.isString($scope.mapa.descripcio)){
            $log.info("Parse de json de la descripcio");
            $scope.mapa.descripcio = JSON.parse($scope.mapa.descripcio);
        }else{
            $log.info("No cal parse!");
        }

        $scope.mbtiles_added = {
            name: $scope.mapa.nom,
            type: "custom",
            visible: true,
            layer: L.tileLayer.mbtiles($scope.mapa.descripcio.path, {
                mytype: 'added',
                showOnSelector: true,
                modeAssets: 3,//BD que es llegeix de descarregues (path al name de bd) i en read only nomes
                crs:L.CRS.EPSG3857,
                tms:true,
                imageFormat: $scope.mapa.descripcio.format,
                minZoom: $scope.mapa.descripcio.min_zoom,
                maxZoom: $scope.mapa.descripcio.max_zoom
            })
        };

        $scope.layers.baselayers.mbtiles_added = $scope.mbtiles_added;
        $scope.layers.overlays = {};
        $scope.paths = {};

        leafletData.getMap('mymap').then(function(map) {
            map.fitBounds([
                [$scope.mapa.lat_min, $scope.mapa.lon_min],
                [$scope.mapa.lat_max, $scope.mapa.lon_max]
            ]);
        });

    };

    //Control zoom, per mostrar rectangle area del mapa a partir de zoom level 12
    $scope.$on('leafletDirectiveMap.mymap.zoomend', function(event){

        if($scope.initType != 'added'){

            leafletData.getMap('mymap').then(function(map) {
                var currentZoom = map.getZoom();
                if(currentZoom >= 11){
                    $scope.layers.overlays.layer_rectangle.visible = false;
                    $scope.layers.overlays.layer_talls.visible = false;
                }else{
                    $scope.layers.overlays.layer_rectangle.visible = true;
                    $scope.layers.overlays.layer_talls.visible = true;
                }
            });

        }

    });

    $scope.initTemplates = function(){
        $ionicModal.fromTemplateUrl('modals/addPosition.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modalPosition = modal;
        });

        $ionicModal.fromTemplateUrl('modals/openFilesList.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modalFilesList = modal;
        });

        $ionicModal.fromTemplateUrl('modals/importedInfo.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modalImportedInfo = modal;
        });

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

        $ionicModal.fromTemplateUrl('modals/image-popover.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modalImagePopover = modal;
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

            if($scope.markers.now) $scope.markers.now.icon.iconUrl = $scope.settings.navicon;
            if($scope.markers.tracking) $scope.markers.tracking.icon.iconUrl = $scope.settings.navicon;

            $localstorage.setObject("settings", $scope.settings);

            $cordovaGoogleAnalytics.trackEvent('map', 'settings_size', $scope.settings.bsize, 100);
            $cordovaGoogleAnalytics.trackEvent('map', 'settings_shape', $scope.settings.myshape, 100);
            $cordovaGoogleAnalytics.trackEvent('map', 'settings_navicon', $scope.settings.navicon, 100);
    };

    /******************************************************************/
    /*************************** CERCA LLOCS    ***********************/
    /******************************************************************/

    $scope.openCercaLloc = function(){
        $scope.cercaLloc = "";
        $scope.enabledCercaLloc = !$scope.enabledCercaLloc;
    };

    $scope.initCercaLloc = function(){

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

        $cordovaGoogleAnalytics.trackEvent('map', 'currentposition point', $scope.mapa.id, 100);

        $scope.modalResCercaLlocs.hide();

        var id = makeId();
        var name = toponim;
        var coordsETRS89 = proj4('+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs', [ longitud, latitud]);//$scope.coordsToETRS89(lat, lng);$scope.coordsToETRS89(position.coords.latitude, position.coords.longitude);
        $scope.markers[id] = {
            id: id,
            lat: latitud,
            lng: longitud,
            x: coordsETRS89[0],
            y: coordsETRS89[1],
            icon: iconFactory.orangeIcon,
            iconName: 'orangeIcon',
            name: name,
            description: "",
            images: [],
            focus: false,
            draggable: false
        };

        //Afegim el nou poi al llistat de files pois
        $scope.poisFilesList[id] = {
            name: name, //"Punt", //nom,
            visible: true
        };

        //Creem fitxer geojson associat
        geojsonFactory.createGeojsonPoint($scope.markers[id], $scope.mapa.id).then(function(){

        }, function(){
            CommonFunctionFactory.recordError("Create geojson file of point KO...");
        });

        $scope.focusMap = false;
        $scope.center.lat  = latitud;
        $scope.center.lng = longitud;

        if(!$scope.isInsideCurrentMap(latitud,longitud)){
            $scope.center.zoom = 8;
        }

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
                 $scope.center.lat  = location.latitude;
                 $scope.center.lng = location.longitude;
             }

             $scope.markers.tracking.lat  = (!CommonFunctionFactory.isEmpty(location.latitude) ? location.latitude: $scope.markers.tracking.lat); //location.latitude;
             $scope.markers.tracking.lng = (!CommonFunctionFactory.isEmpty(location.longitude) ? location.longitude: $scope.markers.tracking.lng); //location.longitude;
             $scope.markers.tracking.iconAngle = (!CommonFunctionFactory.isEmpty(location.bearing) ? location.bearing: 0);

             $scope.currentTrack.current_lat = (!CommonFunctionFactory.isEmpty(location.latitude) ? location.latitude: $scope.markers.tracking.lat);
             $scope.currentTrack.current_lng = (!CommonFunctionFactory.isEmpty(location.longitude) ? location.longitude: $scope.markers.tracking.lng);//location.longitude;
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
            delete  $scope.markers.now;
            $scope.currentWatchPosition.clearWatch();
            $scope.GPSactiu = false;
        }

        //Inicialitzem GPS
        var posOptions = {timeout: 30000, enableHighAccuracy: true};
        $scope.GPSgettingPos = true;
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            $scope.GPSgettingPos = false;
            if($scope.isInsideCurrentMap(position.coords.latitude,position.coords.longitude)){

                //Inicialitzaem variables current
                $scope.currentPosition = position.coords;
                $scope.lastPosition = position.coords;

                $scope.modeTracking = 1;

                $scope.center.lat  = position.coords.latitude;
                $scope.center.lng = position.coords.longitude;

                $scope.currentTrack.id = makeId();
                $scope.currentTrack.numPosicions = 1;
                $scope.average = 0.0;
                var alt = (position.coords.altitude!==null ? position.coords.altitude: 0);

                $scope.currentTrack.current_lat = position.coords.latitude;
                $scope.currentTrack.current_lng = position.coords.longitude;
                $scope.currentTrack.current_alt = alt; //(position.coords.altitude!==null ? position.coords.altitude: 0)
                $scope.currentTrack.t_ini = CommonFunctionFactory.getCurrentDate();

                $scope.paths[$scope.currentTrack.id]={
                    color: '#0624f4',//Fiquem $scope.currentTrack.color,
                    weight: 4,
                    message: "<p>Track: "+$scope.currentTrack.name+"</p>",
                    latlngs: [{
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    }]
                };

                CommonFunctionFactory.afegeixPunt($scope, position.coords, 0, false, true);

                $scope.markers.tracking = {
                    id: 'tracking',
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    iconAngle: (position.coords.heading!==null ? position.coords.heading: 0),
                    focus: true,
                    zIndexOffset: 10000,
                    // icon: iconFactory.navorangeIcon,
                    icon: {
                          iconUrl: $scope.settings.navicon,
                          // shadowUrl: 'img/leaf-shadow.png',
                          iconSize:     [22, 27],
                          // shadowSize:   [50, 64],
                          iconAnchor:   [11, 27],
                          // shadowAnchor: [4, 62],
                          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                     },
                    draggable: false
                };

                if($scope.isAndroid){

                    backgroundGeolocation.configure(callbackFnTrack, failureFnTrack, {
                        desiredAccuracy: 10,
                        stationaryRadius: 15,
                        distanceFilter: 5,
                        debug: false,
                        interval: 5000
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

                // backgroundGeolocation.switchMode(backgroundGeolocation.mode.BACKGROUND);
                backgroundGeolocation.start();

                $scope.startTimer();

                /*GOOGLE ANALYTICS*/
                $cordovaGoogleAnalytics.trackEvent('map', 'start tracking', $scope.mapa.id, 100);

            }else{
                $scope.showAlert("Impossible geolocalitzar","Posició fora dels límits del mapa actual");
                $scope.modeTracking = 0;
            }
        }, function(err) {
            $scope.GPSgettingPos = false;
            // error
            CommonFunctionFactory.recordError("Location error: " + JSON.stringify(err));
            $scope.showAlert("Impossible geolocalitzar","Senyal insuficient");
        });

    };

    $scope.restartTracking = function(){

        $scope.modalCreateTrackInfo.hide();
        $scope.modeTracking = 1;
        $scope.resumeTimer();
        CommonFunctionFactory.onRestartTracking($scope);
    };

    $scope.stopTracking_backup = function(){

        $scope.modalCreateTrackInfo.hide();
        $scope.modeTracking = 0;
        delete  $scope.markers.tracking;
        CommonFunctionFactory.onStartTracking($scope);

        $scope.currentTrackingPosition.clearWatch();
        if(CommonFunctionFactory.isEmpty($scope.currentTrack.name)){
            $scope.currentTrack.name = CommonFunctionFactory.getCurrentDate();//$scope.currentTrack.id;
        }

        $scope.stopTimer();

        $scope.currentTrack.t_fi = CommonFunctionFactory.getCurrentDate();

        $cordovaGoogleAnalytics.trackEvent('map', 'stop tracking', $scope.mapa.id, 100);

        $scope.locate();

        //Creem fitxer geojson associat, si ja existia el substitueix
        geojsonFactory.createGeojsonTrack($scope.currentTrack, $scope.mapa.id).then(
            function(geojsonFile){

                geojsonFileObj = JSON.parse(geojsonFile);

                $scope.tracksFilesList[$scope.currentTrack.id] = {
                    name: $scope.currentTrack.name,//name,
                    visible: true
                };

                $scope.geojson[$scope.currentTrack.id] = {
                    data: geojsonFileObj,
                    style: geojsonFileObj.style
                };
            }, function(err){
                CommonFunctionFactory.recordError("Create geojson file of track KO..." + JSON.stringify(err));
        });
        delete  $scope.paths[$scope.currentTrack.id];
    };

    $scope.stopTracking = function(){

        $scope.modalCreateTrackInfo.hide();
        $scope.modeTracking = 0;
        delete  $scope.markers.tracking;
        CommonFunctionFactory.onStopTracking($scope);

        backgroundGeolocation.stop();
        backgroundGeolocation.finish();

        if($scope.debugMode) $scope.writeLog("stopTracking", "");

        if(CommonFunctionFactory.isEmpty($scope.currentTrack.name)){
            $scope.currentTrack.name = CommonFunctionFactory.getCurrentDate();//$scope.currentTrack.id;
        }

        $scope.stopTimer();

        $scope.currentTrack.t_fi = CommonFunctionFactory.getCurrentDate();

        $cordovaGoogleAnalytics.trackEvent('map', 'stop tracking', $scope.mapa.id, 100);

        $scope.locate();

        //Creem fitxer geojson associat, si ja existia el substitueix
        geojsonFactory.createGeojsonTrack($scope.currentTrack, $scope.mapa.id).then(
            function(geojsonFile){

                geojsonFileObj = JSON.parse(geojsonFile);

                $scope.tracksFilesList[$scope.currentTrack.id] = {
                    name: $scope.currentTrack.name,//name,
                    visible: true
                };
                //Afegim
                $scope.geojson[$scope.currentTrack.id] = {
                    data: geojsonFileObj,
                    style: geojsonFileObj.style
                };
            }, function(err){
                CommonFunctionFactory.recordError("Create geojson file of track KO..." + JSON.stringify(err));
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
                                        visible: isVisible
                                    };
                                    if(isVisible){
                                        $scope.geojson[obj.id] = {
                                            data: obj,
                                            style: obj.style
                                        };
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

    $scope.updateTrackColor = function(color){
        $scope.currentTrack.color = color;
    };

    $scope.cleanTrack = function(){
        $scope.modalTrackInfo.hide();
        if($scope.currentImported.id){
            $scope.deleteTrack($scope.currentImported.id);
        }
    };

    $scope.deleteTrack = function(trackId){
        //Delete del seu fitxer
        storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/tracks/", trackId+".geojson").then(
            function(){
                //Delete del marker
                delete  $scope.geojson[trackId];
                //Delete del llistat de pois
                delete  $scope.tracksFilesList[trackId];
            },function(error){
                $scope.showAlert("Track no eliminat", "No s'ha pogut eliminar la traça. Torni a intentar-ho.");
            }
        );
    };

    $scope.visibleTrack= function(trackId){

        if($scope.tracksFilesList[trackId].visible){

            delete $scope.geojson[trackId];
            $scope.tracksFilesList[trackId].visible = false;
        }else{

            storageService.readFile(storageService.storagePathBase+$scope.mapa.id+"/tracks/", trackId+".geojson").then(

                function(text){

                    var obj = JSON.parse(text);

                    $scope.geojson[trackId] = {
                        data: obj,
                        style: obj.style

                    };
                    $scope.tracksFilesList[trackId].visible = true;

                },function(error){
                    //Error
                    CommonFunctionFactory.recordError("Error llegint fitxer: "+JSON.stringify(error));
                    $scope.showAlert("Track file no afegit", "No s'ha pogut afegir la traça al mapa. Torni a intentar-ho.");
                });
        }
    };

    $scope.isTrackVisible = function(trackId){

        return ($scope.tracksFilesList[trackId] && $scope.tracksFilesList[trackId].visible === true);
    };

    $scope.goToTrack = function(trackId){

        leafletData.getMap().then(function(map) {
                var latlngs = [];
                for (var i in $scope.geojson[trackId].data.features[0].geometry.coordinates) {
                    var coord = $scope.geojson[trackId].data.features[0].geometry.coordinates[i];

                    latlngs.push(L.GeoJSON.coordsToLatLng(coord));
                }
                $scope.focusMap = false;
                map.fitBounds(latlngs);
        });

        $scope.modalFilesList.hide();
    };

    $scope.showInfoTrackFilesList = function(trackId){
        $scope.currentImported.idLayer = trackId;
        $scope.currentImported.description = $scope.geojson[trackId].data.features[0].properties.description;
        $scope.currentImported.name = $scope.geojson[trackId].data.features[0].properties.name;
        $scope.currentImported.color = $scope.geojson[trackId].data.style.color;
        $scope.currentImported.geomType =  $scope.geojson[trackId].data.features[0].geometry.type;
        $scope.currentImported.index = $scope.geojson[trackId].data.features[0].properties.index;
        $scope.currentImported.longitud = $scope.geojson[trackId].data.features[0].properties.longitud;
        $scope.currentImported.id = $scope.geojson[trackId].data.features[0].properties.id;
        $scope.currentImported.num_positions = $scope.geojson[trackId].data.features[0].properties.num_positions;

        $scope.currentImported.t_ini = $scope.geojson[trackId].data.features[0].properties.t_ini;
        $scope.currentImported.t_fi = $scope.geojson[trackId].data.features[0].properties.t_fi;
        $scope.currentImported.duration = $scope.geojson[trackId].data.features[0].properties.duration;
        $scope.currentImported.alt_max = $scope.geojson[trackId].data.features[0].properties.alt_max;
        $scope.currentImported.alt_min = $scope.geojson[trackId].data.features[0].properties.alt_min;

        $scope.modalTrackInfo.show();
    };

    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');

    };
    $scope.resumeTimer = function (){
        $scope.$broadcast('timer-resume');

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

        CommonFunctionFactory.onTimerTickUpdate($scope, event, args, true);

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

/******************************************************************/
/********************* TRACTEM IMPORTATS **************************/
/******************************************************************/

    $scope.$on("leafletDirectiveGeoJson.mymap.click", function(event, args) {

        $scope.currentImported = {};
        $scope.currentImported.idLayer = args.layerName;

        if(!CommonFunctionFactory.isEmpty(args.leafletObject.feature.properties.description)){
            $scope.currentImported.description = args.leafletObject.feature.properties.description;
        }

        $scope.currentImported.name = args.leafletObject.feature.properties.name;
        $scope.currentImported.geomType =  args.leafletObject.feature.geometry.type;
        $scope.currentImported.index = args.leafletObject.feature.properties.index;
        $scope.currentImported.id = args.leafletObject.feature.properties.id;

        if($scope.currentImported.geomType == "Point"){

            $scope.currentImported.lat = args.leafletObject.feature.geometry.coordinates[1];
            $scope.currentImported.lng = args.leafletObject.feature.geometry.coordinates[0];
            $scope.currentImported.iconName  = args.leafletObject.feature.properties.iconName;
        }else{
            $scope.currentImported.color = args.leafletObject.options.color;
            $scope.currentImported.longitud = args.leafletObject.feature.properties.longitud;
        }


        if(args.leafletObject.feature.properties.num_positions){


            $scope.currentImported.num_positions = args.leafletObject.feature.properties.num_positions;
            $scope.currentImported.t_ini = args.leafletObject.feature.properties.t_ini;
            $scope.currentImported.t_fi = args.leafletObject.feature.properties.t_fi;
            $scope.currentImported.duration = args.leafletObject.feature.properties.duration;
            $scope.currentImported.alt_max = args.leafletObject.feature.properties.alt_max;
            $scope.currentImported.alt_min = args.leafletObject.feature.properties.alt_min;

            $scope.modalTrackInfo.show();
        }else{//Si no, track importat
            $scope.modalImportedInfo.show();
        }
    });


    $scope.showInfoImportedFilesList = function(trackId, index){
        $scope.currentImported.idLayer = trackId;
        $scope.currentImported.description = $scope.geojson[trackId].data.features[index].properties.description;
        $scope.currentImported.name = $scope.geojson[trackId].data.features[index].properties.name;
        $scope.currentImported.color = $scope.geojson[trackId].data.style.color;

        $scope.currentImported.geomType =  $scope.geojson[trackId].data.features[index].geometry.type;
        $scope.currentImported.index = $scope.geojson[trackId].data.features[index].properties.index;
        $scope.currentImported.longitud = $scope.geojson[trackId].data.features[index].properties.longitud;
        $scope.currentImported.id = $scope.geojson[trackId].data.features[index].properties.id;
        $scope.modalImportedInfo.show();
    };

    /*Guardem els canvis al track, difereneciem mode = [imported, tracks]*/
    $scope.saveImported = function(idLayer, mode) {

        $scope.modalImportedInfo.hide();
        $scope.modalTrackInfo.hide();

        $scope.geojson[idLayer].data.features[$scope.currentImported.index].properties.name =   $scope.currentImported.name;
        $scope.geojson[idLayer].data.features[$scope.currentImported.index].properties.description = $scope.currentImported.description;

        if($scope.currentImported.geomType == "Point"){
            $scope.geojson[idLayer].data.features[$scope.currentImported.index].properties.iconName = $scope.currentImported.iconName;
            $scope.geojson[idLayer].data.features[$scope.currentImported.index].properties.icon = iconFactory[$scope.currentImported.iconName];
        }else{
            $scope.geojson[idLayer].style.color = $scope.currentImported.color;
            $scope.geojson[idLayer].style.fillColor = $scope.currentImported.color;
            $scope.geojson[idLayer].data.style.color = $scope.currentImported.color;
            $scope.geojson[idLayer].data.style.fillColor = $scope.currentImported.color;
        }


        storageService.writeFile(storageService.storagePathBase+$scope.mapa.id+"/"+mode+"/", idLayer +".geojson", $scope.geojson[idLayer].data).then(
            function(success){

                if(mode.indexOf("tracks")!=-1){
                    $scope.tracksFilesList[$scope.currentImported.id].name = $scope.currentImported.name;
                }else{

                }
            },function(error){
                CommonFunctionFactory.recordError("Error escrivint geojson imported del punt " + JSON.stringify(error));
            });
    };

    $scope.cleanImported = function(){
        $scope.modalImportedInfo.hide();
        if($scope.currentImported.id){
            $scope.deleteImported($scope.currentImported.id);
        }
    };

    $scope.deleteImported = function(importedId){

        storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/imported/", importedId+".geojson").then(
            function(){

                delete  $scope.geojson[importedId];

                delete  $scope.importedFilesList[importedId];
            },function(error){
                $scope.showAlert("Imported no eliminat", "No s'ha pogut eliminar la traça importada. Torni a intentar-ho.");
            }
        );
    };

    $scope.deleteImportedFeature = function(fId, importedId){

    };

    $scope.updateColor = function(color){
        $scope.currentImported.color = color;

    };

    $scope.openFolder = function(){

        $cordovaGoogleAnalytics.trackEvent('map', 'open folder', $scope.mapa.id, 100);
        $scope.map = {
            mapNameInstamaps : '',
            uploadPictures: true
        };
        $scope.modalFilesList.show();
    };

    $scope.visibleImported = function(importedId){

        if($scope.importedFilesList[importedId].visible){

            delete $scope.geojson[importedId];
            $scope.importedFilesList[importedId].visible = false;
        }else{

            storageService.readFile(storageService.storagePathBase+$scope.mapa.id+"/imported/", importedId+".geojson").then(

                function(text){

                    var obj = JSON.parse(text);

                    $scope.geojson[importedId] = {
                        data: obj,
                        style: obj.style,
                        pointToLayer : function(feature, latlng) {

                            var pointMarker = L.AwesomeMarkers.icon(
                                iconFactory[feature.properties.iconName]
                            );
                            return new L.marker(latlng, {icon:pointMarker});
                        }
                    };
                    $scope.importedFilesList[importedId].visible = true;

                },function(error){
                    //Error
                    CommonFunctionFactory.recordError("Error llegint fitxer: "+JSON.stringify(error));
                    $scope.showAlert("Imported file no afegit", "No s'ha pogut afegir el fitxer al mapa. Torni a intentar-ho.");
                });
        }
    };

    $scope.isImportedVisible = function(importedId){

        return ($scope.importedFilesList[importedId] && $scope.importedFilesList[importedId].visible === true);
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

                                    var obj = JSON.parse(text);
                                    var isVisible = (!localImportedList[obj.id] ? defaultVis : localImportedList[obj.id].visible);

                                    $scope.importedFilesList[obj.id] = {
                                        name: obj.name, //nom,
                                        visible: isVisible
                                    };

                                    if(isVisible){
                                        $scope.geojson[obj.id] = {
                                            data: obj,
                                            style: obj.style,
                                            pointToLayer : function(feature, latlng) {

                                                var pointMarker = L.AwesomeMarkers.icon(
                                                    iconFactory[feature.properties.iconName]
                                                );
                                                return new L.marker(latlng, {icon:pointMarker});
                                            }
                                        };
                                    }
                                }else{
                                }


                            },function(error){
                                //Error
                                CommonFunctionFactory.recordError("Error llegintfitxer " + JSON.stringify(error));
                            });
                    }
                }

            },function(error){
                CommonFunctionFactory.recordError("error get entries " + JSON.stringify(error));
            }

        );
    };
    /* jshint ignore:end */

    $scope.pickImportFile = function(){

        $scope.showToast('Navega i selecciona el fitxer (gpx, kml, geojson)', 'long', 'center');

        filePickerService.chooseImportFile().then(function(url) {

            //Trobem extensio del fitxer seleccionat
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

        $cordovaGoogleAnalytics.trackEvent('map', 'import file', $scope.mapa.id+'#'+ext, 100);

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

            if(geojsonData.features[i].geometry.type == 'LineString'){

                var coords = geojsonData.features[i].geometry.coordinates;
                var latlngs = [];
                for (var j in coords) {
                    latlngs.push(L.GeoJSON.coordsToLatLng(coords[j]));
                }
                geojsonData.features[i].properties.longitud = (parseFloat(L.GeometryUtil.length(latlngs))/1000).toFixed(3);


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

            "fillOpacity": 0.75
        };

        storageService.writeFile(path, filename, geojsonData).then(
            function(success){

                $scope.importedFilesList[id] = {
                    name: originalName, //nom,
                    visible: true
                };
                //Afegim
                $scope.geojson[id] = {
                    data: geojsonData,
                    style: geojsonData.style,

                    pointToLayer : function(feature, latlng) {
                            var orangeMarker = L.AwesomeMarkers.icon(
                                iconFactory.orangeIcon
                            );
                            return new L.marker(latlng, {icon:orangeMarker});
                    }
                };

                $scope.showImportedFilesList = true;

            },function(error){
                CommonFunctionFactory.recordError("Error al crear nou fitxer importat! " + JSON.stringify(error));
            });

    };

    $scope.goToImported = function(importedId){

        if($scope.geojson[importedId].data.features[0].geometry.type == "Point"){
            $scope.center.lat  = $scope.geojson[importedId].data.features[0].geometry.coordinates[1];
            $scope.center.lng = $scope.geojson[importedId].data.features[0].geometry.coordinates[0];
            $scope.center.zoom = 15;
            $scope.modalFilesList.hide();
        }else{
            $scope.goToTrack(importedId);
        }
    };

    $scope.updateImportedIcon = function(iconName){
        $scope.currentImported.iconName = iconName;
    };

/**************************************************************/
/********************* TRACTEM PUNTS **************************/
/**************************************************************/

//http://stackoverflow.com/questions/23970700/angular-leaflet-directive-custom-message-html-with-angular-directives-in-marker

    $scope.$on('leafletDirectiveMarker.mymap.click', function(event, args){

        if (args.leafletObject.options.id != 'gps'){

            var currentId = args.leafletObject.options.id;
            openModalPosition(
                args.leafletObject.options.id,
                args.leafletObject.options.lat,
                args.leafletObject.options.lng,
                $scope.markers[currentId].name,
                $scope.markers[currentId].description,
                $scope.markers[currentId].iconName,
                iconFactory[$scope.markers[currentId].iconName],
                $scope.markers[currentId].images);
        }
    });

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


    $scope.$on('leafletDirectiveMap.mymap.contextmenu', function(event, locationEvent){
        $scope.currentMarker = new Marker(locationEvent.leafletEvent.latlng.lat, locationEvent.leafletEvent.latlng.lng);
        $scope.modalPosition.show();
        $cordovaGoogleAnalytics.trackEvent('map', 'longclick point', $scope.mapa.id, 100);

    });

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

    $scope.currentMarker = new Marker(0,0);


    $scope.saveLocation = function() {

        $scope.modalPosition.hide();

        if(CommonFunctionFactory.isEmpty($scope.currentMarker.name)){
            $scope.currentMarker.name = CommonFunctionFactory.getCurrentDate();
        }

        if(!$scope.currentMarker.id){

            $scope.currentMarker.id = makeId();

            $scope.markers[$scope.currentMarker.id] = {
                id: $scope.currentMarker.id,
                lat:$scope.currentMarker.lat,
                lng:$scope.currentMarker.lng,
                x:$scope.currentMarker.x,
                y:$scope.currentMarker.y,
                name: $scope.currentMarker.name,
                description: $scope.currentMarker.description,
                icon: iconFactory[$scope.currentMarker.iconName],
                iconName: $scope.currentMarker.iconName,
                images: $scope.currentMarker.images,
                focus: false,
                draggable: false
            };

            $scope.poisFilesList[$scope.currentMarker.id] = {
                name: $scope.currentMarker.name, //nom,
                visible: true
            };

        }else{
            $scope.markers[$scope.currentMarker.id].name = $scope.currentMarker.name;
            $scope.markers[$scope.currentMarker.id].description = $scope.currentMarker.description;
            $scope.markers[$scope.currentMarker.id].icon = iconFactory[$scope.currentMarker.iconName];
            $scope.markers[$scope.currentMarker.id].iconName = $scope.currentMarker.iconName;
            $scope.markers[$scope.currentMarker.id].images = $scope.currentMarker.images;

            $scope.poisFilesList[$scope.currentMarker.id].name = $scope.currentMarker.name;
        }

        geojsonFactory.createGeojsonPoint($scope.markers[$scope.currentMarker.id], $scope.mapa.id).then(
            function(){}, function(){}
        );
    };

    $scope.addCurrentPosition = function(){

        $cordovaGoogleAnalytics.trackEvent('map', 'currentposition point', $scope.mapa.id, 100);

        var posOptions = {timeout: 10000, enableHighAccuracy: true};
        $scope.currentPositionGettingPos = true;
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {

            $scope.currentPositionGettingPos = false;
            if($scope.isInsideCurrentMap(position.coords.latitude,position.coords.longitude)){

                var id = makeId();
                var name = CommonFunctionFactory.getCurrentDate();
                var coordsETRS89 = proj4('+proj=utm +zone=31 +ellps=GRS80 +datum=WGS84 +units=m +no_defs', [ position.coords.longitude, position.coords.latitude]);//$scope.coordsToETRS89(lat, lng);$scope.coordsToETRS89(position.coords.latitude, position.coords.longitude);
                $scope.markers[id] = {
                    id: id,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    x: coordsETRS89[0],
                    y: coordsETRS89[1],
                    icon: iconFactory.orangeIcon,
                    iconName: 'orangeIcon',
                    name: name,
                    description: "",
                    images: [],
                    focus: false,
                    draggable: false
                };


                $scope.poisFilesList[id] = {
                    name: name, 
                    visible: true
                };

                geojsonFactory.createGeojsonPoint($scope.markers[id], $scope.mapa.id).then(function(){

                    openModalPosition(
                        id,
                        position.coords.latitude,
                        position.coords.longitude,
                        "", //name,
                        "",
                        'orangeIcon',
                        iconFactory.orangeIcon,
                        []);

                }, function(error){
                    CommonFunctionFactory.recordError("Create geojson file of point KO... " + JSON.stringify(error));
                });

                $scope.center.lat  = position.coords.latitude;
                $scope.center.lng = position.coords.longitude;

            }else{
                $scope.showAlert("Impossible crear punt","Posició fora dels límits del mapa actual");
            }

        }, function(err) {
            // error
            $scope.currentPositionGettingPos = false;
            logErrorLocation(err);
        });

    };

    $scope.cleanMarker = function(){
        $scope.modalPosition.hide();
        if($scope.currentMarker.id){
            $scope.deletePoi($scope.currentMarker.id);
        }
    };

    $scope.deletePoi = function(poiId){

        storageService.removeFile(storageService.storagePathBase+$scope.mapa.id+"/pois/", poiId+".geojson").then(
            function(){

                delete  $scope.markers[poiId];

                delete  $scope.poisFilesList[poiId];
            },function(error){
                $scope.showAlert("Punt no eliminat", "No s'ha pogut eliminar el punt. Torni a intentar-ho.");
            }
        );

    };

    $scope.updateIcon = function(iconName){
        $scope.currentMarker.iconName = iconName;
    };

    $scope.takePointPicture = function(){

        $cordovaGoogleAnalytics.trackEvent('map', 'picture point', $scope.mapa.id, 100);

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
            CommonFunctionFactory.recordError("get picture error! " + JSON.stringify(err));
        });
    };

    $scope.visiblePoi = function(poiId){

        if($scope.poisFilesList[poiId].visible){

            delete $scope.markers[poiId];
            $scope.poisFilesList[poiId].visible = false;
        }else{

            storageService.readFile(storageService.storagePathBase+$scope.mapa.id+"/pois/", poiId+".geojson").then(

                function(text){

                    var obj = JSON.parse(text);
                    var imagesObj = [];
                    if(!CommonFunctionFactory.isEmpty(obj.properties.images)){
                        imagesObj = obj.properties.images.split(",");
                    }
                    $scope.markers[poiId] = {
                        id: poiId,
                        lat: obj.geometry.coordinates[1],
                        lng: obj.geometry.coordinates[0],
                        icon: iconFactory[obj.properties.iconName],
                        iconName: obj.properties.iconName,
                        name: obj.properties.name,
                        description: obj.properties.description,
                        images: imagesObj, //obj.properties.images.split(","),
                        focus: false,
                        draggable: false
                    };
                    $scope.poisFilesList[poiId].visible = true;

                },function(error){
                    //Error
                    CommonFunctionFactory.recordError("Error llegint fitxer:"+JSON.stringify(error));
                    $scope.showAlert("Punt no afegit", "No s'ha pogut afegir el punt al mapa. Torni a intentar-ho.");
                });

        }

    };

    $scope.isPoiVisible = function(poiId){

        return ($scope.poisFilesList[poiId] && $scope.poisFilesList[poiId].visible === true);
    };

    $scope.initPoisFilesList = function(localPoisList){

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
                                    visible: isVisible
                                };

                                var imagesObj = [];
                                if(!CommonFunctionFactory.isEmpty(obj.properties.images)){
                                    imagesObj = obj.properties.images.split(",");
                                }
                                if(isVisible){
                                    $scope.markers[obj.properties.id] = {
                                        id: obj.properties.id,
                                        lat: obj.geometry.coordinates[1],
                                        lng: obj.geometry.coordinates[0],
                                        icon: iconFactory[obj.properties.iconName],
                                        iconName: obj.properties.iconName,
                                        name: obj.properties.name,
                                        description: obj.properties.description,
                                        images: imagesObj, //obj.properties.images.split(","),
                                        focus: false,
                                        draggable: false
                                    };
                                }
                            },function(error){
                                CommonFunctionFactory.recordError("Error llegintfitxer " + JSON.stringify(error));
                            });
                    }
                }
            },function(error){
                CommonFunctionFactory.recordError("error get entries " + JSON.stringify(error));
            }
            /* jshint ignore:end */
        );
    };

    $scope.goToPoi = function(poiId){

        $scope.focusMap = false;
        $scope.center.lat  = $scope.markers[poiId].lat;
        $scope.center.lng = $scope.markers[poiId].lng;
        $scope.center.zoom = 15;
        $scope.modalFilesList.hide();
    };

    $scope.showInfoPoiFilesList= function(poiId){

        if($scope.isPoiVisible(poiId)){
            openModalPosition(
                poiId,
                $scope.markers[poiId].lat,
                $scope.markers[poiId].lng,
                $scope.markers[poiId].name,
                $scope.markers[poiId].description,
                $scope.markers[poiId].iconName,
                $scope.markers[poiId].icon,//iconFactory[$scope.markers[poiId].iconName]
                $scope.markers[poiId].images);
        }else{

        }
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
                if($scope.isInsideCurrentMap(position.coords.latitude,position.coords.longitude)){
                    $scope.center.lat  = position.coords.latitude;
                    $scope.center.lng = position.coords.longitude;
                    $scope.center.zoom = 15;

                    $scope.provalat = position.coords.latitude;
                    $scope.provalng = position.coords.longitude;
                    $scope.provahead = position.coords.heading;
                    $scope.provaspeed = position.coords.speed;

                    var iconAngle = (position.coords.heading!==null ? position.coords.heading: 0);

                    $scope.markers.now = {
                        id: 'gps',
                        lat:position.coords.latitude,
                        lng:position.coords.longitude,

                        focus: true,
                        zIndexOffset: 10000,

                        draggable: false,

                        icon: {
                            iconUrl: $scope.settings.navicon, //'img/gps.png',
                            iconSize:     [22, 27],
                            iconAnchor:   [11, 27],
                            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
                        },
                        iconAngle: iconAngle
                    };

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
                        },function(err) {
                            count++;
                            CommonFunctionFactory.recordError("ERROR watchPosition "+count+": "+JSON.stringify(err));
                            if($scope.debugMode) $scope.writeLog("LOCATE", "ERROR watchPosition "+count+": "+JSON.stringify(err));
                        },
                        function(position) {
                            count++;

                            if($scope.focusMap){
                                $scope.center.lat  = position.coords.latitude;
                                $scope.center.lng = position.coords.longitude;
                            }

                            $scope.markers.now.lat  = position.coords.latitude;
                            $scope.markers.now.lng = position.coords.longitude;

                            $scope.provalat = position.coords.latitude;
                            $scope.provalng = position.coords.longitude;
                            $scope.provahead = position.coords.heading;
                            $scope.provaspeed = position.coords.speed;

                            var iconAngle = (position.coords.heading!==null ? position.coords.heading: 0);
                            $scope.markers.now.iconAngle = iconAngle;

                        });

                }else{
                    $scope.showToast('Posició fora dels límits del mapa actual', 'long', 'center');
                }
            }, function(error) {
                $scope.GPSgettingPos = false;
                CommonFunctionFactory.recordError("GPS error code:"+error.code);
                if ($scope.debugMode) $scope.writeLog("LOCATE", "ERROR getCurrentPosition:" +JSON.stringify(error));
                logErrorLocation(error);
                $scope.disableGPS();
            });

        }else{
            $scope.disableGPS();
        }
    };

    $scope.disableGPS = function(){
            delete $scope.markers.now;
            if ($scope.currentWatchPosition !== undefined) $scope.currentWatchPosition.clearWatch();
            $scope.focusMap = false;
            $scope.GPSactiu = false;
            $scope.provalat = -1;
            $scope.provalng = -1;
    };

    var logErrorLocation = function(error){

        $cordovaGoogleAnalytics.trackEvent('map', 'location error', $scope.mapa.id+"#"+error.code, 100);
        CommonFunctionFactory.recordError("GPS error:"+JSON.stringify(error));

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



    $scope.$on("leafletDirectiveMap.mymap.dragend", function(event, args) {

        $scope.focusMap = false;

    });


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
                    path_icon: 'camping.png'
                },
                0: {
                    name: "Refugis",
                    visible: false,
                    path_icon: 'refugi.png'
                },
                2: {
                    name: "Turisme Rural",
                    visible: false,
                    path_icon: 'rural.png'
                },
                3: {
                    name: "Albergs",
                    visible: false,
                    path_icon: 'alberg.png'
                }
            };
        }else{
            $scope.extraDataList = JSON.parse(localExtraDataList);
        }
    };

    $scope.visibleExtraData = function(id){

        if($scope.extraDataList[id].visible){

            delete $scope.layers.overlays[id];
            $scope.extraDataList[id].visible = false;


        }else{

            $log.info("Fem extra data VISIBLE...");

            DBExtraDataFactory.getGeojsonData($scope.mapa.id, id).then(
                function(geojson){

                    if(CommonFunctionFactory.isEmpty(geojson)){
                        $scope.showToast("No existeix informació disponible sobre "+$scope.extraDataList[id].name+" a la zona actual", "long", "center");
                    }else{

                        $scope.layers.overlays[id] = {
                            name: $scope.extraDataList[id].name,
                            type: 'geoJSONShape',
                            data: JSON.parse(geojson), //$scope.geojson_talls,
                            visible: true,
                            minZoom: 13,
                            maxZoom: 16,
                            layerOptions: {
                                pointToLayer : function(feature, latlng) {

                                        var redMarker = L.AwesomeMarkers.icon(
                                            iconFactory.blackIcon
                                        );


                                        var tipus_name = $scope.extraDataList[id].name;
                                        var path_icon = 'img/'+$scope.extraDataList[id].path_icon;

                                        var myIcon = L.icon({
                                            iconUrl: path_icon, // $scope.settings.navicon,
                                            iconSize:     [20, 20],
                                            iconAnchor:   [10, 20],
                                            popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
                                        });

                                        var isLinkNotNull = (null !== feature.properties.link);
                                        var hasProtocol = (isLinkNotNull && ((-1 != feature.properties.link.indexOf('http://')) || -1 != feature.properties.link.indexOf('https://')));

                                        var link = isLinkNotNull ? (!hasProtocol ? "http://" : "") + feature.properties.link : "";

                                        var html =
                                          "<div>"+
                                              "<p>"+tipus_name+": <b>"+ feature.properties.nom.toUpperCase() +"</b><br>"+
                                              "Municipi: <b>"+feature.properties.nommuni+"</b>"+
                                              (null !== feature.properties.link ? 
                                                "<br>Enllaç: "+feature.properties.link+"<br>" :
                                                ""
                                              ) +
                                          "</p></div>";

                                        return new L.marker(latlng, {icon:myIcon}).bindPopup(html);
                                }
                            }

                        };
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
        window.open(link, '_system');
    };


/******************************************************/
/********************* GENERAL ************************/
/******************************************************/


    $scope.switchFons = function(){

        $scope.layers.baselayers = {};

        if($scope.initType == 'orto'){        
            leafletData.getMap('mymap').then(function(map) {
                if(map.getZoom() > 17){
                    map.setZoom(17);
                }
            });
            $scope.initType='topo';
            $scope.layers.baselayers.mbtiles_topo = $scope.mbtiles_topo;
        }else{
            $scope.initType='orto';
            $scope.layers.baselayers.mbtiles_orto = $scope.mbtiles_orto;
        }
    };

    $scope.toggleFocusMap = function(){

        if($scope.GPSactiu || $scope.modeTracking !== 0 ){
            if($scope.focusMap){
                // $scope.focusMap = true;
            }else{
                $scope.focusMap = true;
                $scope.center.lat  = ($scope.GPSactiu ? $scope.markers.now.lat : $scope.markers.tracking.lat );
                $scope.center.lng = ($scope.GPSactiu ? $scope.markers.now.lng : $scope.markers.tracking.lng );
            }

        }else{
            $scope.locate();
            $scope.showToast("Iniciem posicionament...", "long", "center");
        }
    };

    $scope.toggleFocusMap2 = function(){

        if($scope.GPSactiu || $scope.modeTracking !== 0 ){
            if(!$scope.focusMap){
                $scope.focusMap = true;
                $scope.center.lat  = ($scope.GPSactiu ? $scope.markers.now.lat : $scope.markers.tracking.lat );
                $scope.center.lng = ($scope.GPSactiu ? $scope.markers.now.lng : $scope.markers.tracking.lng );
            }
        }else{
            $scope.locate();
            $scope.showToast("Iniciem posicionament...", "short", "center");
        }
    };

    $scope.switchFons2 = function(){
      if($scope.initType=='topo'){
        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function(layers){
                angular.forEach(layers, function(layer, key){
                    map.removeLayer(layer);
                });
                map.addLayer($scope.mbtiles_orto);
            });
        });

      }else{
        $scope.initType='topo';
        leafletData.getMap().then(function (map) {
            leafletData.getLayers().then(function (layers) {
                angular.forEach(layers, function(layer, key){
                    map.removeLayer(layer);
                });
                map.addLayer($scope.mbtiles_topo);
            });
        });
      }
    };

    $scope.downloadcurrentMap = function(){

        $scope.myFileDataMap = {filename: "",downloadFormat: "gpx"};
        $scope.fileFormatList = [{ text: "GPX", value: "gpx" },{ text: "KML", value: "kml" }];

        var myPopupSelectFormat = $ionicPopup.show({
          template: '<p><div class="list"><label class="item item-input"><input type="text" placeholder="Nom del fitxer" ng-model="myFileDataMap.filename"></label></div></p><p><div class="item item-divider">Selecciona el format:</div><ion-radio ng-repeat="item in fileFormatList" ng-value="item.value" ng-model="myFileDataMap.downloadFormat">{{ item.text }}</ion-radio></p>',
          title: 'DESCARREGAR DADES<br>(Només punts i traces visibles)',
          //subTitle: 'Només es descarregaran els punts i les traces visibles',
          scope: $scope,
          buttons: [
            { text: 'Cancel·la',
              type: 'button-light' },
            {
              text: '<b>Ok</b>',
              type: 'button-royal',
              onTap: function(e) {
                  downloadMyDataMap($scope.myFileDataMap.downloadFormat, ( CommonFunctionFactory.isEmpty($scope.myFileDataMap.filename)? makeIdMapDate() : $scope.myFileDataMap.filename));
              }
             }
           ]
        });
    };

    $scope.downloadMyDataMap = function(){

        $cordovaGoogleAnalytics.trackEvent('map', 'download data map', $scope.mapa.id+"#"+format, 100);

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
                                        pathFile, //$scope.urlForImage(picture), //file
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

            var geojson = {type: "FeatureCollection",features: []};

            angular.forEach($scope.poisFilesList, function(value, key){

                if(value.visible && publishPictures){

                    var mydesc = $scope.markers[key].description;
                    for(var i=0; i<$scope.markers[key].images.length;i++){
                        mydesc = mydesc + " http://betaserver.icgc.cat/catoffline/"+authService.uid+"/"+ $scope.markers[key].images[i];
                        uploadFactory.uploadFile($scope.mapa.id, authService.uid, $scope.markers[key].images[i]).then(
                            function(res){},function(){}
                        );
                    }

                    geojson.features.push({
                        type: "Feature",
                        properties: {
                            name: $scope.markers[key].name,
                            description: mydesc //$scope.markers[key].description
                        },
                        geometry: {
                          type: "Point",
                          coordinates: [ $scope.markers[key].lng , $scope.markers[key].lat ]
                        }
                    });
                }else if (value.visible) {
                    geojson.features.push({
                        type: "Feature",
                        properties: {
                            name: $scope.markers[key].name,
                            description: $scope.markers[key].description
                        },
                        geometry: {
                          type: "Point",
                          coordinates: [ $scope.markers[key].lng , $scope.markers[key].lat ]
                        }
                    });
                }

            });

            //Afegim tracks visibles
            angular.forEach($scope.tracksFilesList, function(value, key){
                if(value.visible){
                    geojson.features.push({
                      type: "Feature",
                      properties: $scope.geojson[key].data.features[0].properties,
                      geometry: {
                        type: "LineString",
                        coordinates: $scope.geojson[key].data.features[0].geometry.coordinates
                      }
                  });
                }
            });

            //Afegim imported visibles
            angular.forEach($scope.importedFilesList, function(value, key){
                if(value.visible){
                    angular.forEach($scope.geojson[key].data.features, function(feature, key){
                        geojson.features.push({
                          type: "Feature",
                          properties: CommonFunctionFactory.objectWithoutKey(feature.properties, "icon"),
                          geometry: {
                            type: feature.geometry.type,
                            coordinates: feature.geometry.coordinates
                          }
                      });
                    });
                }
            });
            return geojson;
    };
        /* jshint ignore:end */

    $scope.veureInstaMaps = function(){

        if(authService.isAuthenticated){
            publicarMapaInstamaps();
        }else{
            $scope.modalLogingInstamaps.show();
        }
    };

    $scope.doLoginInstamaps = function(dataLogin){

        $cordovaGoogleAnalytics.trackEvent('map', 'login instamaps', dataLogin.username, 100);

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
                //Error al fer login
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

        $cordovaGoogleAnalytics.trackEvent('map', 'publicar instamaps', $scope.mapa.id+"#"+authService.uid, 100);

        //Primer fem upload de les fotos
        $scope.doingPublish = true;
        $scope.modalPusblishInstamaps.show();
        $scope.urlMapInstamapsEmbed = "";

        leafletData.getMap('mymap').then(function(map) {
            var currentZoom = map.getZoom();
            var currentLat = map.getCenter().lat;
            var currentLng = map.getCenter().lng;

            var options = {
                zoom: currentZoom,
                center: currentLat+","+currentLng
            };


            $scope.map.mapNameInstamaps = ( CommonFunctionFactory.isEmpty($scope.map.mapNameInstamaps) ? 'Catalunya Offline ' + CommonFunctionFactory.getCurrentDate()+'' : $scope.map.mapNameInstamaps );

            var publicarAmbFotos = true;
            if(publicarAmbFotos){ }

            var mydata = {
                'token': ''+authService.authToken+'',
                'mapName': $scope.map.mapNameInstamaps,
                'uid': ''+authService.uid+'',
                'myFile': ''+JSON.stringify(getCurrentDataMap($scope.map.uploadPictures))+'',
                'options': ''+JSON.stringify(options)+''
            };

            var myUrl = INSTAMAPS_ACTIONS.host_app_https + INSTAMAPS_ACTIONS.createMapInstamaps;// + toparams(mydata) +'&';
            $log.info(myUrl);
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
                    $scope.urlMapInstamaps = response.data.url; // url_http.replace("http", "https"); //
                    $scope.urlMapInstamapsEmbed = $scope.urlMapInstamaps.replace("http://", "https://") + "&embed=1" + "#"+currentZoom+"/"+currentLat+"/"+currentLng+"";

                }else if(response.data.results == "expired"){
                    $scope.doLogoutInstamaps();
                    $scope.doingPublish = false;
                    $scope.modalPusblishInstamaps.hide();
                    $scope.modalLogingInstamaps.show();
                }else{
                    //Crear mapa
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
                //$cordovaProgress.hide();
            });
        });
    };

    $scope.socialShare = function(socialType){

        $cordovaGoogleAnalytics.trackEvent('map', 'share instamaps', $scope.mapa.id+"#"+socialType, 100);

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

        $cordovaGoogleAnalytics.trackEvent('map', 'share poi picture', $scope.mapa.id, 100);
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
                CommonFunctionFactory.recordError("ERROR social sharing... " + JSON.stringify(err));
            });
    };

/******************************************************/
/******************* GESTIO ESTATS ********************/
/******************************************************/

    $scope.$on('$ionicView.leave', function(){

        if($scope.GPSactiu){
            $scope.disableGPS();
        }else if($scope.modeTracking !== 0){
            $scope.showAlert("Traça finalitzada", "S'ha finalitzat la traça en curs.");
            $scope.stopTracking();
        }

        //Guardar estat actual a localStorage
        leafletData.getMap('mymap').then(function(map) {
            $localstorage.setObject(""+$scope.mapa.id+"", {"prevBounds": map.getBounds(), "prevCenter": map.getCenter(), "prevZoom": map.getZoom(), "poisFilesList": $scope.poisFilesList, "tracksFilesList": $scope.tracksFilesList, "importedFilesList": $scope.importedFilesList });
        },function(){
            $localstorage.setObject(""+$scope.mapa.id+"", {"poisFilesList": $scope.poisFilesList, "tracksFilesList": $scope.tracksFilesList, "importedFilesList": $scope.importedFilesList });
        });

        //tanquem DB
        DBLlocsFactory.closeDB();
        DBExtraDataFactory.closeDB();

    });


    //The view is about to enter and become the active view.
    $scope.$on('$ionicView.beforeEnter', function(){

        $scope.filenameLog = $scope.makeIdPicture() +".log";

        if(angular.equals({}, $localstorage.getObject("settings"))){
            $scope.settings = {
                bsize : 2,
                myshape : 'button-rodo',
                bsizeClass: 'button-size2',
                navicon : 'img/gps_blue.png',
                navicon_modal : 'img/gps_blue.png'
            };

        }else{
            $scope.settings = $localstorage.getObject("settings");
        }

        if($scope.mapa.id > 77){
            $scope.initMapAdded();
        }else{
            $scope.initMap();
        }


        leafletData.getMap().then(function(map) {
            return map.attributionControl.setPrefix('');
         });

        backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;


        $scope.isAndroid = ionic.Platform.isAndroid();
    });


    $scope.$on('$ionicView.enter', function(){

        $cordovaGoogleAnalytics.trackView('map');
        $scope.showToast('També pots fer clic llarg al mapa per fer punts', 'long', 'center');
        $scope.ignoreDirty = false;

        $scope.initDirectories();
        $scope.initTemplates();

        $scope.locate();

         DBLlocsFactory.init();
         DBExtraDataFactory.init();

    });

    //Funcio per capturar sortida del mapa en cas que estigui gravant el track
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

        if($scope.modeTracking !== 0 && !$scope.ignoreDirty){
            event.preventDefault();
            var confirmBackPopup = $ionicPopup.confirm({

                   title: '<div class="my-popup-title"><b><i class="icon ion-alert"></i>&nbsp;Avís</b></div>',
                   template: 'En sortir del mapa es finalitzarà i guardarà la traça en curs',
                   buttons: [
                       {text: 'Cancel·la',
                        type: 'button-light'},
                       {text: 'Ok',
                        type: 'button-royal',
                         onTap: function(e) {

                             $scope.ignoreDirty = true; //Prevent loop
 
                             $ionicHistory.goBack();
                         }
                    }]
                 });
        }
    });

/******************************************************/
/********************* UTILS **************************/
/******************************************************/

    $scope.showToast = function(message, duration, position){
        $cordovaToast.show(message, duration, position)
            .then(function(success) {
              // success
            }, function (error) {
              CommonFunctionFactory.recordError("Error showing toast " + JSON.stringify(error));
            });
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

    $scope.isInsideCurrentMap = function(lat,lon){

        return (lon >= $scope.mapa.lon_min &&
                lon <= $scope.mapa.lon_max &&
                lat >= $scope.mapa.lat_min &&
                lat <= $scope.mapa.lat_max);
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
        $timeout(function() {
            alertPopupError.close();
        }, 5000);
    };

    var toparams = function(obj) {
        var p = [];
        for (var key in obj) {
            p.push(key + '=' + encodeURIComponent(obj[key]));
        }
        return p.join('&');
    };

    /* jshint ignore:start */
    var getMapEvents = function(){
        var mapEvents = leafletMapEvents.getAvailableMapEvents();
        for (var k in mapEvents){
            var eventName = 'leafletDirectiveMap.' + mapEvents[k];
            // $log.info(eventName);

            $scope.$on(eventName, function(event){
                //$log.info("Event detected:"+event.name);
            });
        }
    };
    /* jshint ignore:end */



}])
.filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
/*
Accuracy
http://www.radio-electronics.com/info/satellite/gps/accuracy-errors-precision.php
*/
