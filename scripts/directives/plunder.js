app.directive('plunder', function() {
  return {
    scope: false,
    template: '<div class="bounty-summary-plunder">' +
				'<h4>' +
					'My Bounty Plunder' +
				'</h4>' +
				'<hr/>' +
				'<div ng-if="myPlunder && myPlunder.length > 1" ng-repeat="plunderBounty in getMyPlunder() track by $index">' +
					'<div class="my-plunder-item">' +
                          '<div class="my-plunder-item-left">' +
                              '<b>{{ plunderBounty.organisation.name }}</b>' +
						    '<br/>' +
						    '{{ plunderBounty.title }}' +
                              '<br/>' +
                          '</div>' +
                          '<div class="my-plunder-item-right">' +
                              '{{ plunderBounty.maxValue | currency }}' +
                          '</div>' +
					'</div>' +
				'</div>' +
                  '<div class="my-plunder-item">' +
                     '<div class="my-plunder-item-left plunder-total">' +
                          'Total Value:' +
                      '</div>' +
                      '<div class="my-plunder-item-right">' +
                          '{{  }}' +
                      '</div>' +
                  '</div>' +
				'<div ng-if="!myPlunder || myPlunder.length < 1">' +
					'You haven\'t plundered any Birthday Bounty yet!' +
				'</div>' +
              '</div>'
  }
});