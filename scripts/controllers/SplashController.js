birthdayBountyApp.controller('SplashController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  //Set up the address input and places service
  var autocomplete;
  $scope.root.loadGoogleMapsAndPlaces(function(){
    //bounds: defaultBounds, default to melb?
    var options = { types: ['address'] };
    var input = document.getElementById('addressField');    
    if(input){
        autocomplete = new google.maps.places.Autocomplete(input, options);
        input.focus();
    }
  });

  //Default input fields object
  $scope.splashInput = {
    day: 1,
    month: 'Jan'
  };

  $scope.submitBirthday = function(){
    if(!autocomplete) return; // throw exception?! no autocomplete init
    
    var address = autocomplete.getPlace();
    if(!address || !address.place_id) return; // alert user to provide

    userDetails = {
        address: {
            lat: address.geometry.location.lat(),
            lng: address.geometry.location.lng(),
            placeId: address.place_id
        }
    };

    var monthVal = $scope.splashInput.month;
    var dayVal = $scope.splashInput.day;

    localStorage.setItem("addressLat", userDetails.address.lat);
    localStorage.setItem("addressLng", userDetails.address.lng);
    localStorage.setItem("addressPlaceId", userDetails.address.placeId);
    localStorage.setItem("bdayDay", dayVal);
    localStorage.setItem("bdayMonth", monthVal);

    userDetails.bdayDay = dayVal;
    userDetails.bdayMonth = monthVal;

    $scope.root.filters.availableMonth = monthVal;
    $scope.root.filters.availableDay = dayVal;

    $scope.root.savedUserDetails = userDetails;
  };
});