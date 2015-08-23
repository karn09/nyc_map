/* global google */
/* global ko */


function AppViewModel() {
    var map, infowindow, nyc;
    var self = this;
    var markers = [];

    this.keyword = ko.observable('');
    this.resultsList = ko.observableArray();

    this.setFocus = function (obj) {
        console.log(obj);
        var location = obj.geometry.location;
        var latLng = new google.maps.LatLng(location.G, location.K);
        map.panTo(latLng);
        if (map.zoom = 18) {
            map.setZoom(12)
        }
        setTimeout("map.setZoom(18)", 1000);
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
        console.log(val)
    }

    this.searchService = function (keyword) {
        var self = this;
        var NYCbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.70213498801132, -74.02151065429689),
            new google.maps.LatLng(40.852167627881336, -73.92823830859368)
            );
        var service = new google.maps.places.AutocompleteService({
            location: NYCbounds,
            radius: 7000,
            types: ['restaurant']
        });
        // if (self.results().length == 5) {
        //     self.results([]);
        //     // self.clearMarkers()
        // }
        if (map.zoom == 18) {
            map.setZoom(12)
        }
        service.getPlacePredictions({
            input: keyword,
            // location: NYCbounds,
            // radius: 7000,
            types: ['restaurant']
        }, function (predictions) {
            predictions.forEach(function (p) {
                self.getPlaceDetails(p.place_id)
            });
        });
    };

    this.getPlaceDetails = function (id) {
        console.log(id)
        var self = this;
        var mapId = document.getElementById('predictions'); // have to create an arbitrary element to create PlacesService obj
        var service = new google.maps.places.PlacesService(mapId);
        service.getDetails({
            placeId: id
        }, function (info) {        
            //self.mapResults[info.formatted_phone_number] = info;
            self.resultsList.push(info)
            //console.log(self.results())
            //self.searchSoda(info);
            self.addMarker(info.geometry.location)
        });
    };

    this.addMarker = function (loc) {
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
        } else {
            console.log("Query is not valid, please use telephone number for location")
        }
    };

    this.getSodaData = function (query, phone) {
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
        })).done(function (data) {
            if (data != undefined) {
                self.sodaResults[phone] = data
            } else {
                self.sodaResults[phone] = 'Cannot find number';
            }
        })
    };


    initializeMap();
}

ko.applyBindings(new AppViewModel());
