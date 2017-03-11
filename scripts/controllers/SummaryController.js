birthdayBountyApp.controller('SummaryController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  $scope.sorters = {
    ValueHighLow: 1,
    ValueLowHigh: 2,
    AvailEarlyLate: 3,
    AvailLateEarly: 4,
    OrgNameAZ: 5,
    CloseBy: 6
  };

  $scope.defaultFilters = {
      searchString: null,
      includeTypes: [1,2,3,4,5,6],
      minValue: 0,
      maxValue: 200,
      showUnknownValue: true,
      monthStart: null,
      dayStart: null,
      monthFinish: null,
      dayFinish: null,
      includeRegistrationReq: true,
      includeIdentificationReq: true,
      includeDigitalVoucherReq: true,
      includePaperVoucherReq: true,
      showNotPlundered: true,
      showPlundered: true,
      sortBy: $scope.sorters.CloseBy
  };

  $scope.bountyItemClicked = function(item){
    //$scope.root.homeScroll = window.pageYOffset;
    window.location = "#/bounty?bountyId=" + item.bountyId;
  };

  $scope.resetBountyFilters = function(){
    //clone deault filters to active ones
    $scope.bountyFilters = jQuery.extend(true, {}, $scope.defaultFilters);
  };
  
  $scope.resetBountyFilters();

  var existingBday = localStorage.getItem("birthday");

  if(existingBday){
    $scope.dob = new Date(existingBday);
    
    var plunderPeriod = getFullPlunderPeriod();

    $scope.defaultFilters.monthStart = moment(plunderPeriod.start).format('MMM');
    $scope.defaultFilters.monthFinish = moment(plunderPeriod.finish).format('MMM');
    $scope.defaultFilters.dayStart = moment(plunderPeriod.start).date();
    $scope.defaultFilters.dayFinish = moment(plunderPeriod.finish).date();

    $scope.resetBountyFilters();
  };

  $scope.getSorterString = function(sorter){
    switch(sorter){
      case $scope.sorters.ValueHighLow: return "Max Value (High to Low)";
      case $scope.sorters.ValueLowHigh: return "Max Value (Low to High)";
      case $scope.sorters.AvailEarlyLate: return "Availability (Early to Late)";
      case $scope.sorters.AvailLateEarly: return "Availability (Late to Early)";
      case $scope.sorters.OrgNameAZ: return "Organisation Name (A-Z)";
      case $scope.sorters.CloseBy: return "Nearest to Me";
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

  $scope.getPlunderPeriodString = function(){
      var filterStart = new Date(moment().year(), moment($scope.bountyFilters.monthStart, 'MMM').month(), $scope.bountyFilters.dayStart);
      var filterFinish = new Date(moment().year(), moment($scope.bountyFilters.monthFinish, 'MMM').month(), $scope.bountyFilters.dayFinish);
      
      if(filterStart.getTime() === filterFinish.getTime()) return "on " + moment(filterStart).format('dddd Do MMMM');
      return "between " + moment(filterStart).format('dddd Do MMMM') + ' and ' + moment(filterFinish).format('dddd Do MMMM');
  };

  $scope.toggleBountyType = function(type){
      var index = $scope.bountyFilters.includeTypes.indexOf(type);

      if(index === -1){
        $scope.bountyFilters.includeTypes.push(type);
      } else{
        $scope.bountyFilters.includeTypes.splice(index, 1);
      }
  };

  $scope.getDistanceToItem = function(item){
      var nearestLocation = $scope.root.getNearestLocation($scope.root.address, item.organisation.locations);
      return $scope.root.getKmBetweenPlaces($scope.root.address.lat, $scope.root.address.lng, nearestLocation.lat, nearestLocation.lng);
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

  function getFullPlunderPeriod(){
    var bdayDate = new Date($scope.dob);

    var minDate = new Date(bdayDate);
    var maxDate = new Date(bdayDate);

    $scope.root.bountyData.forEach(function(item){
        var itemPeriod = getItemAvailablePeriod(item);
        var possibleMin = itemPeriod.start;
        if(possibleMin < minDate) minDate = possibleMin;

        var possibleMax = itemPeriod.finish;
        if(possibleMax > maxDate) maxDate = possibleMax;
    });

    return {
      start: minDate,
      finish: maxDate
    };
  };

  function getItemAvailablePeriod(item){
    var bdayDate = new Date($scope.dob);
    
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
    var options = $scope.bountyFilters;
    
    var shouldPush = function(item) {

        if(options.searchString){
          var searchFor = options.searchString.toLowerCase().trim();
            if(searchFor !== ""
            && item.title.toLowerCase().indexOf(searchFor) === -1 
            && item.organisation.name.toLowerCase().indexOf(searchFor) === -1) return false;
        }
      
        //Included types
        if (options.includeTypes.indexOf(item.types[0]) === -1) return false;

        // Monetary value
        if(item.maxValue){
          if ((options.minValue || options.minValue === 0) && item.maxValue < options.minValue) return false;
          if ((options.maxValue || options.maxValue === 0) && item.maxValue > options.maxValue) return false;
        } else if(!options.showUnknownValue) {
          return false;
        }

        //Availability
        if(options.monthStart && options.dayStart && options.monthFinish && options.dayFinish){
          var filterStart = new Date(moment().year(), moment(options.monthStart, 'MMM').month(), options.dayStart);
          var filterFinish = new Date(moment().year(), moment(options.monthFinish, 'MMM').month(), options.dayFinish);

          if(filterStart > filterFinish) filterStart.setFullYear(filterStart.getFullYear() - 1);

          var itemAvail = getItemAvailablePeriod(item);

          if((itemAvail.start < filterFinish && itemAvail.finish < filterStart)) return false;
          if((itemAvail.start > filterFinish && itemAvail.finish > filterStart)) return false;
        }


        // Eligibility rules
        if(!options.includeRegistrationReq && item.conditions.registrationRequiredUrl) return false;
        if(!options.includeIdentificationReq && item.conditions.identificationRequired) return false;
        if(!options.includeDigitalVoucherReq && item.conditions.digitalVoucherRequired) return false;
        if(!options.includePaperVoucherReq && item.conditions.paperVoucherRequired) return false;

        //Show Me
        var inPlunder = $scope.root.myPlunder.indexOf(item.bountyId) !== -1;
        if(inPlunder && !options.showPlundered) return false;
        if(!inPlunder && !options.showNotPlundered) return false;

        return true;
    };

    var filteredData = [];

    $scope.root.bountyData.forEach(function(bountyItem) {  
        if(shouldPush(bountyItem)) filteredData.push(bountyItem);
    });

     //Sort
      switch(parseInt(options.sortBy)){
          case $scope.sorters.ValueHighLow:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return 1;
              return -1;
            });
          break;
          case $scope.sorters.ValueLowHigh:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return -1;
              return 1;
            });
          break;
          case $scope.sorters.AvailEarlyLate:
            filteredData.sort(function(b1, b2){
              var b1Period = getItemAvailablePeriod(b1);
              var b2Period = getItemAvailablePeriod(b2);

              if(b1Period.start > b2Period.start) return 1;
              if(b1Period.start < b2Period.start) return -1;
              return 0;
            });
          break;
          case $scope.sorters.AvailLateEarly:
            filteredData.sort(function(b1, b2){
              var b1Period = getItemAvailablePeriod(b1);
              var b2Period = getItemAvailablePeriod(b2);

              if(b1Period.finish > b2Period.finish) return -1;
              if(b1Period.finish < b2Period.finish) return 1;
              return 0;
            });
          break;
          case $scope.sorters.OrgNameAZ:
            filteredData.sort(function(b1, b2){
              if(b1.organisation.name > b2.organisation.name) return 1;
              if(b1.organisation.name < b2.organisation.name) return -1;
              return 0;
            });
          break;
          case $scope.sorters.CloseBy:
            filteredData.sort(function(b1, b2){
              var b1ClosestLoc = $scope.root.getNearestLocation($scope.root.address, b1.organisation.locations);
              var b2ClosestLoc = $scope.root.getNearestLocation($scope.root.address, b2.organisation.locations);

              var b1Distance = $scope.root.getKmBetweenPlaces($scope.root.address.lat, $scope.root.address.lng, b1ClosestLoc.lat, b1ClosestLoc.lng);
              var b2Distance = $scope.root.getKmBetweenPlaces($scope.root.address.lat, $scope.root.address.lng, b2ClosestLoc.lat, b2ClosestLoc.lng);

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