app.controller('MainController', ['$scope', function($scope) {

  $scope.init = function(){

    //Load required static data
    $scope.bountyData = bountyData;
    $scope.bountyTypes = [{ 
        id: 1,
        iconPath: 'images/marker_gift.svg',
        name: 'gift'
      }, { 
        id: 2,
        iconPath: 'images/marker_food.svg',
        name: 'food'
      }, { 
        id: 3,
        iconPath: 'images/marker_drink.svg',
        name: 'drink'
      }, { 
        id: 4,
        iconPath: 'images/marker_activity.svg',
        name: 'activity'
      }, { 
        id: 5,
        iconPath: 'images/marker_voucher.svg',
        name: 'voucher'
    }];

    //init scope vars
    $scope.bountyMarkers = [];
    $scope.bountyMarkerTooltip = null;
    //init options
    $scope.plunderOptions = {
        excludeTypes: [],
        excludeConditions: [],
        customPeriod: null
    };

    var existingBday = localStorage.getItem("birthday");

    if(existingBday){
      $scope.dob = existingBday;
      $scope.renderMapWhenReady();
    }
  };

  $scope.dobFieldChange = function(fld){
    var fldVal = $('#' + fld + 'Field')[0].value;

    switch(fld){
      case "day":
        if(fldVal && fldVal.length === 2) $('#monthField').focus();
        break;
      case "month":
        if(fldVal && fldVal.length === 2) $('#yearField').focus();
        break;
      default:
        break;
    }
  };

  $scope.renderMapWhenReady = function(){
    $.getScript('https://www.google.com/jsapi', function()
    {
        google.load('maps', '3', { other_params: ['sensor=false&key=AIzaSyBnG2wcWi0MrBxd3wTtNCKTau-xHD_B324&libraries=places'], callback: function() {
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

  $scope.getPlunderPrice = function(){
    var amount = 0;
    getFilteredBountyData().forEach(function(bountyItem){
      amount = amount + bountyItem.maxValue;
    });
    return amount;
  }

  $scope.getPlunderPeriodString = function(){
      var period = getPlunderPeriod();

      return dateToString(period.start) + ' - ' + dateToString(period.end);
  }

  $scope.toggleBountyType = function(type){
      var index = $scope.plunderOptions.excludeTypes.indexOf(type);

      if(index === -1){
        $scope.plunderOptions.excludeTypes.push(type);
      } else{
        $scope.plunderOptions.excludeTypes.splice(index, 1);
      }

      //Update the google map markers
      $scope.bountyMarkers.forEach(function(bountyMarker){
          bountyMarker.div.hidden = $scope.plunderOptions.excludeTypes.indexOf(bountyMarker.bountyItemType.id) !== -1;
      });
  }

  $scope.getBountyAvailabilityMessage = function(){
    var bdayDate = new Date($scope.dob);

    var itemStart = new Date($scope.dob);
    itemStart.setDate(itemStart.getDate() - $scope.activeBountyItem.conditions.daysBefore);

    var itemEnd = new Date($scope.dob);
    itemEnd.setDate(itemEnd.getDate() + $scope.activeBountyItem.conditions.daysAfter);

    if(itemStart - itemEnd === 0){
      return '1. This Birthday Bounty can only be claimed on your birthday!'
    } else{
      return '1. Claim this Birthday Bounty between ' + dateToString(itemStart) + ' - ' + dateToString(itemEnd);
    }
  }

  $scope.getTimelineSectionWidth = function(section){
    var percentageAvailable = (section === 'allBefore' || section === 'allAfter')
      ? 94
      : 100;

    var daysToThis = 0; //days for this section in my space (eg. end = this, after = that)
    var daysToThat = 0; //days for the other section in my space (eg. before = this, start = that)

    var bdayDate = new Date($scope.dob);

    var period = getPlunderPeriod();

    var itemStart = new Date($scope.dob);
    itemStart.setDate(itemStart.getDate() - $scope.activeBountyItem.conditions.daysBefore);

    var itemEnd = new Date($scope.dob);
    itemEnd.setDate(itemEnd.getDate() + $scope.activeBountyItem.conditions.daysAfter);

    switch(section){
      case 'before':
        daysToThat = Math.abs(bdayDate.getTime() - itemStart.getTime());
        daysToThis = Math.abs(itemStart.getTime() - period.start.getTime());
      break;
      case 'start':
        daysToThat = Math.abs(itemStart.getTime() - period.start.getTime());
        daysToThis = Math.abs(bdayDate.getTime() - itemStart.getTime());
      break;
      case 'end':
        daysToThis = Math.abs(itemEnd.getTime() - bdayDate.getTime());
        daysToThat = Math.abs(period.end.getTime() - itemEnd.getTime());
      break;
      case 'after':
        daysToThat = Math.abs(itemEnd.getTime() - bdayDate.getTime());
        daysToThis = Math.abs(period.end.getTime() - itemEnd.getTime());
      break;
      case 'allBefore':
        daysToThat = Math.abs(period.end.getTime() - bdayDate.getTime());
        daysToThis = Math.abs(bdayDate.getTime() - period.start.getTime());
      break;
      case 'allAfter':
        daysToThat = Math.abs(bdayDate.getTime() - period.start.getTime());
        daysToThis = Math.abs(period.end.getTime() - bdayDate.getTime());
      break;
    }

    daysToThat = Math.ceil(daysToThat / (1000 * 3600 * 24)); 
    daysToThis = Math.ceil(daysToThis / (1000 * 3600 * 24)); 

    if(daysToThis === 0) return 0;
    if(daysToThat === 0) return percentageAvailable + '%';

    debugger;

    return daysToThis === 0 ? 0 : (Math.floor((daysToThis / (daysToThat + daysToThis)) * percentageAvailable) + '%'); //w00t!
  }

  function  getPlunderPeriod(){
    var bountyData = getFilteredBountyData();
    var bdayDate = new Date($scope.dob);
    
    //todo: take into account custom period $scope.plunderOptions.customPeriod.startDate

    var minDate = new Date(bdayDate);
    var maxDate = new Date(bdayDate);

    bountyData.forEach(function(item){
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

  function getFilteredBountyData(){
    var filteredData = [];
    var filters = $scope.plunderOptions;

    $scope.bountyData.forEach(function(bountyItem){
        if(filters.excludeTypes.indexOf(bountyItem.types[0]) === -1){
          filteredData.push(bountyItem);
        }
    });

    return filteredData;
  }

  function fetchBountyMarkers(gMap){
    var placesService = new google.maps.places.PlacesService(gMap);


    var showBountyIconTooltip = function(event, bountyItem){
          var tooltip = document.createElement('div')
          tooltip.className = "bounty-marker-tooltip";
          tooltip.innerHTML = '<h5>' + bountyItem.title + '</h5>';

          var x = event.pageX;
          var y = event.pageY;

          tooltip.style.top = (y - 10)+ 'px';
          tooltip.style.left = (x + 15) + 'px';

          $scope.bountyMarkerTooltip = tooltip;
          $(document.body).append($scope.bountyMarkerTooltip);     
    };

    var createBountyMarker = function(item, latLong, image) {
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      //Keep track of the bountyItem type //todo??
       var itemType = $.grep($scope.bountyTypes, function(type){ return type.id == item.types[0]; })[0];
      marker.bountyItemType = itemType;

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 34;
          const markerWidth = 34;

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

                  //TODO: Change to closest location to postcode
                  var closestLoc = item.organisation.locations[0];

                  //If we haven't already loaded this place's details
                  if(!closestLoc.placeDetails){

                      //Try to load them
                      placesService.getDetails({placeId:closestLoc.placeId},function(placeResult, status){
                        if(status == "OK"){
                          //Set the place details so we have it
                          closestLoc.placeDetails = placeResult;
                          debugger;
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
          
          var point = marker.getProjection().fromLatLngToDivPixel(latLong);
          
          if (point) {
              div.style.left = (point.x - (markerWidth/2)) + 'px';
              div.style.top = (point.y - markerHeight) + 'px';
          }
      };

      $scope.bountyMarkers.push(marker);
    }

    getFilteredBountyData().forEach(function(item){
        //todo this should be the location of the closest branch to the postcode
        var closestLoc = item.organisation.locations[0];
        var closestLocLatLng = new google.maps.LatLng(closestLoc.lat, closestLoc.lng);

        var marker = new google.maps.Marker({
            position: closestLocLatLng,
            title: item.title,
            map: gMap,
            icon: '/'
        });
        
        marker.metadata = {type: "point", id: item.bountyId};
        createBountyMarker(item, closestLocLatLng, null);
    });
  };

  $scope.init();

}]);