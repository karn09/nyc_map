var ViewModel = {
    keyword: ko.observable(''),
    results: ko.observableArray(),
    points: ko.observableArray(),
    placeIds: [],
    locs: ko.observableArray()
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

    service.getPlacePredictions({
        input: keyword
    }, function(predictions) {
        predictions.forEach(function(p) {
            //console.log(p)
            // var info = placeService.getDetails(place_id, function(info) {
            //     console.log(info)
            // })
//            self.placeIds.push(p.place_id);
            //console.log(p.place_id)
            self.getPlaceDetails(p.place_id)
        });
    });
};

ViewModel.getPlaceDetails = function(id) {
    var self = this;
    var mapId = document.getElementById('hold-it'); // have to create an arbitrary element to create PlacesService obj
    var service = new google.maps.places.PlacesService(mapId);
    service.getDetails({ placeId: id }, function(info) {
      self.results.push(info.name)
      console.log(info.geometry.location)
      self.locs.push(info.geometry.location)
    });
    
}

ViewModel.addMarker = function(loc) {
             
        console.log(loc)
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        // for (var i = 0, place; place = places[i]; i++) {
        //     var image = {
        //         size: new google.maps.Size(71, 71),
        //         origin: new google.maps.Point(0, 0),
        //         anchor: new google.maps.Point(17, 34),
        //         scaledSize: new google.maps.Size(25, 25)
        //     };

            // Create a marker for each place.
            var marker = new google.maps.Marker({
                icon: image,
                position: loc
            });

            // markers.push(marker);

            // bounds.extend(loc);
        }
//}

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
        map: new google.maps.Map(mapId, mapOptions); 
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

//window.onload(ko.applyBindings(ViewModel))

window.addEventListener('load', ko.applyBindings(ViewModel))
google.maps.event.addDomListener(window, 'load', new MapViewModel.init(40.777151307946326, -73.97487448144528, 12))