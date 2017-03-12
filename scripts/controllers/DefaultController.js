birthdayBountyApp.controller('DefaultController', function($scope, BirthdayBountyFactory) {
  //DefaultController is used for header and footer functionality, as well as anything else generic
  $scope.root = BirthdayBountyFactory;

  //Only being used for random tags. Needed?
  var taglines = $scope.root.taglines;
  $scope.tagline = taglines[Math.floor(Math.random()*taglines.length)];

  //Plunder is full of stuff you're interested in, displayed in header
  var existingPlunder = localStorage.getItem("myplunder") || "";
  var stringPlunderArray = existingPlunder.split(",");

  stringPlunderArray.forEach(function(stringPlunder){
      $scope.root.myPlunder.push(parseInt(stringPlunder));
  });

  //Birthday displayed in footer, facts somewhere?
  $scope.getBirthdayString = function() {
    return "TODO THIS";
  };

  //Clear button is on header
  $scope.clearBirthday = function(){
    $scope.root.savedUserDetails = null;

    localStorage.removeItem("addressLat");
    localStorage.removeItem("addressLng");
    localStorage.removeItem("addressPlaceId");
    localStorage.removeItem("bdayDay");
    localStorage.removeItem("bdayMonth");

    window.location = './';
  };

  $scope.logoClicked = function(){
    window.location.href = "#";
  }
});