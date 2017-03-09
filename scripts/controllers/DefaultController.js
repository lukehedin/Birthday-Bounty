var birthdayBountyApp = angular.module('BirthdayBountyApp', []);

birthdayBountyApp.factory('BirthdayBountyFactory', function(){
  return {
    //common data
    dob: null,
    bountyData: bountyData,
    bountyTypes: [{ 
        id: 1,
        ordinal: 1,
        iconPath: 'images/marker_sweets.svg',
        name: 'Sweet Food / Desserts'
      }, { 
        id: 2,
        ordinal: 2,
        iconPath: 'images/marker_food.svg',
        name: 'Savoury Food / Meals'
      }, { 
        id: 5,
        ordinal: 3,
        iconPath: 'images/marker_voucher.svg',
        name: 'Vouchers'
      }, { 
        id: 6,
        ordinal: 4,
        iconPath: 'images/marker_drink.svg',
        name: 'Drinks'
      }, { 
        id: 4,
        ordinal: 5,
        iconPath: 'images/marker_activity.svg',
        name: 'Activities'
      }, { 
        id: 3,
        ordinal: 6,
        iconPath: 'images/marker_alcohol.svg',
        name: 'Alcohol / Bars'
      }],
    taglines: [
      "Set sail for savings!",
      "Get free stuff!",
      "Why spend, when you can plunder?",
      "The best things in life are free!",
      "Don't pay for things on your bithday!",
      "Arghh, me hearties! Let's find some bounty!",
      "Because you're a cheapskate!",
      "More bounty coming soon!",
      "The best kind of stuff is free stuff!",
      "It's the most wonderful time of your year!",
      "Time for a birthday binge?",
      "Treat yourself!",
      "Give it to me, baby!",
      "You are a pirate!",
      "Yay! Piracy!"
    ],
    myPlunder: [],

    //common functions
    getTypeById: function(typeId){
      var me = this;

      var requestedType = null;
      me.bountyTypes.forEach(function(type){
        if(!requestedType && type.id === typeId) requestedType = type;
      });

      return requestedType;
    },

    getBountyItemById: function(bountyId){
      var me = this;

      var requestedItem = null;
      me.bountyData.forEach(function(item){
        if(!requestedItem && item.bountyId === bountyId) requestedItem = item;
      });
      
      return requestedItem;
    }
  };
});

birthdayBountyApp.controller('DefaultController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  var taglines = $scope.root.taglines;
  $scope.tagline = taglines[Math.floor(Math.random()*taglines.length)];
  $scope.birthdayInput = {
    day: 1,
    month: 'Jan',
    postcode: 3000
  };

  var existingBday = localStorage.getItem("birthday");

  if(existingBday) $scope.root.dob = new Date(existingBday);

  //init my plunder
  var existingPlunder = localStorage.getItem("myplunder") || "";
  var stringPlunderArray = existingPlunder.split(",");

  stringPlunderArray.forEach(function(stringPlunder){
    $scope.root.myPlunder.push(parseInt(stringPlunder));
  });
  
  $scope.getBirthdayString = function() {
    return moment($scope.root.dob).format('DD/MM');
  }

  $scope.clearBirthday = function(){
    $scope.root.dob = null;
    localStorage.removeItem("birthday");
  };
});

birthdayBountyApp.controller('SplashController', function($scope, BirthdayBountyFactory) {
  $scope.root = BirthdayBountyFactory;

  $scope.birthdayInput = {
    day: 1,
    month: 'Jan',
    postcode: 3000
  };

  $scope.submitBirthday = function(){
    var monthVal = moment($scope.birthdayInput.month, 'MMM').month();
    var dayVal = $scope.birthdayInput.day;

    var now = new Date();
    var bdayDate = new Date(now.getFullYear(), monthVal, dayVal);
    
    localStorage.setItem("birthday", bdayDate);
    $scope.root.dob = bdayDate;

    var plunderPeriod = getFullPlunderPeriod();
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
      sortBy: $scope.sorters.OrgNameAZ
  };

  $scope.resetBountyFilters = function(){
    //clone deault filters to active ones
    $scope.bountyFilters = jQuery.extend(true, {}, $scope.defaultFilters);
  }
  
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
  }

  $scope.getSorterString = function(sorter){
    switch(sorter){
      case $scope.sorters.ValueHighLow: return "Max Value (High to Low)";
      case $scope.sorters.ValueLowHigh: return "Max Value (Low to High)";
      case $scope.sorters.AvailEarlyLate: return "Availability (Early to Late)";
      case $scope.sorters.AvailLateEarly: return "Availability (Late to Early)";
      case $scope.sorters.OrgNameAZ: return "Organisation Name (A-Z)";
    }
  }

  $scope.getPlunderValue = function(){
    var amount = 0;
    $scope.filteredBountyData().forEach(function(bountyItem){
      amount = amount + bountyItem.maxValue;
    });
    return amount;
  }

  $scope.getMyPlunderTotal = function(){
    var total = 0;
    $scope.getMyPlunder().forEach(function(item){
      total += item.maxValue;
    });
    return total;
  }

  $scope.getPlunderPeriodString = function(){
      var filterStart = new Date(moment().year(), moment($scope.bountyFilters.monthStart, 'MMM').month(), $scope.bountyFilters.dayStart);
      var filterFinish = new Date(moment().year(), moment($scope.bountyFilters.monthFinish, 'MMM').month(), $scope.bountyFilters.dayFinish);
      
      if(filterStart.getTime() === filterFinish.getTime()) return "on " + moment(filterStart).format('dddd Do MMMM');
      return "between " + moment(filterStart).format('dddd Do MMMM') + ' and ' + moment(filterFinish).format('dddd Do MMMM');
  }

  $scope.toggleBountyType = function(type){
      var index = $scope.bountyFilters.includeTypes.indexOf(type);

      if(index === -1){
        $scope.bountyFilters.includeTypes.push(type);
      } else{
        $scope.bountyFilters.includeTypes.splice(index, 1);
      }
  }

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
  }

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
  }

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
  }

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
          default:
          break;
      }

      return filteredData;
  }
});

birthdayBountyApp.controller('MapController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  $scope.bountyMarkers = [];
  $scope.bountyMarkerTooltip = null;

  function renderMapWhenReady(){
    $.getScript('https://www.google.com/jsapi', function()
    {
        google.load('maps', '3', { other_params: ['key=AIzaSyBnG2wcWi0MrBxd3wTtNCKTau-xHD_B324&libraries=places'], callback: function() {
          setTimeout(function() {
            //Google Map
            var mapContainer = $('#bountyMapContainer')[0];

            var googleMap = new google.maps.Map(mapContainer, {
              center: {lat: -37.815112, lng: 144.960909},
              zoom: 14,
              disableDefaultUI: true,
              styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#bcbbbb"},{"visibility":"on"}]}]
            });
              
            loadAllBountyMarkers(googleMap);
          }, 0)
        }});
    });
  };

  function loadAllBountyMarkers(gMap){
    var placesService = new google.maps.places.PlacesService(gMap);

    var tipOffsetY = -10;
    var tipOffsetX = 15;

    var showBountyIconTooltip = function(event, bountyItem){
        var tooltip = $scope.bountyMarkerTooltip;

        if(!tooltip){
          tooltip = document.createElement('div');
          tooltip.className = "bounty-marker-tooltip";
          tooltip.innerHTML = "";
          tooltip.innerHTML += '<b>' + bountyItem.organisation.name + '</b><br/>';
          tooltip.innerHTML += bountyItem.title;

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
        }

        tooltip.style.top = (event.pageY + tipOffsetY)+ 'px';
        tooltip.style.left = (event.pageX + tipOffsetX) + 'px';
    };

    var showDetailedTooltip = function(event, place){
        var tooltip = $scope.bountyMarkerTooltip;

        if(!tooltip){
          tooltip = document.createElement('div');
          tooltip.className = "bounty-marker-tooltip";

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
        }

        tooltip.innerHTML = "";
        tooltip.innerHTML += '<b>' + place.name + '</b><br/>';
        tooltip.innerHTML += place.formatted_address;

        tooltip.style.top = (event.pageY + tipOffsetY)+ 'px';
        tooltip.style.left = (event.pageX + tipOffsetX) + 'px';
    };

    var createBountyMarker = function(item, location, image) {
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      var itemType = $.grep($scope.bountyTypes, function(type){ return type.id == item.types[0]; })[0];
      marker.bountyItem = item;
      marker.bountyLocation = location;

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 26;
          const markerWidth = 26;

          if (!div) {
              div = marker.div = document.createElement('div');
              div.className = "bounty-marker";
              div.hidden = $scope.filteredBountyData().indexOf(item) === -1;
              
              div.style.width = markerWidth + 'px';
              div.style.height = markerHeight + 'px';
              div.style.backgroundImage = 'url(' + itemType.iconPath + ')';
              div.style.backgroundSize =  markerWidth + 'px ' + markerHeight + 'px';
              div.dataset.marker_id = item.bountyId;
              
              google.maps.event.addDomListener(div, "click", function(event) {      
                  google.maps.event.trigger(marker, "click"); //todo: need this?

                  //If we haven't already loaded this place's details
                  if(!location.placeDetails){
                      //Try to load them
                      placesService.getDetails({placeId:location.placeId},function(placeResult, status){
                        if(status == "OK"){
                          //Set the place details so we have it
                          location.placeDetails = placeResult;
                          showDetailedTooltip(event, placeResult);
                        } else{
                          //No place details found
                        }
                    });
                  } else {
                    //We already have the place details
                    showDetailedTooltip(event, location.placeDetails);
                  }
              });

              google.maps.event.addDomListener(div, "mousemove", function(event) {
                  google.maps.event.trigger(marker, "mousemove"); //todo: need this?
                  showBountyIconTooltip(event, item);
              });

              google.maps.event.addDomListener(div, "mouseout", function(event) {      
                  google.maps.event.trigger(marker, "mouseout"); //todo: need this?
                  if($scope.bountyMarkerTooltip){
                    $scope.bountyMarkerTooltip.remove();
                    $scope.bountyMarkerTooltip = null;
                  }
              });              
              
              var panes = marker.getPanes();
              panes.overlayImage.appendChild(div);
          }
          
          var latLng = new google.maps.LatLng(location.lat, location.lng);
          var point = marker.getProjection().fromLatLngToDivPixel(latLng);
          
          if (point) {
              div.style.left = (point.x - (markerWidth/2)) + 'px';
              div.style.top = (point.y - markerHeight) + 'px';
          }
      };

      $scope.bountyMarkers.push(marker);
    }

    $scope.bountyData.forEach(function(item){
      item.organisation.locations.forEach(function(location){
        var latLng = new google.maps.LatLng(location.lat, location.lng);

        var marker = new google.maps.Marker({
            position: latLng,
            title: item.title,
            map: gMap,
            icon: '/'
        });
        
        marker.metadata = {type: "point", id: item.bountyId};
        createBountyMarker(item, location, null);
      });
    });
  };
});

birthdayBountyApp.controller('BountyDetailController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  //Function to get query params
  getUrlParamByName = function(name) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  var bountyIdParam = getUrlParamByName('bountyId');
  if(!bountyIdParam || parseInt(bountyIdParam) === NaN) return;

  var bountyId = parseInt(bountyIdParam);
  var bountyItem = $scope.root.getBountyItemById(bountyId);

  if(!bountyItem) return;

  $scope.viewingBountyItem = bountyItem;

});