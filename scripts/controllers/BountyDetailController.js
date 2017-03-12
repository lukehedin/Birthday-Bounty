birthdayBountyApp.controller('BountyDetailController', function($scope, BirthdayBountyFactory){
  $scope.root = BirthdayBountyFactory;

  window.scrollTo(0, 0);

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

  $scope.root.loadGoogleMapsAndPlaces(function(){
    var nearestLocation = $scope.root.getNearestLocation($scope.root.savedUserDetails.address, bountyItem);
    
    var mapContainer = document.getElementById('viewingBountyItemMap');

    var googleMap = new google.maps.Map(mapContainer, {
      center: {lat: parseFloat(nearestLocation.lat), lng: parseFloat(nearestLocation.lng)},
      zoom: 14,
      disableDefaultUI: true,
      styles: [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#bcbbbb"},{"visibility":"on"}]}]
    });

    var placesService = new google.maps.places.PlacesService(googleMap);
    placesService.getDetails({placeId:nearestLocation.placeId},function(placeResult, status){
        if(status == "OK"){
          $scope.nearestBountyPlace = placeResult; //Set the place details so we have it
          $scope.$apply();
        } else{ /*No place details found*/ }
    });
  });

  $scope.viewingBountyItem = bountyItem;
});