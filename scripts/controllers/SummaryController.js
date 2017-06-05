birthdayBountyApp.controller('SummaryController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  //SPLASH STUFF
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
            formatted: "Melbourne"
        };
      } else if (input.value.toLowerCase() === "sydney"){
        userAddress = {
            lat: -33.868879,
            lng: 151.209090,
            placeId: "ChIJP5iLHkCuEmsRwMwyFmh9AQU",
            formatted: "Sydney"
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
          formatted: address.name
      };  
    }

    userDetails = { address: userAddress };

    var monthVal = $scope.splashInput.month;
    var dayVal = $scope.splashInput.day;

    localStorage.setItem("addressLat", userDetails.address.lat);
    localStorage.setItem("addressLng", userDetails.address.lng);
    localStorage.setItem("addressPlaceId", userDetails.address.placeId);
    localStorage.setItem("addressFormatted", userDetails.address.formatted);
    localStorage.setItem("bdayDay", dayVal);
    localStorage.setItem("bdayMonth", monthVal);

    userDetails.bdayDay = dayVal;
    userDetails.bdayMonth = monthVal;

    $scope.root.filters.availableMonth = monthVal;
    $scope.root.filters.availableDay = dayVal;

    $scope.root.savedUserDetails = userDetails;
  };

  //SUMMARY STUFF
  $scope.getPlunderValue = function(){
    var amount = 0;
    $scope.root.filteredData.forEach(function(bountyItem){
      amount = amount + bountyItem.maxValue;
    });
    return amount;
  };

  $scope.getMyPlunderTotal = function(){
    var total = 0;
    $scope.getMyPlunder().forEach(function(item){
      total += item.maxValue;
    });
    return total;
  };

  $scope.isNew = function(bountyItem){
      var created = moment(bountyItem.created);
      var now = moment();

      var daysDiff = moment.duration(now.diff(created)).asDays();
      return daysDiff < 7;
  };

  $scope.getDistanceToItem = function(item){
      var nearestLocation = $scope.root.getNearestLocation(item);
      return $scope.root.getKmBetweenPlaces($scope.root.savedUserDetails.address.lat, $scope.root.savedUserDetails.address.lng, nearestLocation.lat, nearestLocation.lng);
  };

  $scope.getBountyAvailabilityMessage = function(bountyItem){
    if(bountyItem.conditions.wholeMonth){
      return 'Claim this Birthday Bounty anytime during ' + moment.months()[$scope.dob.getMonth()];
    }

    var itemStart = new Date($scope.dob);   
    itemStart.setDate(itemStart.getDate() - bountyItem.conditions.daysBefore);

    var itemFinish = new Date($scope.dob);
    itemFinish.setDate(itemFinish.getDate() + bountyItem.conditions.daysAfter);

    if(itemStart - itemFinish === 0){
      return 'This Birthday Bounty can only be claimed on your birthday, ' + moment(itemStart).format('dddd Do MMM');
    } else{
      return 'Claim this Birthday Bounty between ' + moment(itemStart).format('dddd Do MMM') + ' and ' + moment(itemFinish).format('dddd Do MMM');
    }
  };

  //Initial bounty data filtering and sorting
  $scope.root.filterBountyData();
});