 var ViewModel = {
    keyword: ko.observable(''),
    results: ko.observableArray(),
    markers: []
};

ViewModel.enterSearch = function(d, e) {
    e.keyCode === 13 && this.search();
    return true
}
ViewModel.searchService = function(keyword) {
    var self = this;
    var NYCbounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(40.70213498801132, -74.02151065429689),
        new google.maps.LatLng(40.852167627881336, -73.92823830859368)
    );
    var service = new google.maps.places.AutocompleteService({
        bounds: NYCbounds,
        types: ['restaurant']
    });
    if (self.results().length = 5) {
        self.results([])
        self.clearMarkers()
    }
    if (map.zoom = 18) {
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

ViewModel.getPlaceDetails = function(id) {
    var self = this;
    var mapId = document.getElementById('hold-it'); // have to create an arbitrary element to create PlacesService obj
    var service = new google.maps.places.PlacesService(mapId);
    service.getDetails({
        placeId: id
    }, function(info) {
        self.results.push(info)
        self.addMarker(info.geometry.location)
    });

}
// focus map on selected item
ViewModel.setFocus = function (obj) {
    var location = obj.geometry.location
    var latLng = new google.maps.LatLng(location.A, location.F);
    map.panTo(latLng);
    if (map.zoom = 18) {
        map.setZoom(12)
    }
    setTimeout("map.setZoom(18)", 1000);
}
// clear all markers from map
ViewModel.clearMarkers = function() {
    var self = this
    for (var i = 0; i < self.markers.length; i++) {
        self.markers[i].setMap(null)
    }
    self.markers = [];
}

ViewModel.addMarker = function(loc) {
    var self = this;
    var bounds = new google.maps.LatLngBounds();
    var marker = new google.maps.Marker({
        position: {
            lat: loc.A,
            lng: loc.F
        },
        map: map
    });
    self.markers.push(marker)

}

ViewModel.search = function() {
    this.searchService(this.keyword()) // add an event listener here, that onClick 
        //    this.results.push("Results are: " + this.searchService(this.keyword()));
}

var MapViewModel = {
    init: function(Lat, Lng, z) {
        var mapId = document.getElementById('map-canvas')
        var mapOptions = {
            center: new google.maps.LatLng(Lat, Lng),
            // 40.777151307946326, -73.97487448144528
            zoom: z,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            types: ['restaurant']
        };
        map = new google.maps.Map(mapId, mapOptions);
        // try abstracting into a prototype
        // maybelook into DI
        // need to figure out a way to change the center, by overriding the current center in default options.
        // set map center by using eventlistener attached to each search result.

        // var service = new google.maps.places.AutocompleteService({
        //     bounds: NYCbounds,
        //     types: ['restaurant']
        // })
    },

    makeMapMarker: function(m) {
        var infoWindow = new google.maps.infoWindow();
    }

}

var API_ViewModel = function() {
    var self = this;
    var baseUrl = "https://data.cityofnewyork.us/resource/xx67-kt59.json?"

    self.searchResults = ko.observableArray()

    var searchQuery = function(query) {
        var re = new RegExp('^(\+0?1\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$');
        if (re.test(query)) {
            query.replace('(','');          
            var queryBuilder = this.baseUrl + "$q=" + query;
            return this.getSodaData(queryBuilder);
        }
    }
    // query SODA by using phone number
    var getSodaData = function(query) {
        // Make the API call to Soda
        // scope 'this' for use inside inner functions
        $.getJSON(query, function(result) {}).done(function(json) {

            json.forEach(function(obj) {
                //console.log(obj)
                self.searchResults.push({
                    'name': obj.dba,
                    'grade': obj.grade,
                    'violations': obj.violation_description
                });
            })
        }).fail(function(err) {
            console.log(err)
        })
    }

    var searchSodaDataByName = function(street, name) {
        return this.getSodaData(Model.baseUrl, street, name)
    }

}


//window.onload(ko.applyBindings(ViewModel))

window.addEventListener('load', ko.applyBindings(ViewModel))
google.maps.event.addDomListener(window, 'load', new MapViewModel.init(40.777151307946326, -73.97487448144528, 12))