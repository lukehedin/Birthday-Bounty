app.controller('MainController', ['$scope', function($scope) {

  $scope.init = function(){

    //Load required static data
    $scope.bountyData = bountyData;
    $scope.bountyTypes = [{ 
        id: 4,
        iconPath: 'images/marker_activity.svg',
        name: 'activity'
      }, { 
        id: 2,
        iconPath: 'images/marker_food.svg',
        name: 'food'
      }, { 
        id: 5,
        iconPath: 'images/marker_voucher.svg',
        name: 'voucher'
      }, { 
        id: 3,
        iconPath: 'images/marker_drink.svg',
        name: 'drink'
      }, { 
        id: 1,
        iconPath: 'images/marker_sweets.svg',
        name: 'sweets'
      }];
      
    //init enums
    $scope.enums = {
      showMe: {
        All: 1,
        NotPlundered: 2,
        Plundered: 3
      },
      sorter: {
        ValueHighLow: 1,
        ValueLowHigh: 2,
        AvailEarlyLate: 3,
        AvailLateEarly: 4,
        OrgNameAZ: 5
      }
    }
    //init internal static vars
    $scope.monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    //init scope vars
    $scope.bountyMarkers = [];
    $scope.bountyMarkerTooltip = null;

    //init options
    $scope.plunderOptions = {
        includeTypes: [1,2,3,4,5],
        minValue: 0,
        maxValue: 1000,
        showUnknownValue: true,
        dateStart: null,
        dateFinish: null,
        includeRegistrationReq: true,
        includeIdentificationReq: true,
        includeDigitalVoucherReq: true,
        includePaperVoucherReq: true,
        showMe: $scope.enums.showMe.All,
        sortBy: $scope.enums.sorter.ValueHighLow
    };

    //init my plunder
    var existingPlunder = localStorage.getItem("myplunder") || "";
    var stringPlunderArray = existingPlunder.split(",");
    $scope.myPlunder = [];
    stringPlunderArray.forEach(function(stringPlunder){
      $scope.myPlunder.push(parseInt(stringPlunder));
    });

    //todo: map setting from local storage?
    $scope.showFullMap = false;
    var existingBday = localStorage.getItem("birthday");

    if(existingBday){
      $scope.dob = new Date(existingBday);
      $scope.renderMapWhenReady();
    }
  };

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

  $scope.toggleFullMap = function(){
    $scope.showFullMap = !$scope.showFullMap;
    $scope.renderMapWhenReady();
  }

  $scope.toggleInMyPlunder = function(bountyId){
    var index = $scope.myPlunder.indexOf(bountyId);

    if(index === -1){
        $scope.myPlunder.push(bountyId);
      } else{
        $scope.myPlunder.splice(index, 1);
      }

      localStorage.setItem("myplunder", $scope.myPlunder);
  }

  $scope.renderMapWhenReady = function(){
    $.getScript('https://www.google.com/jsapi', function()
    {
        google.load('maps', '3', { other_params: ['key=AIzaSyBnG2wcWi0MrBxd3wTtNCKTau-xHD_B324&libraries=places'], callback: function() {
          setTimeout(function() {
            //Google Map
            var mapContainer = $('#bountyMapContainer')[0];

            var googleMap = new google.maps.Map(mapContainer, {
              center: {lat: -37.815112, lng: 144.960909},
              zoom: 12,
              disableDefaultUI: true,
              styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#bcbbbb"},{"visibility":"on"}]}]
            });
              
            fetchBountyMarkers(googleMap);
          }, 0)
        }});
    });
  };

  $scope.clearBirthday = function(){
    $scope.dob = null;
    localStorage.removeItem("birthday");
  };

  $scope.submitBirthday = function(){
    var yearVal = $('#yearField')[0].value;
    var monthVal = $('#monthField')[0].value;
    var dayVal = $('#dayField')[0].value;

    var isValid = (!isNaN(yearVal) && !isNaN(monthVal) && !isNaN(dayVal));

    if(isValid){
      var day = parseInt(dayVal);
      var month = parseInt(monthVal) - 1; //subtract one, months begin at 00
      var year = parseInt(yearVal);

      var thisYear = new Date().getFullYear();
      var isValid = year > (thisYear - 130) && year < (thisYear + 1);

      var getDaysInMonth = function(month){
        if([1,3,5,7,8,10,12].indexOf(month) !== -1){
          return 31;
        } else if([4,6,9,11].indexOf(month) !== -1){
          return 30;
        } else{
          //feb
          var leapYear = (year % 4 === 0) && ((year % 400 === 0) || (year % 100 !== 0));
          return leapYear ? 29 : 28;
        }
      };

      isValid = month <= 12 && month> 0 && day <= getDaysInMonth(month) && day > 0;
    }

    if(isValid){
      var today = new Date();
      var thisYear =  today.getFullYear();

      var thisYearsBirthday = new Date(thisYear, month, day);

      var bdayDate = new Date((thisYear + (thisYearsBirthday < today ? 1 : 0)), month, day);

      localStorage.setItem("birthday", bdayDate);
      $scope.dob = bdayDate;
      $scope.renderMapWhenReady();
    }
  };

  $scope.getBountyByBountyId = function(bountyId){
    var requestedItem = null;
    $scope.bountyData.forEach(function(bountyItem){
      if(!requestedItem && bountyItem.bountyId === bountyId) requestedItem = bountyItem;
    });
    return requestedItem;
  }

  $scope.getPlunderValue = function(){
    var amount = 0;
    $scope.filteredBountyData().forEach(function(bountyItem){
      amount = amount + bountyItem.maxValue;
    });
    return amount;
  }

  $scope.getPlunderPeriodString = function(){
      var period = getPlunderPeriod();

      return dateToString(period.start) + ' - ' + dateToString(period.end);
  }

  $scope.toggleBountyType = function(type){
      var index = $scope.plunderOptions.includeTypes.indexOf(type);

      if(index === -1){
        $scope.plunderOptions.includeTypes.push(type);
      } else{
        $scope.plunderOptions.includeTypes.splice(index, 1);
      }

      //Update the google map markers
      $scope.bountyMarkers.forEach(function(bountyMarker){
          bountyMarker.div.hidden = $scope.plunderOptions.includeTypes.indexOf(bountyMarker.bountyItemType.id) === -1;
      });
  }

  $scope.getBountyAvailabilityMessage = function(bountyItem){
    if(bountyItem.conditions.wholeMonth){
      return 'Claim this Birthday Bounty anytime during ' + $scope.monthNames[$scope.dob.getMonth()];
    }

    var itemStart = new Date($scope.dob);
    itemStart.setDate(itemStart.getDate() - bountyItem.conditions.daysBefore);

    var itemEnd = new Date($scope.dob);
    itemEnd.setDate(itemEnd.getDate() + bountyItem.conditions.daysAfter);

    if(itemStart - itemEnd === 0){
      return 'This Birthday Bounty can only be claimed on your birthday';
    } else{
      return 'Claim this Birthday Bounty between ' + dateToString(itemStart) + ' - ' + dateToString(itemEnd);
    }
  }

  function getPlunderPeriod(){
    var bdayDate = new Date($scope.dob);
    
    //todo: take into account custom period $scope.plunderOptions.customPeriod.startDate

    var minDate = new Date(bdayDate);
    var maxDate = new Date(bdayDate);

    $scope.filteredBountyData().forEach(function(item){
        var possibleMin = new Date($scope.dob);
        possibleMin.setDate(possibleMin.getDate() - item.conditions.daysBefore);
        if(possibleMin < minDate) minDate = possibleMin;

        var possibleMax = new Date($scope.dob);
        possibleMax.setDate(possibleMax.getDate() + item.conditions.daysAfter);
        if(possibleMax > maxDate) maxDate = possibleMax;
    });

    return {
      start: minDate,
      end: maxDate
    };
  }

  function dateToString(date, noYear){
    return date.getDate() + '/' + (date.getMonth() + 1) + (noYear ? '' : '/' + date.getFullYear());
  }

  $scope.filteredBountyData = function() {
    var options = $scope.plunderOptions;
    
    var shouldPush = function(item){
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
        itemAvailable = item.conditions.daysBefore;
        itemEnd = item.conditions.daysAfter;

        if(options.dateStart && options.dateStart){

        }
        if(options.dateFinish){
          
        }


        // Eligibility rules
        if(!options.includeRegistrationReq && item.conditions.registrationRequiredUrl) return false;
        if(!options.includeIdentificationReq && item.conditions.identificationRequired) return false;
        if(!options.includeDigitalVoucherReq && item.conditions.digitalVoucherRequired) return false;
        if(!options.includePaperVoucherReq && item.conditions.paperVoucherRequired) return false;

        //Show Me
        var inPlunder = $scope.myPlunder.indexOf(item.bountyId) !== -1;
        if(inPlunder && parseInt(options.showMe) === $scope.enums.showMe.NotPlundered) return false;
        if(!inPlunder && parseInt(options.showMe) === $scope.enums.showMe.Plundered) return false;

        return true;
    };

    var filteredData = [];

    $scope.bountyData.forEach(function(bountyItem) {  
        if(shouldPush(bountyItem)) filteredData.push(bountyItem);
    });

     //Sort
      switch(parseInt(options.sortBy)){
          case $scope.enums.sorter.ValueHighLow:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return 1;
              return -1;
            });
          break;
          case $scope.enums.sorter.ValueLowHigh:
            filteredData.sort(function(b1, b2){
              if(b1.maxValue === b2.maxValue) return 0;
              if(b1.maxValue < b2.maxValue) return -1;
              return 1;
            });
          break;
          case $scope.enums.sorter.AvailEarlyLate:
          break;
          case $scope.enums.sorter.AvailLateEarly:
          break;
          case $scope.enums.sorter.OrgNameAZ:
            filteredData.sort(function(b1, b2){ return b1.organisation.name > b2.organisation.name});
          break;
          default:
          break;
      }
    
    return filteredData;
  }

  function fetchBountyMarkers(gMap){
    var placesService = new google.maps.places.PlacesService(gMap);


    var showBountyIconTooltip = function(event, bountyItem){
          var tooltip = document.createElement('div')
          tooltip.className = "bounty-marker-tooltip";
          tooltip.innerHTML += '<b>' + bountyItem.organisation.name + '</b><br/>';
          tooltip.innerHTML += bountyItem.title;

          var x = event.pageX;
          var y = event.pageY;

          tooltip.style.top = (y - 10)+ 'px';
          tooltip.style.left = (x + 15) + 'px';

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
    };

    var createBountyMarker = function(item, location, image) {
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      //Keep track of the bountyItem type //todo??
       var itemType = $.grep($scope.bountyTypes, function(type){ return type.id == item.types[0]; })[0];
      marker.bountyItemType = itemType;

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 26;
          const markerWidth = 26;

          if (!div) {
              div = marker.div = document.createElement('div');
              div.className = "bounty-marker";
              div.style.width = markerWidth + 'px';
              div.style.height = markerHeight + 'px';
              div.style.backgroundImage = 'url(' + itemType.iconPath + ')';
              div.style.backgroundSize =  markerWidth + 'px ' + markerHeight + 'px';

              div.dataset.marker_id = item.bountyId;
              
              google.maps.event.addDomListener(div, "click", function(event) {      
                  google.maps.event.trigger(marker, "click"); //todo: need this?

                  gMap.panTo(new google.maps.LatLng(location.lat, location.lng))

                  //If we haven't already loaded this place's details
                  if(!location.placeDetails){

                      //Try to load them
                      placesService.getDetails({placeId:location.placeId},function(placeResult, status){
                        if(status == "OK"){
                          //Set the place details so we have it
                          location.placeDetails = placeResult;
                        } else{
                          //No place details found
                        }

                        $scope.activeBountyItem = item;
                        $scope.$apply();
                    });
                  } else{
                    //We already have the place details
                    $scope.activeBountyItem = item;
                    $scope.$apply();
                  }
              });

              google.maps.event.addDomListener(div, "mousemove", function(event) {      
                  google.maps.event.trigger(marker, "mousemove"); //todo: need this?

                  if($scope.bountyMarkerTooltip) $scope.bountyMarkerTooltip.remove();
                  showBountyIconTooltip(event, item);
              });

              google.maps.event.addDomListener(div, "mouseout", function(event) {      
                  google.maps.event.trigger(marker, "mouseout"); //todo: need this?

                  if($scope.bountyMarkerTooltip) $scope.bountyMarkerTooltip.remove();
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

    $scope.filteredBountyData().forEach(function(item){
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

  $scope.init();

}]);