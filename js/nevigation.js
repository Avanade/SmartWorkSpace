var geoJSONFeatureCollection = {
		"type": "FeatureCollection",
		"name": "Rect1",
		"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
		"features": [
		{ "type": "Feature", "properties": { "id": 2 }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ -0.129840366098377, 51.577010369316845 ],
		                                                                                                           [ -0.129208594138269, 51.577199795080432 ],
		                                                                                                           [ -0.128861489945781, 51.576748982927995 ],
		                                                                                                           [ -0.129478446483039, 51.576515110895862 ] ] ] ] } }
		]
		};

var platform = new H.service.Platform({'apikey': '5cA7YxjJSM3kLtn4MlXrNbIkcRiV5LzJ0J1XWHBMyr0'});

// Get default map types from the platform object:
var defaultLayers = platform.createDefaultLayers();

//Get an instance of the geocoding service:
var geocoder = platform.getGeocodingService();

var watchId;
var marker = null;
var mymap = L.map('nevigation_Map', {zoomControl: false, attributionControl: false});
var myLayer = L.geoJSON().addTo(mymap);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	minZoom: 18,
	id: 'mapbox/streets-v11',
	tileSize: 512,
	zoomOffset: -1,
	accessToken: 'pk.eyJ1IjoiZGV2MDMxNyIsImEiOiJjazduNnBicXYwZ2hzM25wamJsajlkY2t2In0.vYd6vbk1P4ZiUP4Dz0oZ7w'
}).addTo(mymap);

myLayer.addData(geoJSONFeatureCollection);

mymap.dragging.disable();
mymap.touchZoom.disable();
mymap.boxZoom.disable();
mymap.doubleClickZoom.disable();
mymap.keyboard.disable();
mymap.scrollWheelZoom.disable();
mymap.tap.disable();

function centerLeafletMapOnMarker(map, marker) {
	  var latLngs = [marker.getLatLng()];
	  var markerBounds = L.latLngBounds(latLngs);
	  map.fitBounds(markerBounds);
}

function successCallback(position) {
	// Create the parameters for the reverse geocoding request:
	
	var coords = [position.coords.latitude, position.coords.longitude];
	
	if (marker !== null) {
		var line = L.polyline([marker.getLatLng(), coords]);
		mymap.removeLayer(marker);
		
		marker = L.animatedMarker(line.getLatLngs());
        mymap.addLayer(marker);
    } else {
    	marker = L.marker(coords).addTo(mymap);
    }
	centerLeafletMapOnMarker(mymap, marker);
	
	if (!timeTrackingEnabled) {
		var reverseGeocodingParameters = {
				prox: position.coords.latitude + ',' + position.coords.longitude + ',150',
			    mode: 'retrieveAddresses',
			    maxresults: 1
		};
		
		// Call the geocode method with the geocoding parameters,
		// the callback and an error callback function (called if a
		// communication error occurs):
		geocoder.reverseGeocode(
				reverseGeocodingParameters,
			    onSuccess,
			    function(e) { document.getElementById('nevigation_Destination_Name').innerHTML = "Unavailable" });
	}
	
//	if (isMarkerInsidePolygon(coords, geoJSONFeatureCollection.features[0].geometry.coordinates[0][0])) {
//		window.alert("foo");
//	} else  {
//		window.alert("bar");
//	}
}

function errorCallback(error) {
    var errorInfo = document.getElementById('nevigation_Map');

    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorInfo.innerHTML = 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorInfo.innerHTML = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorInfo.innerHTML = 'The request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            errorInfo.innerHTML = 'An unknown error occurred.';
            break;
    }
}

(function watchFunc() {
    if (navigator.geolocation) {
    	watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, {enableHighAccuracy: true});
    } else {
        document.getElementById('nevigation_Map').innerHTML = 'Geolocation is not supported.';
    }
}());

function stopWatchFunc() {
    if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
    } else {
        document.getElementById('nevigation_Map').innerHTML = 'Geolocation is not supported.';
    }
}

// Define a callback function to process the response:
function onSuccess(result) {
	var location = result.Response.View[0].Result[0];
	document.getElementById('nevigation_Destination_Head').innerHTML = "Address";
	document.getElementById('nevigation_Destination_Name').innerHTML = location.Location.Address.Label;
};

function isMarkerInsidePolygon(coords, polyPoints) {       
    var x = coords[0], y = coords[1];

    var inside = false;
    for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
        var xi = polyPoints[i][0], yi = polyPoints[i][1];
        var xj = polyPoints[j][0], yj = polyPoints[j][1];

        var intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {
        	inside = !inside;
        }
    }

    return inside;
};