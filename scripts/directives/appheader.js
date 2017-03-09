birthdayBountyApp.directive('appheader', function() {
  return {
    scope: false,
    template: '<div class="top-navigation-bar">' +
                '<img class="flag-icon" src="images/flag.svg">' +
                '<div class="nav-right">' +
                    '<h4 class="tagline">{{ tagline }}</h4>' +
                    '<a class="standard-button" ng-click="clearBirthday()" ng-if="dob">Change Birthday</a>' +
                    '<a class="standard-button" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fbirthdaybounty.com.au%2F&amp;src=sdkpreparse">Share on Facebook</a>' +
                '</div>' +
                '<div class="logo-text">' +
                    'BIRTHDAY<br/>BOUNTY' +
                '</div>' +
            '</div>'
  }
});