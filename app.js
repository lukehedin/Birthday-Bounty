var birthdayBountyApp = angular.module('BirthdayBountyApp', ['ngRoute']);

birthdayBountyApp.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "home.html"
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
    //homeScroll: 0,

    //Shared functions
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