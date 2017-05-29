birthdayBountyApp.controller('NavigationController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

    //Nav menu
  var navItems = [];
  var gt = {  name: ">" };
  var getSummaryLink = function(isLink){
    return {
      name: "Bounty Results", //+ ($scope.root.savedUserDetails && $scope.root.savedUserDetails.address.formatted ? $scope.root.savedUserDetails.address.formatted : 'you')
      link: isLink ? '#/summary' : null
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