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
				'<div class="settings-input">' +
					'<br/>' +
					'<input type="checkbox" ng-model="bountyFilters.showUnknownValue">Show Bounty with unknown value<br>' +
				'</div>' +
                  '<div class="settings-label">' +
                      'Available Between:' +
                  '</div>' +
				'<div class="settings-input">' +
					'<input type="date" ng-model="bountyFilters.dateStart"> and  ' +
					'<input type="date" ng-model="bountyFilters.dateFinish">' +
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
					'<select ng-model="bountyFilters.sortBy">' +
						'<option value="{{enums.sorter.ValueHighLow}}">Max Value (High to Low)</option>' +
						'<option value="{{enums.sorter.ValueLowHigh}}">Max Value (Low to High)</option>' +
						'<option value="{{enums.sorter.AvailEarlyLate}}">Availability (Early to Late)</option>' +
						'<option value="{{enums.sorter.AvailLateEarly}}">Availability (Late to Early)</option>' +
						'<option selected="selected" value="{{enums.sorter.OrgNameAZ}}">Organisation Name (A-Z)</option>' +
					'</select>' +
				'</div>' +
				'<div class="settings-input">' +
					'<div ng-click="resetBountyFilters()" class="reset-filters-button standard-button">' +
						'Reset All Filters' +
					'</div>' +
				'</div>' +
              '</div>'
  }
});