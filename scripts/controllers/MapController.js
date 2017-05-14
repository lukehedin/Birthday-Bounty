birthdayBountyApp.controller('MapController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  var latParam = $scope.root.getUrlParamByName('lat');
  var lngParam = $scope.root.getUrlParamByName('lng');

    //Australia default
    var zoom = 4;
    var lat = -25.274398;
    var lng = 133.775136;

    if($scope.root.savedUserDetails){
        //If we have saved address we either show the address centered, or the query string bounty location centered
        zoom = (latParam && parseFloat(latParam) !== NaN && lngParam && parseFloat(lngParam) !== NaN)
            ? 15
            : 13;

        lat = latParam && parseFloat(latParam) !== NaN 
            ? parseFloat(latParam) 
            : parseFloat($scope.root.savedUserDetails.address.lat);
        lng = lngParam && parseFloat(lngParam) !== NaN 
            ? parseFloat(lngParam) 
            : parseFloat($scope.root.savedUserDetails.address.lng);
    }

  $scope.bountyMarkers = [];
  $scope.bountyMarkerTooltip = null;

  $scope.root.loadGoogleMapsAndPlaces(function(){
      var renderMapWhenViewReady = function(){
        var mapContainer = document.getElementById('bountyMapContainer');

        if(!mapContainer){
            window.setTimeout(renderMapWhenViewReady, 300);
        } else{
            var googleMap = new google.maps.Map(mapContainer, {
            center: {lat: lat, lng: lng},
            zoom: zoom,
            disableDefaultUI: true,
            styles: $scope.root.mapStyle
            });

            loadAllBountyMarkers(googleMap);
        }
      };

      window.setTimeout(renderMapWhenViewReady, 300);
  });

  function loadAllBountyMarkers(gMap){
    var placesService = new google.maps.places.PlacesService(gMap);

    var tipOffsetY = -10;
    var tipOffsetX = 15;

    var createBountyMarker = function(item, location, image) {
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      var itemType = $scope.root.getTypeById(item.types[0]);
      marker.bountyItem = item;
      marker.bountyLocation = location;

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 26;
          const markerWidth = 26;

          if (!div) {
              div = marker.div = document.createElement('div');
              div.className = "bounty-marker";
              div.hidden = $scope.root.bountyData.indexOf(item) === -1;
              
              div.style.width = markerWidth + 'px';
              div.style.height = markerHeight + 'px';
              div.style.backgroundImage = 'url(' + itemType.iconPath + ')';
              div.style.backgroundSize =  markerWidth + 'px ' + markerHeight + 'px';
              div.dataset.marker_id = item.bountyId;
              
              google.maps.event.addDomListener(div, "click", function(event) {      
                google.maps.event.trigger(marker, "click"); //todo: need this?
                
            
                var tipMsg = "<a href='#/bounty?bountyId=" +  marker.bountyItem.bountyId + "&placeId=" + location.placeId + "'>View Details</a>";

                $scope.root.getTip(event, 0, item.organisation.name, tipMsg, true);
              });

              google.maps.event.addDomListener(div, "mouseenter", function(event) {
                  google.maps.event.trigger(marker, "mouseenter"); //todo: need this?
                  $scope.root.getTip(event, 0, item.organisation.name, item.title);
              });       
              
              var panes = marker.getPanes();
              panes.overlayImage.appendChild(div);
          }
          
          var latLng = new google.maps.LatLng(location.lat, location.lng);
          var point = marker.getProjection().fromLatLngToDivPixel(latLng);
          
          if (point) {
              div.style.left = (point.x - (markerWidth/2)) + 'px';
              div.style.top = (point.y - markerHeight) + 'px';
          }
      };

      $scope.bountyMarkers.push(marker);
    }

    $scope.root.bountyData.forEach(function(item){
      item.organisation.locations.forEach(function(location){
        var latLng = new google.maps.LatLng(location.lat, location.lng);

        var marker = new google.maps.Marker({
            position: latLng,
            title: item.title,
            map: gMap,
            icon: '/'
        });
        
        marker.metadata = {type: "point", id: item.bountyId};
        createBountyMarker(item, location, null);
      });
    });
  };
});