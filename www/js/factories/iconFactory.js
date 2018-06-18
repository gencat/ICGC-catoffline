angular.module('catoffline').factory('iconFactory', [ function() {

    var iconsObj = {
        
        makiMarkerIcon: {
            type: 'makiMarker',
            icon: 'beer',
            color: '#f00',
            size: "l"
        },
        beigeIcon: {
            type: 'awesomeMarker',
            markerColor: 'beige'
        },
        orangeIcon: {
            type: 'awesomeMarker',
            markerColor: 'orange'
        }, 
        redIcon: {
            type: 'awesomeMarker',
            markerColor: 'red'
        }, 
        purpleIcon: {
            type: 'awesomeMarker',
            markerColor: 'purple'
        }, 
        blueIcon: {
            type: 'awesomeMarker',
            markerColor: 'blue'
        }, 
        greenIcon: {
            type: 'awesomeMarker',
            markerColor: 'green'
        }, 
        darkgreenIcon: {
            type: 'awesomeMarker',
            markerColor: 'darkgreen'
        },
        blackIcon: {
            type: 'awesomeMarker',
            markerColor: 'black'
        },
        navorangeIcon: {
            type: 'awesomeMarker',
            markerColor: 'navorange'
        },
        navyellowIcon: {
            type: 'awesomeMarker',
            markerColor: 'navyellow'
        },        
        gpsIcon: {
            iconUrl: '../img/icons/red-point.png',
            //shadowUrl: 'examples/img/leaf-shadow.png',
            iconSize:     [25, 25], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        },
        navigationIcon: {
            iconUrl: '../../img/icons/navigation.png',
            //shadowUrl: 'img/leaf-shadow.png',
            iconSize:     [50, 50], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [25, 49], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        },
        leaf_icon: {
            iconUrl: '../../img/icons/leaf-green.png',
            shadowUrl: '../../img/icons/leaf-shadow.png',
            iconSize:     [38, 95], // size of the icon
            shadowSize:   [50, 64], // size of the shadow
            iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            shadowAnchor: [4, 62],  // the same for the shadow
            popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }

    };

    return iconsObj;

}]);