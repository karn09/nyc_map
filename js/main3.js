/* global google */
/* global ko */


function AppViewModel() {
    var map, infowindow, nyc;
    var markers = [];
    this.keyword = ko.observable('');
    this.resultsList = ko.observableArray();
    this.info = [];
    var self = this;

    this.setFocus = function (obj) {
        var location = obj.geometry.location;
        var latLng = new google.maps.LatLng(location.G, location.K);
        map.panTo(latLng);
        if (map.zoom >= 16) {
            map.setZoom(12)
        }
        map.setZoom(18);
        //        setTimeout("map.setZoom(18)", 1000);
    };

    this.enterSearch = function (d, e) {
        e.keyCode === 13 && this.search();
        return true
    };

    this.search = function () {
        this.searchService(this.keyword());
    };

    // filter results list by rating
    this.filterBy = function (val) {
        
    }

    this.searchService = function (keyword) {
        //var self = this;
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
        if (map.zoom == 18) {
            map.setZoom(12)
        }
        service.getPlacePredictions({
            input: keyword
        }, self.retrievePredictions)
    };

    this.retrievePredictions = function (predictions, status) {
        //var self = this;
        predictions.forEach(function (p) {
            self.getPlaceDetails(p.place_id)
        })
        // on first run, below lines do not run
        self.info.forEach(function (d) {
            console.log(d)
        })
    };

    this.getPlaceDetails = function (id) {
        var service = new google.maps.places.PlacesService(map);
        service.getDetails({
            placeId: id
        }, function (info, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var phone = self.formatQueryForSODA(info.formatted_phone_number);
                var promise = self.getSodaData(phone, info);
              
                    promise.success(function (data) {
                        if (data.length > 0 && data[0]['grade'] !== undefined) {
                            info['grade'] = data[0]['grade'];
                        } else if (data.length > 0 && data[1]['grade'] !== undefined) {
                            info['grade'] = data[1]['grade'];  
                        } else {
                            info['grade'] = 'No rating found.';
                        }
                        self.resultsList.push(info);
                    })
                  
            }
        });
    };

    this.addMarker = function (loc) {
        //var bounds = new google.maps.LatLngBounds();
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
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(map, marker);
        });
        markers.push(marker)
    };

    this.clearFilters = function () {
        var ele = document.getElementsByName("rating");
        for (var i = 0; i < ele.length; i++) {
            ele[i].checked = false;
        }
    };

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
        //var results = document.getElementById('results-list');
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        //map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(results);
        infowindow = new google.maps.InfoWindow({
            maxWidth: 300
        });

    };
    this.formatQueryForSODA = function (query) {
        if (query) {
            var phone = query;
            var re = new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/g);
            if (re.test(phone)) {
                var nonDigits = new RegExp(/\D/g);
                phone = phone.replace(nonDigits, '');
                return phone;
            }
        } else
            return null;
    };

    this.getSodaData = function (phone, info) {
        // Make the API call to Soda
        // scope 'this' for use inside inner functions
        var baseUrl = "https://data.cityofnewyork.us/resource/9w7m-hzhe.json?";
        var query = baseUrl + "phone=" + phone;
        return $.ajax({
            url: query,
            dataType: 'json',
            error: function () {
                console.log("Issue loading data")
            },
            complete: function (data, status) {
                console.log(status);
            }
        });
    };
    initializeMap();
};

ko.applyBindings(new AppViewModel());
