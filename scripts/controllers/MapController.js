birthdayBountyApp.controller('MapController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  $scope.bountyMarkers = [];
  $scope.bountyMarkerTooltip = null;

  function loadAllBountyMarkers(gMap){
    var placesService = new google.maps.places.PlacesService(gMap);

    var tipOffsetY = -10;
    var tipOffsetX = 15;

    var showBountyIconTooltip = function(event, bountyItem){
        var tooltip = $scope.bountyMarkerTooltip;

        if(!tooltip){
          tooltip = document.createElement('div');
          tooltip.className = "bounty-marker-tooltip";
          tooltip.innerHTML = "";
          tooltip.innerHTML += '<b>' + bountyItem.organisation.name + '</b><br/>';
          tooltip.innerHTML += bountyItem.title;

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
        }

        tooltip.style.top = (event.pageY + tipOffsetY)+ 'px';
        tooltip.style.left = (event.pageX + tipOffsetX) + 'px';
    };

    var showDetailedTooltip = function(event, place){
        var tooltip = $scope.bountyMarkerTooltip;

        if(!tooltip){
          tooltip = document.createElement('div');
          tooltip.className = "bounty-marker-tooltip";

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
        }

        tooltip.innerHTML = "";
        tooltip.innerHTML += '<b>' + place.name + '</b><br/>';
        tooltip.innerHTML += place.formatted_address;

        tooltip.style.top = (event.pageY + tipOffsetY)+ 'px';
        tooltip.style.left = (event.pageX + tipOffsetX) + 'px';
    };

    var createBountyMarker = function(item, location, image) {
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      var itemType = $.grep($scope.bountyTypes, function(type){ return type.id == item.types[0]; })[0];
      marker.bountyItem = item;
      marker.bountyLocation = location;

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 26;
          const markerWidth = 26;

          if (!div) {
              div = marker.div = document.createElement('div');
              div.className = "bounty-marker";
              div.hidden = $scope.filteredBountyData().indexOf(item) === -1;
              
              div.style.width = markerWidth + 'px';
              div.style.height = markerHeight + 'px';
              div.style.backgroundImage = 'url(' + itemType.iconPath + ')';
              div.style.backgroundSize =  markerWidth + 'px ' + markerHeight + 'px';
              div.dataset.marker_id = item.bountyId;
              
              google.maps.event.addDomListener(div, "click", function(event) {      
                  google.maps.event.trigger(marker, "click"); //todo: need this?

                  //If we haven't already loaded this place's details
                  if(!location.placeDetails){
                      //Try to load them
                      placesService.getDetails({placeId:location.placeId},function(placeResult, status){
                        if(status == "OK"){
                          //Set the place details so we have it
                          location.placeDetails = placeResult;
                          showDetailedTooltip(event, placeResult);
                        } else{
                          //No place details found
                        }
                    });
                  } else {
                    //We already have the place details
                    showDetailedTooltip(event, location.placeDetails);
                  }
              });

              google.maps.event.addDomListener(div, "mousemove", function(event) {
                  google.maps.event.trigger(marker, "mousemove"); //todo: need this?
                  showBountyIconTooltip(event, item);
              });

              google.maps.event.addDomListener(div, "mouseout", function(event) {      
                  google.maps.event.trigger(marker, "mouseout"); //todo: need this?
                  if($scope.bountyMarkerTooltip){
                    $scope.bountyMarkerTooltip.remove();
                    $scope.bountyMarkerTooltip = null;
                  }
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

    $scope.bountyData.forEach(function(item){
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