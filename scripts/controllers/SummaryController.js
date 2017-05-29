birthdayBountyApp.controller('SummaryController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  //Redirect (cant see unless birthday provided)
  if(!$scope.root.savedUserDetails){
      window.location.href = '#/';
      return;
  }

  var existingBday = localStorage.getItem("birthday");

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