var birthdayBountyApp = angular.module('BirthdayBountyApp', ['ngRoute']);

//Routes
birthdayBountyApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "splash.html"
    })
    .when("/bounty", {
        templateUrl: "bounty.html"
    })
    .when("/summary", {
        templateUrl: "summary.html"
    })
    .when("/map", {
        templateUrl: "map.html"
    })
    .when("/faq", {
        templateUrl: "faq.html"
    })
    .when("/privacy", {
        templateUrl: "privacy.html"
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
    localStorage.getItem("addressPlaceId") &&
    localStorage.getItem("addressFormatted");

  var savedUserDetails = null;
  if(allDetailsCached){
    savedUserDetails = {
      bdayDay: localStorage.getItem("bdayDay"),
      bdayMonth: localStorage.getItem("bdayMonth"),
      address: {
        formatted: localStorage.getItem("addressFormatted"),
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
    filteredData: bountyData.slice(), //initially copy data to filteredData
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

    getSorterString: function(sorter){
      var me = this;

      switch(sorter){
        case me.sorters.ValueHighLow: return "Max Value (High to Low)";
        case me.sorters.ValueLowHigh: return "Max Value (Low to High)";
        case me.sorters.AvailEarlyLate: return "Availability (Early to Late)";
        case me.sorters.AvailLateEarly: return "Availability (Late to Early)";
        case me.sorters.OrgNameAZ: return "Organisation Name (A-Z)";
        case me.sorters.CloseBy: return "Nearest to Me";
      }
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

    //Filtering Stuff
    filterBountyData: function() {
      var me = this;

      //Should we add this item to the filtered list?
      var shouldPush = function(item) {
          //Included types
          if (me.filters.includeTypes.indexOf(item.types[0]) === -1) return false;

          //Availability
          if(me.filters.availableMonth && me.filters.availableDay){
            var now = new Date();
            var thisYear = new Date().getFullYear();

            var filterDate = new Date(thisYear, moment(me.filters.availableMonth, 'MMM').month(), me.filters.availableDay);
            if(now > filterDate) filterDate.setFullYear(thisYear + 1);

            var itemAvail = me.getItemAvailablePeriod(item);

            if((itemAvail.start < filterDate && itemAvail.finish < filterDate)) return false;
            if((itemAvail.start > filterDate && itemAvail.finish > filterDate)) return false;
          }

          return true;
      };

      var filteredData = [];

      me.bountyData.forEach(function(bountyItem) {  
          if(shouldPush(bountyItem)) filteredData.push(bountyItem);
      });

      var sortBy = !me.savedUserDetails 
        ? me.sorters.ValueHighLow
        : parseInt(me.filters.sortBy);

        //Sort
      switch(sortBy){
        case me.sorters.ValueHighLow:
          filteredData.sort(function(b1, b2){
            if(b1.maxValue === b2.maxValue) return 0;
            if(b1.maxValue < b2.maxValue) return 1;
            return -1;
           });
        break;
        case me.sorters.ValueLowHigh:
          filteredData.sort(function(b1, b2){
            if(b1.maxValue === b2.maxValue) return 0;
            if(b1.maxValue < b2.maxValue) return -1;
            return 1;
          });
        break;
        case me.sorters.AvailEarlyLate:
          filteredData.sort(function(b1, b2){
            var b1Period = me.getItemAvailablePeriod(b1);
            var b2Period = me.getItemAvailablePeriod(b2);

            if(b1Period.start > b2Period.start) return 1;
            if(b1Period.start < b2Period.start) return -1;
            return 0;
          });
        break;
        case me.sorters.AvailLateEarly:
          filteredData.sort(function(b1, b2){
            var b1Period = me.getItemAvailablePeriod(b1);
            var b2Period = me.getItemAvailablePeriod(b2);

            if(b1Period.finish > b2Period.finish) return -1;
            if(b1Period.finish < b2Period.finish) return 1;
            return 0;
          });
        break;
        case me.sorters.OrgNameAZ:
          filteredData.sort(function(b1, b2){
            if(b1.organisation.name > b2.organisation.name) return 1;
            if(b1.organisation.name < b2.organisation.name) return -1;
            return 0;
          });
        break;
        case me.sorters.CloseBy:
          filteredData.sort(function(b1, b2){
            var b1ClosestLoc = me.getNearestLocation(b1);
            var b2ClosestLoc = me.getNearestLocation(b2);

            var b1Distance = me.getKmBetweenPlaces(me.savedUserDetails.address.lat, me.savedUserDetails.address.lng, b1ClosestLoc.lat, b1ClosestLoc.lng);
            var b2Distance = me.getKmBetweenPlaces(me.savedUserDetails.address.lat, me.savedUserDetails.address.lng, b2ClosestLoc.lat, b2ClosestLoc.lng);

            if(b1Distance > b2Distance) return 1;
            if(b1Distance < b2Distance) return -1;
            return 0;
          });
        default:
        break;
      }

      me.filteredData = filteredData;
      me.toggleMapMarkers();
    },

    toggleBountyType: function(type){
      var me = this;

      var index = me.filters.includeTypes.indexOf(type);
      index === -1
        ? me.filters.includeTypes.push(type)
        : me.filters.includeTypes.splice(index, 1);

      me.filterBountyData();
    },

    toggleMapMarkers: function(){
      var me = this;

      var filteredBountyIds = me.filteredData.map(function(item){ return item.bountyId});

      $('div.bounty-marker').each(function(idx, markerEl){
        var bountyIdAttr = markerEl.getAttribute('data-bounty-id');
        if(bountyIdAttr && !isNaN(parseInt(bountyIdAttr))){
          var bountyId = parseInt(bountyIdAttr);
          markerEl.hidden = filteredBountyIds.indexOf(bountyId) === -1;
        }
      })
    },

    //Location Stuff
    getLocationByPlaceId: function(placeId, bountyItem){
      var me = this;
      var place = null;

      bountyItem.organisation.locations.forEach(function(location){
        if(location.placeId === placeId) place = location;
      });

      return place;
    },

    getFormattedAddress: function(){
      var me = this;
      return me.savedUserDetails.address.formatted;
    },

    getNearestLocation: function(bountyItem){
      var me = this;
      
      //Check if we already have this bounty item's nearest location in the lookup. If not, find it
      return (me.nearestLocationLookup[bountyItem.bountyId])
          ? me.nearestLocationLookup[bountyItem.bountyId].location
          : me.findNearestLocation(bountyItem).location;
    },

    getDistanceToNearestLocation: function(bountyItem){
      var me = this;
      
      //Check if we already have this bounty item's nearest location in the lookup. If not, find it
      return (me.nearestLocationLookup[bountyItem.bountyId])
          ? me.nearestLocationLookup[bountyItem.bountyId].distance
          : me.findNearestLocation(bountyItem).distance;
    }, 

    findNearestLocation: function(bountyItem){
      var me = this;

      var locations = bountyItem.organisation.locations;
      if(!locations || locations.length === 0) return {};
      
      var nearestLocation;
      var distanceToNearest;

     locations.forEach(function(location){
        var distanceTo = me.getKmBetweenPlaces(me.savedUserDetails.address.lat, me.savedUserDetails.address.lng, location.lat, location.lng);
        if(!nearestLocation || distanceToNearest > distanceTo){
          nearestLocation = location;
          distanceToNearest = distanceTo;
        }
      });

      //Add it to the lookup for next time
      me.nearestLocationLookup[bountyItem.bountyId] = { 
        location: nearestLocation,
        distance: distanceToNearest
      };

      return me.nearestLocationLookup[bountyItem.bountyId];
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
    tip: null,
    tipTimeout: null,
    hideTip: function(){
      var me = this;
      if(me.tip){
        me.tip.remove();
        me.tip = null;
      }
    },
    getTip: function(hoverEvent, delay, tipTitle, tipContent, dontHide){
      var me = this;

      //Add a listener to remove the tip from the el on mouseout
      hoverEvent.target.onmouseout = dontHide 
        ? null
        : function(){me.hideTip()};

      if(!me.tip) {
        me.tip = document.createElement('div');
        document.body.append(me.tip);     
      }

      me.tip.className = "bounty-marker-tooltip";
      me.tip.innerHTML = "";
      if(tipTitle) me.tip.innerHTML += '<b>' + tipTitle + '</b><br/>';
      if(tipContent) me.tip.innerHTML += tipContent;
      me.tip.style.visibility = 'hidden'

      var targetRect = hoverEvent.currentTarget.getBoundingClientRect();
      me.tip.style.top = targetRect.top + window.scrollY + targetRect.height;
      me.tip.style.left = targetRect.left + window.scrollX - (targetRect.width / 2);

      //Clicking anything on the tip hides it
      me.tip.onclick = function(){me.hideTip()};

      var show = function(){
        if(me.tip) me.tip.style.visibility = 'visible';
      };

      (delay ? window.setTimeout(show, delay) : show());
      
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