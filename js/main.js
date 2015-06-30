/**
 * initialize and draw map on screen
 */
(function() {
    var map, infoWindow, marker, autocomplete, service, searchBox
    var newYorkCity = new google.maps.LatLng(40.777151307946326, -73.97487448144528);
    var cache = {};

    var initialize = function() {
        var that = this;
        that.keyword = ko.observable("");
        that.results = ko.observableArray();

        // map options object with default settings centering map on NYC
        //var search = ko.observable("");
        var mapOptions = {
            center: newYorkCity,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            types: ['restaurant']
        };
        // set search boundaries
        var NYCbounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(40.70213498801132, -74.02151065429689),
            new google.maps.LatLng(40.852167627881336, -73.92823830859368)
        );

        var input = document.getElementById('pac-input');
        // create search input on maps window
        //var searchBox = new google.maps.places.SearchBox(input);
        // bind autocomplete to bounds specified
        //autocomplete = new google.maps.places.Autocomplete(input);
        service = new google.maps.places.AutocompleteService({
            bounds: NYCbounds,
            types: ['restaurant']
        });

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        map.fitBounds(NYCbounds);
        //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        //var serviceObj = new google.maps.places.PlacesService(map);


        that.enterSearch = function(d, e) {
            e.keyCode === 13 && that.search();
            return true;
        };

        that.search = function() {
            service.getPlacePredictions({
                input: that.keyword()
            }, function(predictions) {
                if (that.results().length > 0) {
                    that.results.removeAll();
                }
                predictions.forEach(function(p) {
                    console.log(p.terms)
                    var id = p.place_id;
                    //var pInfo = p.getDetails(id)
                    that.results.push(
                        id
                        // '<div class="panel panel-default">'+
                        // '<div class="panel-heading"><a href="">'+ p.description + '</a></div></div><hr>'
                        )
                })
            })
        };



        // var results = ko.computed(function() {
        //         if (event.which == 13 || event.keyCode == 13) {
        //             //code to execute here
        //             console.log(this.search())
        //             return false;
        //         }
        //         return true;
        //     }, this)
        // var results = ko.computed(function() {
        //     //console.log(this.search())
        //     //searchBox = new google.maps.places.SearchBox(this.search());
        //     //autocomplete = new google.maps.places.Autocomplete(this.search());
        //     //service = new google.maps.places.AutocompleteService();
        //     service.getPlacePredictions({ 
        //         input: this.search() 
        //     }, function(pred) {

        //     }, 'OK')
        // }, this);

        // function search(input) {
        //     $('<p>').text('searching for '+input.value).appendTo('body');
        // }

        // $("#searchForm").submit(function() {
        //     search($("#searchText").get(0));
        //     return false;
        // });
        //console.log(this.input())


        //autocomplete.bindTo('bounds', map);

        // infoWindow = new google.maps.InfoWindow();
        // marker = new google.maps.Marker({
        // 	map: map,
        // 	anchorPoint: new google.maps.Point(0, -29)
        // });
    }

    var renderInfo = function(predictions) {
        var resultList = document.getElementById('results');
        console.log(predictions)
        if (resultList.childNodes) {

        }
    };


    //http://www.codeproject.com/Articles/351298/KnockoutJS-and-Google-Maps-binding
    var getAddress = function(input) {
        //var place = autocompleteService.getQueryPredictions();
        //console.log(place)
        service.getQueryPredictions(input, function(pred) {
            console.log(pred)
        });
    };



    google.maps.event.addDomListener(window, 'load',
        ko.applyBindings(new initialize))
})()