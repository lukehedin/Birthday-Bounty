var birthdayBountyApp = angular.module('BirthdayBountyApp', ['ngRoute']);

birthdayBountyApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "splash.html"
    })
    .when("/bounty", {
        templateUrl: "bounty.html"
    })
    .otherwise("/", {
        redirectTo: "/"
    });
});

// BirthdayBountyFactory full of shared js data/functions
birthdayBountyApp.factory('BirthdayBountyFactory', function(){
  return {
    //Shared data
    dob: localStorage.getItem("birthday") ? new Date(localStorage.getItem("birthday")) : null,
    address: {
      lat: localStorage.getItem("addressLat"),
      lng: localStorage.getItem("addressLng"),
      placeId: localStorage.getItem("addressPlaceId")  
    },
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
    //homeScroll: 0,

    //Shared functions - these CANNOT change variables in the scope
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
    },

    getNearestLocation: function(toLocation, locations){
      var me = this;
      
      if(!locations || locations.length === 0) return;
      
      var nearestLocation;
      var distanceToNearest;

     locations.forEach(function(location){
        var distanceTo = me.getKmBetweenPlaces(toLocation.lat, toLocation.lng, location.lat, location.lng);
        if(!nearestLocation || distanceToNearest > distanceTo){
          nearestLocation = location;
          distanceToNearest = distanceTo;
        }  
      });

      return nearestLocation;
    },

    getKmBetweenPlaces: function(lat1, lng1, lat2, lng2){
      //http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
      deg2rad = function(deg) {
        return deg * (Math.PI/180)
      }

      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lng2-lng1); 
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 

      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km

      return d;
    },

    loadGoogleMapsAndPlaces: function(callbackFn){
      $.getScript('https://www.google.com/jsapi', function() {
          google.load('maps', '3', { other_params: ['key=AIzaSyBnG2wcWi0MrBxd3wTtNCKTau-xHD_B324&libraries=places'], callback: function() {
            callbackFn();
          }});
      });
    }
  };
});