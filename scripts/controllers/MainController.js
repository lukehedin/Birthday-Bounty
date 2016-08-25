app.controller('MainController', ['$scope', function($scope) {

  $scope.init = function(){
    var existingBday = localStorage.getItem("birthday");

    if(existingBday){
      $scope.dob = existingBday;
      $scope.renderMapWhenReady();
    }

    //init options
    $scope.plunderOptions = {
        excludeTypes: [],
        excludeConditions: [],
        customPeriod: null
    };

    createData();
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
              zoom: 10,
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
      var month = parseInt(monthVal);
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
      var bdayDate = new Date(year, month, day);

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

  $scope.toggleBountyType = function(type){
      var index = $scope.plunderOptions.excludeTypes.indexOf(type);

      if(index === -1){
        $scope.plunderOptions.excludeTypes.push(type);
      } else{
        $scope.plunderOptions.excludeTypes.splice(index, 1);
      }
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

    var createBountyMarker = function(item, latLong, image){
      var marker = new google.maps.OverlayView();

      // Explicitly call setMap on this overlay.
      marker.setMap(gMap);

      marker.draw = function() {
          var div = marker.div;
          const markerHeight = 34;
          const markerWidth = 34;

          if (!div) {
              div = marker.div = document.createElement('div');
              div.className = "bounty-marker";
              div.style.width = markerWidth + 'px';
              div.style.height = markerHeight + 'px';
              
              var itemType = $.grep($scope.bountyTypes, function(type){ return type.id == item.types[0]; });

              div.style.backgroundImage = 'url(' + itemType[0].iconPath + ')';
              div.style.backgroundSize =  markerWidth + 'px ' + markerHeight + 'px';
              div.style.backgroundRepeat = 'no-repeat';

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
              
              var panes = marker.getPanes();
              panes.overlayImage.appendChild(div);
          }
          
          var point = marker.getProjection().fromLatLngToDivPixel(latLong);
          
          if (point) {
              div.style.left = (point.x - (markerWidth/2)) + 'px';
              div.style.top = (point.y - markerHeight) + 'px';
          }
      };
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

  function createData(){
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

      $scope.bountyData = [{
        "bountyId": 1,
        "title": "Birthday Voucher",
        "maxValue": 50.00,
        "types": [5, 1, 2], 
        "sponsored": false,
        "additionalDetails": null,
        "conditions": {
            "daysBefore": 0,
            "daysAfter": 30,
            "withPurchaseAmount": null,
            "withPurchaseNotes": null,
            "registrationRequiredUrl": "http://highlanderbar.squarespace.com/",
            "minimumRegistrationDays": null,
            "identificationRequired": null,
            "digitalVoucherRequired": null,
            "paperVoucherRequired": null,
            "notes": [
                "You will receive a welcome email after you sign up with directions on how to fill in the rest of your details (like your DOB). It may take a few days."
                ]
        },
        "organisation": {
            "name": "Highlander Bar",
            "social": {
                "facebook": "https://www.facebook.com/highlanderbar",
                "twitter": "http://www.twitter.com/highlanderbar",
                "instagram": "http://www.instagram.com/highlanderbar"
            },
            "locations": [{
                "lat": -37.819686,
                "lng": 144.95798,
                "placeId": "ChIJQ3X7gE1d1moRnuWF2ow_NeU"
            }]
        }
    }, {
        "bountyId": 2,
        "title": "Any Main Meal",
        "maxValue": 39.90,
        "types": [2], 
        "sponsored": false,
        "additionalDetails": "Groups of 6 or more will also recieve a FREE birthday cake!",
        "conditions": {
            "daysBefore": 0,
            "daysAfter": 0,
            "withPurchaseAmount": null,
            "withPurchaseNotes": null,
            "registrationRequiredUrl": "http://pacinos.us4.list-manage1.com/subscribe?u=a19d4b47540c52eff4d4bc646&id=7979b2e38e",
            "minimumRegistrationDays": 15,
            "identificationRequired": null,
            "digitalVoucherRequired": null,
            "paperVoucherRequired": true,
            "notes": [
                "Voucher will be sent to your email address 2 weeks prior to your birthday.",
                "Bookings are essential, for booking of 6+ please provide 48 hours notice and mention you are a member of the Birthday Club."
            ]
        },
        "organisation": {
            "name": "Pacinos",
            "social": {
                "facebook": "https://www.facebook.com/pacinositalianrestaurant?fref=ts",
                "twitter": "https://twitter.com/PacinosCafeBar",
                "instagram": null
            },
            "locations": [{
                "lat": -37.782739,
                "lng": 144.9142873,
                "placeId": "ChIJBTKxi6ld1moRgl2vO34Bq3E"
            }]
        }
    }, {
        "bountyId": 3,
        "title": "Free Boost Juice",
        "maxValue": 13.00,
        "types": [2], 
        "sponsored": false,
        "additionalDetails": null,
        "conditions": {
            "daysBefore": 0,
            "daysAfter": 0,
            "withPurchaseAmount": null,
            "withPurchaseNotes": null,
            "registrationRequiredUrl": "http://www.boostjuice.com.au/vibe",
            "minimumRegistrationDays": null,
            "identificationRequired": true,
            "digitalVoucherRequired": null,
            "paperVoucherRequired": null,
            "notes": [
                "You will need to pick up a VIBE club card from a Boost store and activate the card using the registration URL provided. This card will be used to get your free juice."
            ]
        },
        "organisation": {
            "name": "Boost Juice",
            "social": {
                "facebook": "https://www.facebook.com/boostjuice",
                "twitter": "https://twitter.com/boostjuiceoz",
                "instagram": "https://www.instagram.com/boost_juice/"
            },
            "locations": [{
                "lat":-37.815269,
                "lng":144.963501,
                "placeId": "ChIJXWcx5LRC1moRt7HPotq-S-4"
            }, {  
                "lat":-37.813698,
                "lng":144.966019,
                "placeId": "ChIJa6vT-bVC1moRQTSQrF8iKWo"
            }, { 
                "lat":-37.813084,
                "lng":144.967941,
                "placeId": "ChIJu71A8iVo1moRLA6V0RCQb_Q"
            }, {  
                "lat":-37.820538,
                "lng":144.965729,
                "placeId": "ChIJgZOibbFC1moRLXw7M5slgyU"
            }, {  
                "lat":-37.808388,
                "lng":144.964706,
                "placeId": "ChIJ-xt8vzRd1moRAQXdrv9zSOM"
            }, {
                "lat":-37.799000,
                "lng":144.967499,
                "placeId": "ChIJ_zMQvdZC1moRE-7lkW9eqjQ"
            }, {
                "lat":-37.817066,
                "lng":144.941910,
                "placeId": "ChIJaTce4Gdd1moRpZQCe0ynrig"
            }, {
                "lat":-37.818195,
                "lng":144.993729,
                "placeId:": "ChIJY5qKBu5C1moRvkJeY1qdW7M"
            }, {
                "lat":-37.838444,
                "lng":144.941544,
                "placeId": "ChIJc9FscOxn1moRZYvOR18q494"
            }, {  
                "lat":-37.842743,
                "lng":144.996201,
                "placeId": "ChIJX11rJiho1moRQhvY2dkPBcw"
            }, {  
                "lat":-37.820160,
                "lng":145.035858,
                "placeId": "ChIJ561o5DJC1moRKb-SLi1BaHY"
            }, {  
                "lat":-37.862976,
                "lng":145.027130,
                "placeId": "ChIJMeFoHehp1moRdvyHsll-m6U"
            }, {  
                "lat":-37.773376,
                "lng":144.889069,
                "placeId": "ChIJiz5UY85d1moRb9roPoLy3uI"
            }, {
                "lat":-37.831013,
                "lng":145.056931,
                "placeId": "ChIJmyv6b4RB1moRasq7ZjHRhL4"
            }, {
                "lat":-37.885147,
                "lng":145.081299,
                "placeId": "ChIJg_bqi8Rq1moRbQrEmonuff0"
            }, {
                "lat":-37.714539,
                "lng":144.885422,
                "placeId": "ChIJU9HSTOhb1moR9CbjXefCcSQ"
            }, {  
                "lat":-37.788727,
                "lng":145.123581,
                "placeId": "ChIJ9VgV7G9H1moREQTyYTPWzVo"
            }, {  
                "lat":-37.680164,
                "lng":144.919418,
                "placeId": "ChIJnwXZUvVa1moROsTipdoj-MU"
            }, {  
                "lat":-37.702194,
                "lng":145.102005,
                "placeId": "ChIJS6s1FltI1moRiWy8_JoJnac"
            }, {  
                "lat":-37.910748,
                "lng":145.133286,
                "placeId": "ChIJ64DH7ctq1moRE7Y1AAaT33s"
            }, {  
                "lat":-37.655212,
                "lng":145.017197,
                "placeId": "ChIJ04SBM-pO1moRrVEBE7W4320"
            }, {  
                "lat":-37.669010,
                "lng":144.841034,
                "placeId": "ChIJVVVVVflY1moRExTmCoh0jEA"
            }, {  
                "lat":-37.969082,
                "lng":145.087250,
                "placeId": "ChIJ54N_MVxs1moRk-sdss4xCOs"
            }, {
                "lat":-37.746468,
                "lng":144.735809,
                "placeId": "ChIJXxu0uB311moR5vGOXvFrUVw"
            }, {
                "lat":-37.866852,
                "lng":145.220398,
                "placeId": "ChIJIyMjchY81moRMO8y-FmJ02U"
            }, {
                "lat":-37.812771,
                "lng":145.229370,
                "placeId": "ChIJ8X_94_TfbaoRGDsy06vgTco"
            }, {
                "lat":-37.597767,
                "lng":144.931503,
                "placeId": "ChIJz_X7GH9R1moRA0zq343NQ6g"
            }, { 
                "lat":-37.873531,
                "lng":144.680923,
                "placeId": "ChIJCT3quFyP1moRmUNCmjFL1_U"
            }, {  
                "lat":-37.986626,
                "lng":145.216949,
                "placeId": "ChIJ31PyLwQU1moR_V3zdacm23A"
            }, {  
                "lat":-37.758041,
                "lng":145.312408,
                "placeId": "ChIJfcEsDNYx1moReG-oGKr_oQo"
            }]
        }
    }];
  };

  $scope.init();

}]);