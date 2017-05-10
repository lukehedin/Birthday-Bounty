var birthdayBountyApp = angular.module('BirthdayBountyApp', ['ngRoute']);

birthdayBountyApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "splash.html"
    })
    .when("/bounty", {
        templateUrl: "bounty.html"
    })
    .when("/map", {
        templateUrl: "map.html"
    })
    .otherwise("/", {
        redirectTo: "/"
    });
});

// BirthdayBountyFactory full of shared js data/functions
birthdayBountyApp.factory('BirthdayBountyFactory', function(){
  var me = this;

  var allDetailsCached = 
    localStorage.getItem("bdayDay") &&
    localStorage.getItem("bdayMonth") &&
    localStorage.getItem("addressLat") &&
    localStorage.getItem("addressLng") &&
    localStorage.getItem("addressPlaceId");

  var savedUserDetails = null;
  if(allDetailsCached){
    savedUserDetails = {
      bdayDay: localStorage.getItem("bdayDay"),
      bdayMonth: localStorage.getItem("bdayMonth"),
      address: {
        lat: localStorage.getItem("addressLat"),
        lng: localStorage.getItem("addressLng"),
        placeId: localStorage.getItem("addressPlaceId")  
      }
    };
  }

  //return factory scope
  return {
    //Shared data
    savedUserDetails: savedUserDetails,
    nearestLocationLookup: {}, // this is filled as we load locations, formatted { bountyId: nearestPlaceId}
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
    sorters: {
      ValueHighLow: 1,
      ValueLowHigh: 2,
      AvailEarlyLate: 3,
      AvailLateEarly: 4,
      OrgNameAZ: 5,
      CloseBy: 6
    },
    filters: {
      searchString: null,
      includeTypes: [1,2,3,4,5,6],
      availableMonth: localStorage.getItem("bdayMonth"),
      availableDay: parseInt(localStorage.getItem("bdayDay")),
      sortBy: 6
    },
    myPlunder: [],
    //homeScroll: 0,

    //Shared functions - these CANNOT change variables in the scope
    getShortMonths: function(){
      return moment.monthsShort();
    },

    getDaysInMonth: function(shortMonth){
      if(!shortMonth) shortMonth = "Jan";
      var days = moment(shortMonth, 'MMM').daysInMonth();
      var daysArray = [];
      for(var i = 1; i <= days; i++) daysArray.push(i);
      return daysArray;
    },

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

    getItemAvailablePeriod: function(item){
      var me = this;

      var now = new Date();
      var thisYear = new Date().getFullYear();

      var savedMonth = moment(me.savedUserDetails.bdayMonth, 'MMM').month();
      var bdayDate = new Date(thisYear, savedMonth, me.savedUserDetails.bdayDay);

      if(now > bdayDate) bdayDate.setFullYear(thisYear + 1);

      moment(me.savedUserDetails.bdayMonth, 'MMM')
      
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
    },

    getLocationByPlaceId: function(placeId, bountyItem){
      var me = this;
      var place = null;

      bountyItem.organisation.locations.forEach(function(location){
        if(location.placeId === placeId) place = location;
      });

      return place;
    },

    getNearestLocation: function(toLocation, bountyItem){
      var me = this;
      
      //Check if we already have this bounty item's nearest location in the lookup
      if(me.nearestLocationLookup[bountyItem.bountyId]) return me.nearestLocationLookup[bountyItem.bountyId];

      //If not, calculate it
      var locations = bountyItem.organisation.locations;

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

      //Add it to the lookup for next time
      me.nearestLocationLookup[bountyItem.bountyId] = nearestLocation;
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

    //Function to get query params
    getUrlParamByName: function(name) {
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(window.location.href);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
  
    mapStyle: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#bcbbbb"},{"visibility":"on"}]}],

    loadGoogleMapsAndPlaces: function(callbackFn){
      $.getScript('https://www.google.com/jsapi', function() {
          google.load('maps', '3', { other_params: ['key=AIzaSyBnG2wcWi0MrBxd3wTtNCKTau-xHD_B324&libraries=places'], callback: function() {
            callbackFn();
          }});
      });
    },

    //Tooltips
    typeTip: null,
    tipTimeout: null,
    hideTypeTip: function(){
      var me = this;
      if(me.typeTip){
        me.typeTip.remove();
        me.typeTip = null;
      }
    },
    getTypeTip: function(hoverEvent, typeId, delay){
      var me = this;
      var type = me.getTypeById(typeId);

      if(type){
        if(!me.typeTip) {
          me.typeTip = document.createElement('div');
          document.body.append(me.typeTip);     
        }

        me.typeTip.className = "bounty-marker-tooltip";
        me.typeTip.innerHTML = "";
        me.typeTip.innerHTML += '<b>' + type.name + '</b>';
        me.typeTip.style.visibility = 'hidden'

        var targetRect = event.currentTarget.getBoundingClientRect();
        me.typeTip.style.top = event.currentTarget.y + targetRect.height + 4;
        me.typeTip.style.left = event.currentTarget.x - (targetRect.width / 2);

        var show = function(){
          if(me.typeTip) me.typeTip.style.visibility = 'visible';
        };

        (delay ? window.setTimeout(show, delay) : show());
      }
    },

    clearBirthday: function(){
      me.savedUserDetails = null;

      localStorage.removeItem("addressLat");
      localStorage.removeItem("addressLng");
      localStorage.removeItem("addressPlaceId");
      localStorage.removeItem("bdayDay");
      localStorage.removeItem("bdayMonth");

      window.location = './';
    }
  };
});