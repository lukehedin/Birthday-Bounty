birthdayBountyApp.controller('SplashController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  //Set up the address input and places service
  var autocomplete;
  $scope.root.loadGoogleMapsAndPlaces(function(){
    //bounds: defaultBounds, default to melb?
    var options = { types: ['address'] };
    var input = document.getElementById('addressField');    
    if(input) autocomplete = new google.maps.places.Autocomplete(input, options);
  });

  //Default input fields object
  $scope.bdayInput = {
    day: 1,
    month: 'Jan'
  };

  $scope.submitBirthday = function(){
    if(!autocomplete) return; // throw exception?! no autocomplete init
    
    var address = autocomplete.getPlace();
    if(!address || !address.place_id) return; // alert user to provide

    $scope.root.address = {
        lat: address.geometry.location.lat(),
        lng: address.geometry.location.lng(),
        placeId: address.place_id
    }

    localStorage.setItem("addressLat", $scope.root.address.lat);
    localStorage.setItem("addressLng", $scope.root.address.lng);
    localStorage.setItem("addressPlaceId", $scope.root.address.placeId);

    var monthVal = moment($scope.bdayInput.month, 'MMM').month();
    var dayVal = $scope.bdayInput.day;

    var now = new Date();
    var bdayDate = new Date(now.getFullYear(), monthVal, dayVal);
    
    $scope.root.dob = bdayDate;
    localStorage.setItem("birthday", $scope.root.dob);
  };

  $scope.getDaysInMonth = function(shortMonth){
    if(!shortMonth) shortMonth = "Jan";
    var days = moment(shortMonth, 'MMM').daysInMonth();
    var daysArray = [];
    for(var i = 1; i <= days; i++) daysArray.push(i);
    return daysArray;
  }

  $scope.getShortMonths = function(){
    return moment.monthsShort();
  }

  $scope.dobFieldChange = function(fld){
    var fldVal = $('#' + fld + 'Field')[0].value;

    switch(fld){
      case "day":
        if(fldVal && (!isNaN(fldVal)) && fldVal.length === 2 && fldVal <= 31) $('#monthField').focus();
        break;
      case "month":
        if(fldVal && (!isNaN(fldVal)) && fldVal.length === 2 && fldVal <= 12) $('#yearField').focus();
        break;
      default:
        break;
    }
  };
});