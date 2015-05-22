/**
 * initialize and draw map on screen
 */
(function() {
	var map, infoWindow, marker, autocomplete;
	var newYorkCity = new google.maps.LatLng(40.777151307946326, -73.97487448144528);
    var initialize = function() {
        // map options object with default settings centering map on NYC
        var mapOptions = {
            center: newYorkCity,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        // set search boundaries
        var bounds = new google.maps.LatLngBounds(
        	new google.maps.LatLng(40.70213498801132, -74.02151065429689),
        	new google.maps.LatLng(40.852167627881336, -73.92823830859368)
        );

        var input = document.getElementById('pac-input');
        // create search input on maps window
        var searchBox = new google.maps.places.SearchBox(input);
        // bind autocomplete to bounds specified
        autocomplete = new google.maps.places.Autocomplete(input); // 


        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.fitBounds(bounds);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        // add listener on address input
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
        	getAddress();
        });

        //autocomplete.bindTo('bounds', map);

        // infoWindow = new google.maps.InfoWindow();
        // marker = new google.maps.Marker({
        // 	map: map,
        // 	anchorPoint: new google.maps.Point(0, -29)
        // });
    }

var getAddress = function () {
	var place = autocomplete.getPlace();
	console.log(place)
}

    google.maps.event.addDomListener(window, 'load', initialize)
})()