app.directive('filter', function() {
  return {
    scope: false,
    template: '<div class="bounty-summary-settings">' +
                  '<h4>' +
					'Bounty Filters' +
				'</h4> ' +
				'<hr/>' +
                  '<div class="settings-label">' +
                      'Search:' +
                  '</div>' +
                  '<div class="settings-input"> ' +
                      '<input type="text" ng-model="bountyFilters.searchString" placeholder="Enter search term..." />' +
                  '</div>' +
                  '<div class="settings-label">' +
                      'Bounty Types:' +
                  '</div>' +
				'<div class="settings-input">' +
					'<div ng-repeat="bountyType in bountyTypes track by $index">' +
						'<img ng-class="{ unselected: bountyFilters.includeTypes.indexOf(bountyType.id) === -1 }" class="bounty-type-icon toggle-bounty-type-button" ng-src="{{bountyType.iconPath}}" ng-click="toggleBountyType(bountyType.id)"/>' +
					'</div>' +
				'</div>' +
                '<div class="settings-label">' +
                    'Max Value Between:' +
                '</div>' +
				'<div class="settings-input filter-value">' +
					'$<input type="number" ng-model="bountyFilters.minValue" min="0" max="1000"> and ' +
 					'$<input type="number" ng-model="bountyFilters.maxValue" min="1" max="1000">' +
					'<br/>' +
					'<input type="checkbox" ng-model="bountyFilters.showUnknownValue">Show Bounty with unknown value<br>' +
				'</div>' +
                  '<div class="settings-label">' +
                      'Available Between:' +
                  '</div>' +
				'<div class="settings-input">' +
					'<select ng-model="bountyFilters.monthStart" ng-options="shortMonth for shortMonth in getShortMonths()"></select>' +
					'<select ng-model="bountyFilters.dayStart" ng-options="shortMonth for shortMonth in getDaysInMonth(bountyFilters.monthStart)"></select>' +
					' and ' +
					'<select ng-model="bountyFilters.monthFinish" ng-options="shortMonth for shortMonth in getShortMonths()"></select>' +
					'<select ng-model="bountyFilters.dayFinish" ng-options="shortMonth for shortMonth in getDaysInMonth(bountyFilters.monthFinish)"></select>' +
				'</div>' +
                  '<div class="settings-label">' +
                      'Claim Conditions:' +
                  '</div>' +
				'<div class="settings-input">' +
					'<input type="checkbox" ng-model="bountyFilters.includeRegistrationReq">Online Registration<br>' +
					'<input type="checkbox" ng-model="bountyFilters.includeIdentificationReq">Identification Required<br>' +
					'<input type="checkbox" ng-model="bountyFilters.includeDigitalVoucherReq">Digital Voucher Required<br>' +
					'<input type="checkbox" ng-model="bountyFilters.includePaperVoucherReq">Paper Voucher Required' +
				'</div>' +
				'<div class="settings-label">' +
					'Show Me:' +
				'</div>' +
				'<div class="settings-input">' +
					'<input type="radio" ng-model="bountyFilters.showMe" value="{{enums.showMe.All}}"> All Birthday Bounty<br>' +								
					'<input type="radio" ng-model="bountyFilters.showMe" value="{{enums.showMe.NotPlundered}}"> Bounty I haven\'t plundered<br>' +
					'<input type="radio" ng-model="bountyFilters.showMe" value="{{enums.showMe.Plundered}}"> Bounty I have plundered' +
                  '</div>' +
                 '<div class="settings-label">' +
                      'Sort By:' +
                  '</div>' +
				'<div class="settings-input">' +
					'<select ng-model="bountyFilters.sortBy" ng-options="getSorterString(sorter) for sorter in enums.sorter"></select>' +
				'</div>' +
				'<div class="settings-input">' +
					'<div ng-click="resetBountyFilters()" class="reset-filters-button standard-button">' +
						'Reset All Filters' +
					'</div>' +
				'</div>' +
              '</div>'
  }
});