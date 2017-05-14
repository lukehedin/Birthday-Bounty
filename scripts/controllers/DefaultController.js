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
  $scope.logoClicked = function(){
    window.location.href = "#";
  };

  $scope.isSplash = function(){
    return location.hash.endsWith('#/');
  };

    //Nav menu
  var navItems = [];
  var gt = {  name: ">" };
  var getSummaryLink = function(isLink){
    return {
      name: "Bounty Results", //+ ($scope.root.savedUserDetails && $scope.root.savedUserDetails.address.formatted ? $scope.root.savedUserDetails.address.formatted : 'you')
      link: isLink ? '#/' : null
    };
  };
  var getBountyLink = function(isLink){
    var bountyIdParam = $scope.root.getUrlParamByName('bountyId');
    if(bountyIdParam && parseInt(bountyIdParam) !== NaN){
      var bountyItem = $scope.root.getBountyItemById(parseInt(bountyIdParam));

      navItems.push({
        name: bountyItem.organisation.name,
        link: isLink ? '#/bounty?bountyId=' + bountyItem.bountyId : null
      });
    }
  };
  var getMapLink = function(){
    return {
      name: 'Bounty Map',
      link: null
    }
  }

  //always show link back to summary
  if(location.hash.endsWith("#/")){
    navItems.push(gt);
    navItems.push(getSummaryLink());
  } else{
    navItems.push(gt);
    navItems.push(getSummaryLink(true));
  }
  
  //If on bounty page
  if(location.hash.indexOf("#/bounty") !== -1){
    navItems.push(gt);
    navItems.push(getBountyLink(false));
  }

    if(location.hash.indexOf("#/map") !== -1){
    navItems.push(gt);
    navItems.push(getMapLink(false));
  }
  
  $scope.navItems = navItems;

});