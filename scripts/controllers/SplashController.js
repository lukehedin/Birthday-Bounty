birthdayBountyApp.controller('SplashController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  //Set up the address input and places service
  var autocomplete;
  $scope.root.loadGoogleMapsAndPlaces(function(){
    //bounds: defaultBounds, default to melb?
    var options = { types: ['address'], componentRestrictions: {country: 'au'} };
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

  $scope.autoAddress = function(val){
    var input = document.getElementById('addressField');
    input.value = val;
  };

  $scope.submitBirthday = function(){
    if(!autocomplete) return; // throw exception?! no autocomplete init
    
    var userAddress;    
    var address = autocomplete.getPlace();

    if(!address || !address.place_id){
      var input = document.getElementById('addressField');

      if(input.value.toLowerCase() === "melbourne"){
        userAddress = {
            lat: -37.813783,
            lng: 144.962947,
            placeId: "ChIJgf0RD69C1moR4OeMIXVWBAU",
            formattedAddress: "Melbourne"
        };
      } else if (input.value.toLowerCase() === "sydney"){
        userAddress = {
            lat: -33.868879,
            lng: 151.209090,
            placeId: "ChIJP5iLHkCuEmsRwMwyFmh9AQU",
            formattedAddress: "Sydney"
        };
      } else {
        return; // alert user to provide address
      }
      
    } else{
      //set user details by place
      userAddress = {
          lat: address.geometry.location.lat(),
          lng: address.geometry.location.lng(),
          placeId: address.place_id,
          formattedAddress: address.address_formatted
      };  
    }

    userDetails = { address: userAddress };

    var monthVal = $scope.splashInput.month;
    var dayVal = $scope.splashInput.day;

    localStorage.setItem("addressLat", userDetails.address.lat);
    localStorage.setItem("addressLng", userDetails.address.lng);
    localStorage.setItem("addressPlaceId", userDetails.address.placeId);
    localStorage.setItem("addressFormatted", userDetails.address.formattedAddress);
    localStorage.setItem("bdayDay", dayVal);
    localStorage.setItem("bdayMonth", monthVal);

    userDetails.bdayDay = dayVal;
    userDetails.bdayMonth = monthVal;

    $scope.root.filters.availableMonth = monthVal;
    $scope.root.filters.availableDay = dayVal;

    $scope.root.savedUserDetails = userDetails;
  };
});