function appViewModel() {
    var map, infowindow, nyc
    this.keyword = ko.observable('');
    this.results = ko.observableArray([]);
    this.temp = ko.observableArray([1,2,3])
    this.enterSearch = function(d, e) {
        e.keyCode === 13 && this.search();
        return true
    };

    this.search = function() {
        this.searchService(this.keyword());
    };

    this.searchService = function(keyword) {
        var self = this;
        var NYCbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.70213498801132, -74.02151065429689),
            new google.maps.LatLng(40.852167627881336, -73.92823830859368)
        );
        var service = new google.maps.places.AutocompleteService({
            bounds: NYCbounds,
            types: ['restaurant']
        });
        if (self.results().length == 5) {
            self.results([]);
            // self.clearMarkers()
        }
        if (map.zoom == 18) {
            map.setZoom(12)
        }
        service.getPlacePredictions({
            input: keyword
        }, function(predictions) {
            predictions.forEach(function(p) {
                self.getPlaceDetails(p.place_id)
            });
        });
    };

    this.getPlaceDetails = function(id) {
    	console.log(id)
        var self = this;
        var mapId = document.getElementById('predictions'); // have to create an arbitrary element to create PlacesService obj
        var service = new google.maps.places.PlacesService(mapId);
        service.getDetails({
            placeId: id
        }, function(info) {        
            //self.mapResults[info.formatted_phone_number] = info;
            self.results().push(info)
            //console.log(self.results())
            //self.searchSoda(info);
            //self.addMarker(info.geometry.location)
        });
    };

    function initializeMap() {
        nyc = new google.maps.LatLng(40.777151307946326, -73.97487448144528);
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: nyc,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            types: ['restaurant']
        });
        var input = document.getElementById('pac-input');
        var results = document.getElementById('results-list');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        //map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(results);
        infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

    };

    initializeMap();
}

ko.applyBindings(new appViewModel());