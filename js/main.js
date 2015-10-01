/* global google */
/* global ko */


function AppViewModel() {
    
    // set globals for access from within functions.
    var map, infowindow, nyc;
    var markers = [];
    this.keyword = ko.observable('');
    this.resultsList = ko.observableArray();
    this.filterResults = ko.observableArray();
    
    // use computed function to determine whether screen is in portrait or landscape mode.
    // this determines how results are displayed.
    
    this.screenPos = ko.computed(function() {
        if(window.innerHeight > window.innerWidth || window.innerWidth < 700){
           return true;
        }
        return false;
    });
    
    this.info = [];
    var self = this;
    
    // setFocus, function called when place location in results list clicked. Will focus map to currently selected item.
    this.setFocus = function (obj) {
        google.maps.event.trigger(obj.marker, 'click');    
    };
    
    // take into account various getAnimation status code, and set to bouncing. Otherwise stop bouncing.     
    function toggleBounce(marker) {
        markers.forEach(function(marker){
            marker.setAnimation(null);
        });
        if (marker.getAnimation() === undefined || marker.getAnimation() === null) {
            marker.setAnimation(google.maps.Animation.BOUNCE);
            
        } 
    }
    
    // enterSearch, on 'enter' keypress, call this.search with query entered.
    this.enterSearch = function (d, e) {
        e.keyCode === 13 && this.search();
        return true;
    };
    
    // called from enterSearch, pass keyword to searchService
    this.search = function () {
        var checkbox = $('input[type="checkbox"][name="within_results"]');
        if (checkbox.prop("checked") === true && this.resultsList().length > 0) {
            this.filterService(this.keyword());
        } else if (checkbox.prop("checked") === false) {
            this.searchService(this.keyword());
        }
    };
    
    // searchService, initialize AutocompleteService, reset map, and clear results and markers. Call retrievePredictions.
    this.searchService = function (keyword) {
        var NYCbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.70213498801132, -74.02151065429689),
            new google.maps.LatLng(40.852167627881336, -73.92823830859368)
            );
            
            // previously used AutocompleteService, turns out using PlacesService is much better.
            // PlacesService returns more than 5 results at a time, and can be constrained based on place types.
        // var service = new google.maps.places.AutocompleteService({
        //     input: keyword,
        //     location: NYCbounds,
        //     bounds: NYCbounds,
        //     radius: 7000,
        //     types: ['geocode'],
        //     componentRestrictions: { country: 'us' }
        // });
        
        var service = new google.maps.places.PlacesService(map);
        
        if (map.zoom >= 18) {
            map.setZoom(12);
        }
        if (self.resultsList().length >= 1) {
            self.resultsList([]);
            self.clearMarkers();
        }
        var request = {
            bounds: NYCbounds,
            types: ['restaurant', 'cafe'],
            radius: '200',
            query: keyword
        };
        
        service.textSearch(request, self.retrievePredictions);
        
    };
    // clear all markers on map
    this.clearMarkers = function() {
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
    };
    
    // retrieve predictions from Google given query entered. Once 
    this.retrievePredictions = function (predictions, status) {
        //var self = this;
            // && self.resultsList().length === 0
        if (predictions.length === 0) {
            self.noResults();
        } else {
            predictions.forEach(function (p) {
                if (p.formatted_address.toLowerCase().indexOf('brooklyn,') > 0 || 
                p.formatted_address.toLowerCase().indexOf('new york,') > 0) {
                    self.getPlaceDetails(p.place_id);
                }
            });   
        }
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
                    info['shortened'] = info.name + ', ' + info.vicinity;
                    promise.success(function (data) {
                        if (data.length > 0 && data[0]['grade'] !== undefined) {
                            info['grade'] = data[0]['grade'];
                        } else if (data.length > 0 && data[1]['grade'] !== undefined) {
                            info['grade'] = data[1]['grade'];  
                        } else {
                            info['grade'] = 'No Grade Found.';
                        }
                        
                      
                        console.log(info);
                        self.resultsList.push(info);                        
                        self.addMarker(info);
                    });
                    promise.error(function(data) {
                        info['grade'] = 'Issue contacting server.';
                        self.resultsList.push(info);                        
                        self.addMarker(info);
                    });
            }
        });
    };
            
    // search through current results, this doesn't actually do anything. this.service() calls this 
    // if checkbox is selected. 
    this.filterService = function(keyword) {
        return ko.observable(keyword);    
    };
    
    // this computes a new filteredResults list. If no filters currently set, then it will default to resultsList()
    // method below is slightly re-worked from http://jsfiddle.net/Lzud7fjr/1/
    self.filteredResults = ko.computed(function () {
        var result;
        self.columns = ko.observableArray([{
            value: 'formatted_address'
        }, {
                value: 'name'
            }, {
                value: 'grade'
            }]);
        if (self.keyword().length >= 0 && $('input[type="checkbox"][name="within_results"]').prop("checked") === false) {
            result = self.resultsList();
        } else if ($('input[type="checkbox"][name="within_results"]').prop("checked") === true) {
            // set new result based on filtering query. 
            // TODO: remove map markers dynamically.
            result = ko.utils.arrayFilter(self.resultsList(), function (item) {
                var matching = -1;
                ko.utils.arrayForEach(self.columns(), function (c) {
                    var val = item[c.value];
                    if (typeof val === 'number') {
                        val = val.toString();
                    }
                    matching += val.toLowerCase().indexOf(self.keyword().toLowerCase()) + 1;
                });
                return matching >= 0;
            });
        }
        return result;
    });
    
    // if no prediction results found.
    this.noResults = function() {
        console.log('test');
    };

    // addMarker, called when updating predictions list. Will draw a marker on locations found. Clicking on Marker
    // will show name of restaurant in map infoWindow.
    this.addMarker = function (place) {
        place.marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
        markers.push(place.marker);
        
        place.marker.setMap(map);
                
        google.maps.event.addListener(place.marker, 'click', function () {
            infowindow.setContent('<h4 class="info-window-header">'+place.name+'</h4><div><p>'+place.vicinity+
            '</p><p><h5>User Rating: </h5>'+place.rating+'</p><p><h5>Food Inspection Grade: </h5>'+place.grade+
            '</p><p><a href='+place.website+'>'+place.website+'</a></p></div>');
            infowindow.open(map, this);
            map.panTo(place.marker.position);
            toggleBounce(place.marker);
        });
        // add additional listener to infowindow to reset marker animations when window closed.
        google.maps.event.addListener(infowindow,'closeclick',function(){
            place.marker.setAnimation(null);
        });
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
    this.getSodaData = function (phone) {
        // Make the API call to Soda
        // scope 'this' for use inside inner functions
        var baseUrl = "https://data.cityofnewyork.us/resource/9w7m-hzhe.json?";
        var query = baseUrl + "phone=" + phone;
        return $.ajax({
            url: query,
            dataType: 'json',
            error: function () {
               return "Issue loading data.";
            },
            complete: function (data, status) {
                console.log(status);
            }
        });
    };

    // Initialize map. 
    initializeMap();
}



ko.applyBindings(new AppViewModel());
