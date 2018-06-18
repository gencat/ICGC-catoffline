angular.module('catoffline').factory('CommonFunctionFactory',
['$timeout', '$log',
function($timeout, $log) {

	var self = this;

	//Valor que s'utilitza per detectar punts escapats. Si la distància entre dos
	//punts és superior a la mitjana multiplicada per aquest nombre, es descarta
	//el punt
	self.averageDistanceMultiplier = 3.0;	


	var afegeixInfoPunt = function($scope, pos) {

		var alt = (!self.isEmpty(pos.altitude) ? pos.altitude: 0);
		var tempsPas = $scope.currentTrack.elapsedTime + (performance.now() - $scope.currentTrack.startTime); 
		var desAcum = 0.0;
		var lastHeight = alt;

		if(0 !== $scope.currentTrack.latlngs.length) {

			var lastData = JSON.parse($scope.currentTrack.latlngs[$scope.currentTrack.latlngs.length-1]);
			desAcum = lastData[7];
			lastHeight = lastData[2];

		}

		desAcum += (alt - lastHeight);

		var pointData = [
			pos.longitude, 
			pos.latitude,
			alt, 
			parseFloat($scope.currentTrack.longitudTrack), 	//distància del punt en km
			pos.speed,	//velocitat GPS
			tempsPas,	//temps de pas pel punt en ms
			((parseFloat($scope.currentTrack.longitudTrack) * 1000.0 * 1000.0)/ tempsPas),	//velocitat calculada en m/s
			desAcum	//Desnivell acumulat
		];

		$scope.currentTrack.latlngs.push(JSON.stringify(pointData));
		$scope.currentTrack.numPosicions = $scope.currentTrack.numPosicions +1;

	};

	self.afegeixPunt = function($scope, pos, distance, notInAverage, isLeaflet) {

		var shouldOmitAverage = notInAverage || false;

		if(!shouldOmitAverage)
			$scope.average = (($scope.average * ($scope.currentTrack.numPosicions-1)) + (distance + 2*pos.accuracy))/($scope.currentTrack.numPosicions);

		if(isLeaflet) {

			$scope.paths[$scope.currentTrack.id].latlngs.push({
				lat: pos.latitude,
				lng: pos.longitude
			});

		}
		else
		{

				$scope.tracksFilesList[$scope.currentTrack.id].data.features[0].geometry.coordinates.push([pos.longitude, pos.latitude ]);
				$scope.mapVT.getSource("" + $scope.currentTrack.id).setData($scope.tracksFilesList[$scope.currentTrack.id].data);

		}

		var longitudTrack = parseFloat($scope.currentTrack.longitudTrack) + (distance/1000);
		$scope.currentTrack.longitudTrack = longitudTrack.toFixed(3);

		afegeixInfoPunt($scope, pos);
		$scope.lastPosition = pos;

	};

	self.isEmpty = function(name){
        if(name === undefined || name === "undefined" || name==="" || name === null ) return true;
        else return false;
    };

    self.getCurrentDate = function() {

        var date = new Date();
        var minutes = date.getMinutes();
        if(minutes < 10) minutes = "0"+minutes;

        return (date.getDate()) + "/" + (date.getMonth()+1) + "/" + date.getFullYear().toString() +" "+ date.getHours()+":"+minutes+"h";

    };

    self.recordError = function(msg) {

    	$log.error(msg);
    	window.fabric.Crashlytics.sendNonFatalCrash(msg);

    };

	self.onTimerTickUpdate = function ($scope, event, args, isLeaflet) {
		if($scope.timerRunning) {

			var curr_date = self.getCurrentDate();
			var curr_pos = $scope.currentPosition;
			if($scope.debugMode) $scope.writeLog("timer-tick-gps", curr_date + " - lat: "+curr_pos.latitude+ ", lng: "+curr_pos.longitude);

			if(curr_pos.latitude!== null && curr_pos.longitude !== null ) {

				if(curr_pos.latitude!== $scope.lastPosition.latitude && curr_pos.longitude !== $scope.lastPosition.longitude) {

					var distance = new L.LatLng(curr_pos.latitude, curr_pos.longitude).distanceTo(new L.LatLng($scope.lastPosition.latitude, $scope.lastPosition.longitude));

					//Filtrem els punts escapats de les traçes
					//Si no compleix el criteri de proximitat, guardem el punt com a possible
					//escapat. Un cop vingui el següent a l'escapat mirem la distància entre aquests
					//dos. Si està en línia amb la mitjana, ens els quedem els dos i seguim igual,
					//sinó descartem el primer dels dos i mantenim el segon com a possible escapat.
					if(1 == $scope.currentTrack.numPosicions || ((distance - curr_pos.accuracy) < $scope.average*self.averageDistanceMultiplier))
					{

						if($scope.mayBeEscaped) {

							//Afegim el possible punt escapat al vector de punts. S'ha
							//produit un salt però després d'aquest la distància segueix 
							//la mitjana. Això pot passar quan es reprèn la connexió 
							//de GPS després d'una pèrdua

							self.afegeixPunt($scope, $scope.lastPosition, distance, true, isLeaflet);
							$scope.mayBeEscaped = false;

						}

					  	self.afegeixPunt($scope, curr_pos, distance, false, isLeaflet);

					}
					else
					{

						$scope.mayBeEscaped = true;
						$scope.lastPosition = curr_pos;

					}

				}

				$scope.myTimerTracking = $timeout($scope.onTimeout, $scope.currentTrack.timeInterval*1000);

			}
			else {

				//reenviem peticio, si la posicio actual no estava be
				$scope.$broadcast('timer-tick-gps');

			}

		}

	};

	self.onStartTracking = function($scope) {

		$scope.currentTrack.elapsedTime = 0;
		$scope.currentTrack.startTime = performance.now();

	};

	self.onStopTracking = function($scope) {

		$scope.currentTrack.elapsedTime += (performance.now() - $scope.currentTrack.startTime);

	};

	self.onPauseTracking = function($scope) {

		$scope.currentTrack.elapsedTime += (performance.now() - $scope.currentTrack.startTime);

	};

	self.onRestartTracking = function($scope) {

		$scope.currentTrack.startTime = performance.now();

	};

	self.objectWithoutKey = function(object, key) {

		var deletedKey = object[key],
			otherKeys = self.objectWithoutProperties(object, [key]);

		return otherKeys;

	};

	self.objectWithoutProperties = function(object, keys) {

		var target = {}; 

		for (var i in object) { 

			if (keys.indexOf(i) >= 0) continue; 
			if (!Object.prototype.hasOwnProperty.call(object, i)) continue; 
			target[i] = object[i]; 

		} 

		return target;

	};

	return self;

}]);