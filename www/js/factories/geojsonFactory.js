angular.module('catoffline').factory('geojsonFactory',['$q', '$log','$cordovaFile','storageService', 'CommonFunctionFactory',
function($q, $log, $cordovaFile, storageService, CommonFunctionFactory) {

    var self = this;

    self.createGeojsonPoint = function(point, folder){

        var def = $q.defer();
        var geojsonFile = '{'+
                            '"type": "Feature",'+
                            '"properties": {'+
                                '"id": "'+point.id+'",'+
                                '"name": "'+point.name+'",'+
                                '"description": "'+point.description+'",'+
                                '"images": "'+point.images.join()+'",'+
                                '"icon": '+JSON.stringify(point.icon)+','+
                                '"iconName": "'+point.iconName+'"'+
                            '},'+
                            '"geometry": {'+
                                '"type": "Point",'+
                                '"coordinates": ['+point.lng+', '+point.lat+']'+
                            '}'+
                        '}';

        $cordovaFile.writeFile(storageService.storagePathBase+folder+"/pois/", point.id +".geojson", geojsonFile , true)
            .then(function (success) {
                def.resolve(true);
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("Error creant geojson del punt " + JSON.stringify(error));
            def.reject();
        });

        return def.promise;
    };

    self.createGeojsonPointVT = function(geojsonMarker, folder){

        var def = $q.defer();

        $cordovaFile.writeFile(storageService.storagePathBase+folder+"/pois/", 
                                geojsonMarker.properties.id +".geojson", 
                                (ionic.Platform.isAndroid() ? geojsonMarker : JSON.stringify(geojsonMarker)) , 
                                true)
            .then(function (success) {
                // success
                $log.info("Fitxer geojson escrit OK!");
                def.resolve(true);
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("Error creant geojson del punt " + JSON.stringify(error));
            def.reject();
        });

        return def.promise;
    };

    self.createGeojsonTrack = function(track, folder){

        var def = $q.defer();

        var description = track.description;
        if(description === undefined || description === "undefined") description="";

        //Calcul longitud
        var latlngs = [];

        var lat_min = 100;
        var lon_min = 100;
        var lat_max = -100;
        var lon_max = -100;
        var alt_min = 100000;
        var alt_max = -1;

        $log.info(track.latlngs);
        if(track.latlngs.length === 1){
            track.latlngs.push(track.latlngs[0]);
            $log.info(track.latlngs);
        }

        for (var j in track.latlngs) {

            var coords  = JSON.parse(track.latlngs[j]);

            latlngs.push(L.latLng(coords[0],coords[1]));

            //per poder despres calcular la BBOX
            if(coords[1]<lat_min) lat_min = coords[1];
            if(coords[1]>lat_max) lat_max = coords[1];

            if(coords[0]<lon_min) lon_min = coords[0];
            if(coords[0]>lon_max) lon_max = coords[0];

            var coord2 = Number(coords[2]);
            if((Number(coords[2])!==0) && Number(coords[2])<alt_min){
                alt_min = Number(coords[2]);
            }
            if((Number(coords[2])!==0) && Number(coords[2])>alt_max){
                alt_max = Number(coords[2]);
            }

        }


        var longitud = L.GeometryUtil.length(latlngs);



        var geojsonFile = '{'+
                '"type": "FeatureCollection",'+
                '"id": "'+track.id+'",'+
                '"name": "'+track.name+'",'+
                '"style": {'+
                    '"opacity": 0.75,'+
                    '"weight": 4,'+
                    '"fillColor": "'+track.color+'",'+
                    '"color": "'+track.color+'",'+
                    '"fillOpacity": 0.75'+
                '},'+
                '"features": [{'+
                    '"type": "Feature",'+
                    '"geometry": {'+
                        '"type": "LineString",'+
                        '"coordinates": ['+track.latlngs+']'+
                    '},'+
                    '"properties" : {'+
                        '"index": 0,'+
                        '"id": '+track.id+','+
                        '"longitud": "'+(parseFloat(longitud)/1000).toFixed(3)+'",'+
                        '"num_positions": "'+track.numPosicions+'",'+
                        '"lat_min": "'+lat_min+'",'+
                        '"lat_max": "'+lat_max+'",'+
                        '"lon_min": "'+lon_min+'",'+
                        '"lon_max": "'+lon_max+'",'+
                        '"alt_min": "'+(alt_min === 100000 ? '-': alt_min )+'",'+
                        '"alt_max": "'+(alt_max === -1 ? '-': alt_max )+'",'+
                        '"t_ini": "'+track.t_ini+'",'+
                        '"t_fi": "'+track.t_fi+'",'+
                        '"duration": "'+track.duration+'",'+
                        '"name": "'+track.name+'",'+
                        '"description": "'+description+'",'+
                        '"heightIndex": 2,'+
                        '"cumDistance": 3,'+
                        '"gpsSpeed": 4,'+
                        '"time": 5,'+
                        '"speed": 6,'+
                        '"cumHeightDiff": 7'+
                    '}'+
                '}]'+
            '}';

        $cordovaFile.writeFile(storageService.storagePathBase+folder+"/tracks/", track.id +".geojson", geojsonFile , true)
            .then(function (success) {
            def.resolve(geojsonFile);
        }, function (error) {
            // error
            CommonFunctionFactory.recordError("Error creant geojson del punt " + JSON.stringify(error));
            def.reject();
        });
        return def.promise;
    };


    return self;

}]);
