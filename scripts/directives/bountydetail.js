birthdayBountyApp.directive('bountydetail', function() {
  return {
    scope: false,
    template: '<div class="feature-strip">' +
                '<div class="feature-text">' +
                    '<a onclick="(function(e){ window.history.back(); })(event)" class="standard-button">' +
                        'Back to Birthday Bounty results' +
                    '</a>' +
                '</div>' +
            '</div>' +
            '<div class="content-wrapper">' +
                '<div>' +
                    '<div class="col-md-6">' +
                        '<h2>{{ viewingBountyItem.title }}</h2>' +
                        '</span>{{ viewingBountyItem.organisation.name }}</span>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<span class="bounty-feature-image" ng-style="{ \'background-image\': !!viewingBountyItem.thumbnail ? \'url(images/bountypix/\' + viewingBountyItem.thumbnail + \')\' : \'\'}">' +
                    '</div>' +
                '</div>' +
            '</div>'
  }
});