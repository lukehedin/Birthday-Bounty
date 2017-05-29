birthdayBountyApp.controller('BountyDetailController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  window.scrollTo(0, 0);

  var bountyIdParam = $scope.root.getUrlParamByName('bountyId');
  if(!bountyIdParam || parseInt(bountyIdParam) === NaN) return;

  var bountyId = parseInt(bountyIdParam);
  var bountyItem = $scope.root.getBountyItemById(bountyId);

  if(!bountyItem) return;

  var placeIdParam = $scope.root.getUrlParamByName('placeId');

  $scope.root.loadGoogleMapsAndPlaces(function(){
    var focusLocation = null;

    if($scope.root.savedUserDetails){
      focusLocation = !!placeIdParam 
        ? $scope.root.getLocationByPlaceId(placeIdParam, bountyItem)
        : $scope.root.getNearestLocation(bountyItem)
    }

    if(!focusLocation) return;

    var renderMapWhenViewReady = function(){
      var mapContainer = document.getElementById('bountyMapContainer');

      if(!mapContainer){
          window.setTimeout(renderMapWhenViewReady, 300);
      } else{
          var nearestLocLatLong = {lat: parseFloat(focusLocation.lat), lng: parseFloat(focusLocation.lng)};

          var googleMap = new google.maps.Map(mapContainer, {
          center: nearestLocLatLong,
          zoom: 14,
          disableDefaultUI: true,
          styles: $scope.root.mapStyle
          });

          var placesService = new google.maps.places.PlacesService(googleMap);
          placesService.getDetails({placeId:focusLocation.placeId},function(placeResult, status){
            if(status == "OK"){
                $scope.nearestBountyPlace = placeResult;
                var marker = new google.maps.Marker({
                    position: nearestLocLatLong,
                    map: googleMap
                });

                $scope.$apply();
            }
        });
      }
    };

    window.setTimeout(renderMapWhenViewReady, 300);
  });

  $scope.getTypeTip = function(hoverEvent, delay, typeId){
      var type = $scope.root.getTypeById(typeId);
      if(type) $scope.root.getTip(hoverEvent, delay, type.name);
  };

  //Available period string
  if($scope.root.savedUserDetails){
    var availablePeriod = $scope.root.getItemAvailablePeriod(bountyItem);
    var start = moment(availablePeriod.start);
    var finish = moment(availablePeriod.finish);

    if(bountyItem.conditions.wholeMonth){
      $scope.availablePeriodString = 'Anytime during ' + start.format('MMMM');
    } else{
      $scope.availablePeriodString = start.diff(finish) === 0
      ? 'Only on your birthday - ' + start.format('dddd DD MMM')
      : 'Between ' + start.format('dddd DD MMM') + " - " + finish.format('dddd DD MMM');
    }
  }

  $scope.viewingBountyItem = bountyItem;
});