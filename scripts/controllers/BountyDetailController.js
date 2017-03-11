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