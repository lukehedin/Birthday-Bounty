birthdayBountyApp.controller('SummaryController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  $scope.bountyItemClicked = function(item){
    //$scope.root.homeScroll = window.pageYOffset;
    window.location = "#/bounty?bountyId=" + item.bountyId;
  };

  var existingBday = localStorage.getItem("birthday");

  $scope.getSorterString = function(sorter){
    switch(sorter){
      case $scope.root.sorters.ValueHighLow: return "Max Value (High to Low)";
      case $scope.root.sorters.ValueLowHigh: return "Max Value (Low to High)";
      case $scope.root.sorters.AvailEarlyLate: return "Availability (Early to Late)";
      case $scope.root.sorters.AvailLateEarly: return "Availability (Late to Early)";
      case $scope.root.sorters.OrgNameAZ: return "Organisation Name (A-Z)";
      case $scope.root.sorters.CloseBy: return "Nearest to Me";
    }
  };

  $scope.getPlunderValue = function(){
    var amount = 0;
    $scope.filteredBountyData().forEach(function(bountyItem){
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

  $scope.toggleBountyType = function(type){
      var index = $scope.root.filters.includeTypes.indexOf(type);

      if(index === -1){
        $scope.root.filters.includeTypes.push(type);
      } else{
        $scope.root.filters.includeTypes.splice(index, 1);
      }
  };

  $scope.getDistanceToItem = function(item){
      var nearestLocation = $scope.root.getNearestLocation($scope.root.savedUserDetails.address, item);
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

  function getItemAvailablePeriod(item){
    var now = new Date();
    var thisYear = new Date().getFullYear();

    var savedMonth = moment($scope.root.savedUserDetails.bdayMonth, 'MMM').month();
    var bdayDate = new Date(thisYear, savedMonth, $scope.root.savedUserDetails.bdayDay);

    if(now > bdayDate) bdayDate.setFullYear(thisYear + 1);

    moment($scope.root.savedUserDetails.bdayMonth, 'MMM')
    
    var itemStart = moment(bdayDate);
    var itemFinish = moment(bdayDate);

    if(item.conditions.wholeMonth){
      itemStart = itemStart.startOf('month').toDate();
      itemFinish = itemFinish.endOf('month').toDate();
    } else{
      itemStart = itemStart.subtract(item.conditions.daysBefore, 'days').toDate();
      itemFinish = itemFinish.add(item.conditions.daysAfter, 'days').toDate();
    }

    return {
      start: new Date(itemStart),
      finish: new Date(itemFinish)
    }
  };

  $scope.filteredBountyData = function() {
    var options = $scope.root.filters;
    
    var shouldPush = function(item) {
        //Included types
        if (options.includeTypes.indexOf(item.types[0]) === -1) return false;

        //Availability
        if(options.availableMonth && options.availableDay){
          var now = new Date();
          var thisYear = new Date().getFullYear();

          var filterDate = new Date(thisYear, moment(options.availableMonth, 'MMM').month(), options.availableDay);
          if(now > filterDate) filterDate.setFullYear(thisYear + 1);

          var itemAvail = getItemAvailablePeriod(item);

          if((itemAvail.start < filterDate && itemAvail.finish < filterDate)) return false;
          if((itemAvail.start > filterDate && itemAvail.finish > filterDate)) return false;
        }

        return true;
    };

    var filteredData = [];

    $scope.root.bountyData.forEach(function(bountyItem) {  
        if(shouldPush(bountyItem)) filteredData.push(bountyItem);
    });

     //Sort
      switch(parseInt(options.sortBy)){
          case $scope.root.sorters.ValueHighLow:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return 1;
              return -1;
            });
          break;
          case $scope.root.sorters.ValueLowHigh:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return -1;
              return 1;
            });
          break;
          case $scope.root.sorters.AvailEarlyLate:
            filteredData.sort(function(b1, b2){
              var b1Period = getItemAvailablePeriod(b1);
              var b2Period = getItemAvailablePeriod(b2);

              if(b1Period.start > b2Period.start) return 1;
              if(b1Period.start < b2Period.start) return -1;
              return 0;
            });
          break;
          case $scope.root.sorters.AvailLateEarly:
            filteredData.sort(function(b1, b2){
              var b1Period = getItemAvailablePeriod(b1);
              var b2Period = getItemAvailablePeriod(b2);

              if(b1Period.finish > b2Period.finish) return -1;
              if(b1Period.finish < b2Period.finish) return 1;
              return 0;
            });
          break;
          case $scope.root.sorters.OrgNameAZ:
            filteredData.sort(function(b1, b2){
              if(b1.organisation.name > b2.organisation.name) return 1;
              if(b1.organisation.name < b2.organisation.name) return -1;
              return 0;
            });
          break;
          case $scope.root.sorters.CloseBy:
            filteredData.sort(function(b1, b2){
              var b1ClosestLoc = $scope.root.getNearestLocation($scope.root.savedUserDetails.address, b1);
              var b2ClosestLoc = $scope.root.getNearestLocation($scope.root.savedUserDetails.address, b2);

              var b1Distance = $scope.root.getKmBetweenPlaces($scope.root.savedUserDetails.address.lat, $scope.root.savedUserDetails.address.lng, b1ClosestLoc.lat, b1ClosestLoc.lng);
              var b2Distance = $scope.root.getKmBetweenPlaces($scope.root.savedUserDetails.address.lat, $scope.root.savedUserDetails.address.lng, b2ClosestLoc.lat, b2ClosestLoc.lng);

              if(b1Distance > b2Distance) return 1;
              if(b1Distance < b2Distance) return -1;
              return 0;
            });
          default:
          break;
      }

      return filteredData;
  };
});