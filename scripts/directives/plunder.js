app.directive('plunder', function() {
  return {
    scope: false,
    template: '<div class="bounty-summary-plunder">' +
				'<h4>' +
					'My Plunder' +
				'</h4>' +
				'<hr/>' +
                '<div ng-if="!(myPlunder && myPlunder.length > 1)">' +
                    'You haven\'t plundered any bounty yet!<br/>Click on the \'Add to My Plunder\' buttons to save bounty that you are interested in.' +
                '</div>' +
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
                          'Total Plunder Value:' +
                      '</div>' +
                      '<div class="my-plunder-item-right">' +
                          '{{ getMyPlunderTotal() | currency }}' +
                      '</div>' +
                  '</div>' +
				'<div ng-if="!myPlunder || myPlunder.length < 1">' +
					'You haven\'t plundered any Birthday Bounty yet!' +
				'</div>' +
              '</div>'
  }
});