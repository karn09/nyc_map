/* global google */
/* global ko */


function AppViewModel() {
    
    // set globals for access from within functions.
    var map, infowindow, nyc;
    var markers = [];
    this.keyword = ko.observable('');
    this.resultsList = ko.observableArray();
    this.filterResults = ko.observableArray();
    this.info = [];
    var self = this;
    
    // setFocus, function called when place location in results list clicked. Will focus map to currently selected item.
    this.setFocus = function (obj) {
        var location = obj.geometry.location;
        var latLng = new google.maps.LatLng(location.G-.00004, location.K);
        map.panTo(latLng);
        if (map.zoom >= 16) {
            map.setZoom(12);
        }
        map.setZoom(18);
        toggleBounce(obj.marker);
        // I'm repeating myself here. TODO: refactor into a single generator function that handles marker objects for cases of clicking on from map and listview.
        infowindow.setContent('<h4>'+obj.name+'</h4><div><p>'+obj.formatted_address+'</p><p><h5>Rating: </h5>'+obj.rating+'</p><p><h5>Food Grade: </h5>'+obj.grade+'</p></div>');
        infowindow.open(map, this.marker);
    };
    
    // take into account various getAnimation status code, and set to bouncing. Otherwise stop bouncing.     
    function toggleBounce(marker) {
        if (marker.getAnimation() === undefined || marker.getAnimation() === null || marker.getAnimation() === 1) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        } else {
            marker.setAnimation(null);
        }
    }
    
    // enterSearch, on 'enter' keypress, call this.search with query entered.
    this.enterSearch = function (d, e) {
        e.keyCode === 13 && this.search();
        return true;
    };
    // called from enterSearch, pass keyword to searchService
    this.search = function () {
        this.searchService(this.keyword());
    };

    // searchService, initialize AutocompleteService, reset map, and clear results and markers. Call retrievePredictions.
    this.searchService = function (keyword) {
        var NYCbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.70213498801132, -74.02151065429689),
            new google.maps.LatLng(40.852167627881336, -73.92823830859368)
            );
        var service = new google.maps.places.AutocompleteService({
            input: keyword,
            location: NYCbounds,
            bounds: NYCbounds,
            radius: 7000,
            types: ['restaurant'],
            componentRestrictions: { country: 'us' }
        });
        if (map.zoom >= 18) {
            map.setZoom(12);
        }
        if (self.resultsList().length >= 5) {
            self.resultsList([]);
            self.clearMarkers();
        }
        service.getPlacePredictions({
            input: keyword
        }, self.retrievePredictions);
    };
    // clear all markers on map
    this.clearMarkers = function() {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
    }
    
    // retrieve predictions from Google given query entered. Once 
    this.retrievePredictions = function (predictions, status) {
        //var self = this;
        if (predictions === null && self.resultsList().length === 0) {
            return "Nothing found!"; // -> pop up window instead to try another search
        } else {
            predictions.forEach(function (p) {
                self.getPlaceDetails(p.place_id);
            });   
        };
    };
    // call PlacesServices from Maps API to gather additional formatted information about locations. 
    this.getPlaceDetails = function (id) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: id
        }, function (info, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var phone = self.formatQueryForSODA(info.formatted_phone_number);
                var promise = self.getSodaData(phone, info);
                    // if data request is succesful, check first two records for a grade rating
                    // need to refactor into a function that checks records until grade is found before returning 'No rating found.'
                    promise.success(function (data) {
                        if (data.length > 0 && data[0]['grade'] !== undefined) {
                            info['grade'] = data[0]['grade'];
                        } else if (data.length > 0 && data[1]['grade'] !== undefined) {
                            info['grade'] = data[1]['grade'];  
                        } else {
                            info['grade'] = 'No Grade Found.';
                        }
                        self.addMarker(info);
                        
                        // TODO: only push instances where address contains 'New York'
                        if (info.formatted_address.toLowerCase().indexOf('new york') > 0) {
                            self.resultsList.push(info);                        
                        }
                    });
            }
        });
    };
    
    // list of filters for filtering out inspection grades. 
    this.filters = [
        {grade:'Show All', filter: null},
        {grade:'A', filter: function(item){return item.grade == 'A';}},
        {grade:'B', filter: function(item){return item.grade == 'B';}},
        {grade:'C', filter: function(item){return item.grade == 'C';}},
        {grade:'Other', filter: function(item) { // doesn't appear to work?
            if (item.grade !== 'A' || item.grade !== 'B' || item.grade !== 'C') {
                return item.grade;
            }
           }
        }
    ];
    
    // set active filter on observableArray. Default is null.
    this.activeFilter = ko.observable(self.filters[0].filter); //set a default filter    
    
    // update active filter by setting this.activeFilter with filter requested.
    this.setActiveFilter = function(model,event){
        self.activeFilter(model.filter);
    };
    
    // compute resultsList with filtered information. 
    this.filteredResults = ko.computed(function(){
        var result;
        if(self.activeFilter()){
            result = ko.utils.arrayFilter(self.resultsList(), self.activeFilter());
        } else {
            result = self.resultsList();
        }
        return result;
    });

    // addMarker, called when updating predictions list. Will draw a marker on locations found. Clicking on Marker
    // will show name of restaurant in map infoWindow.
    this.addMarker = function (place) {
        place.marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
        
        google.maps.event.addListener(place.marker, 'click', function () {
            infowindow.setContent('<h4>'+place.name+'</h4><div><p>'+place.formatted_address+'</p><p><h5>Rating: </h5>'+place.rating+'</p><p><h5>Food Grade: </h5>'+place.grade+'</p></div>');
            infowindow.open(map, this);
        });
        markers.push(place.marker);
        place.marker.setMap(map);
    };
    
    this.filterSearch = function (query) {
      this.resultsList.removeAll();
      
      for (var result in this.resultsList) {
          if (resultsList[result].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
              this.resultsList.push(resultsList[result]);
          }
      }  
    };
    
    // initialize display of map, centered on NYC
    function initializeMap() {
        nyc = new google.maps.LatLng(40.777151307946326, -73.97487448144528);
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: nyc,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            types: ['restaurant'],
            mapTypeControl: false
        });
        var input = document.getElementById('pac-input');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        
        infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

    }
    
    // formatQueryForSODA, this function formats the search query using the provided phone number from Google prediction
    // service. Using regex, removes characters and properly formats the phone number so it can be later be found via NYC Open Data API.
    this.formatQueryForSODA = function (query) {
        if (query) {
            var phone = query;
            var re = new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);
            // make sure query is a proper phone number.
            if (re.test(phone)) {
                var nonDigits = new RegExp(/\D/g);
                phone = phone.replace(nonDigits, '');
                return phone;
            }
        } else
            return null;
    };
    
    // getSodaData, this function passes to the NYC Open Data API a phone number in order to return food grade info.
    // I chose to use the phone number instead of the address or name because of many variations in formatting and recorded info.
    // The phone number was more constant.
    this.getSodaData = function (phone, info) {
        // Make the API call to Soda
        // scope 'this' for use inside inner functions
        var baseUrl = "https://data.cityofnewyork.us/resource/9w7m-hzhe.json?";
        var query = baseUrl + "phone=" + phone;
        return $.ajax({
            url: query,
            dataType: 'json',
            error: function () {
                console.log("Issue loading data");
            },
            complete: function (data, status) {
                console.log(status);
            }
        });
    };

    // Initialize map. 
    initializeMap();
};

ko.applyBindings(new AppViewModel());
