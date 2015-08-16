 var ViewModel = {
     keyword: ko.observable(''),
     results: ko.observableArray(),
     markers: [],
     mapResults: {},
     sodaResults: {}
 };
 ViewModel.enterSearch = function(d, e) {
     e.keyCode === 13 && this.search();
     return true
 };
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
         self.results([]);
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
        console.log(info)
         //self.mapResults[info.formatted_phone_number] = info;
         self.results().push(info)
         self.searchSoda(info);
         self.addMarker(info.geometry.location)
     });
 };
 ViewModel.viewResults = function() {

 }
 // focus map on selected item
 ViewModel.setFocus = function(obj) {
     var location = obj.geometry.location;
     var latLng = new google.maps.LatLng(location.A, location.F);
     map.panTo(latLng);
     if (map.zoom = 18) {
         map.setZoom(12)
     }
     setTimeout("map.setZoom(18)", 1000);
 };
 // clear all markers from map
 ViewModel.clearMarkers = function() {
     var self = this;
     for (var i = 0; i < self.markers.length; i++) {
         self.markers[i].setMap(null)
     }
     self.markers = [];
 };
 ViewModel.infowindow = function () {
 };
 ViewModel.addMarker = function(loc) {
     var self = this;
     var bounds = new google.maps.LatLngBounds();
     var marker = new google.maps.Marker({
         position: {
             lat: loc.G,
             lng: loc.K
         },
         map: map
     });
     var contentString = 'Test';
     var infowindow = new google.maps.InfoWindow({
      content: contentString
     });
     google.maps.event.addListener(marker, 'click', function() {
         infowindow.open(map,marker);
     });
     self.markers.push(marker)
 };
 ViewModel.searchSoda = function(query) {
    var baseUrl = "https://data.cityofnewyork.us/resource/9w7m-hzhe.json?";
     if (query.formatted_phone_number) {
         var phone = query.formatted_phone_number;
         var re = new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);
         if (re.test(phone)) {
             var nonDigits = new RegExp(/\D/g);
             phone = phone.replace(nonDigits, '');
             var queryBuilder = baseUrl + "phone=" + phone;
             this.getSodaData(queryBuilder, query.formatted_phone_number)
         }
     }
 };
 // query SODA by using phone number
 ViewModel.getSodaData = function(query, phone) {
     // Make the API call to Soda
     // scope 'this' for use inside inner functions
     var self = this;
     $.when($.ajax({
        url: query,
        dataType: 'json',
        success: function () {
            console.log("Done!")
        },
        error: function () {
            console.log("Issue loading data")
        }
     })).done(function(data) {
        if (data != undefined) {
            self.sodaResults[phone] = data
        } else {
            self.sodaResults[phone] = 'Cannot find number';
        }
     })
 };
 ViewModel.search = function() {
     this.searchService(this.keyword());
 };
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
     }
 };
window.addEventListener('load', ko.applyBindings(ViewModel));
google.maps.event.addDomListener(window, 'load', new MapViewModel.init(40.777151307946326, -73.97487448144528, 12));