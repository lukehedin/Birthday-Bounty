app.directive('summary', function() {
  return {
    scope: false,
    template: '<div class="bounty-summary-items-container">' +
				'<hr/>' +
				'<div ng-if="filteredBountyData().length < 1" class="no-bounty-message">' +
					'Could not find any Birthday Bounty! Try to adjust your filters using the Bounty Filters on the left.' +
				'</div>' +
                '<div ng-if="!!filteredBountyData()" ng-repeat="bountyItem in filteredPagedBountyData() track by $index">' +
                    '<div class="bounty-summary-row">' +
                        '<div class="bounty-item-header">' +
                            '<div class="bounty-item-org-name">' +
                                '{{ bountyItem.organisation.name }}' +
                            '</div>' +
                            '<div class="standard-button toggle-plunder-button" ng-click="toggleInMyPlunder(bountyItem.bountyId)">' +
								'{{ myPlunder.indexOf(bountyItem.bountyId) === -1 ? "Add to My Plunder" : "Remove from My Plunder" }}' +
							'</div>' +
                            '<div class="bounty-item-org-social">' +
                                '<a ng-if="bountyItem.organisation.social.facebook" target="_blank" ng-href="{{bountyItem.organisation.social.facebook}}">' +
                                    '<img class="social-button" src="images/facebook.svg" />' +
                                '</a>' +
                                '<a ng-if="bountyItem.organisation.social.twitter" target="_blank" ng-href="{{bountyItem.organisation.social.twitter}}">' +
                                    '<img class="social-button" src="images/twitter.svg" />' +
                                '</a>' +
                                '<a ng-if="bountyItem.organisation.social.instagram" target="_blank" ng-href="{{bountyItem.organisation.social.instagram}}">' +
                                    '<img class="social-button" src="images/instagram.svg" />' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
						'<div class="bounty-item-left-details">' +
							'<h3>' +
								'{{ bountyItem.title }}' +
							'</h3>' +
                            '<h6>' +
								'{{ bountyItem.additionalDetails }}' +
							'</h6>' +
							'<div>' +
								'<b>{{ getBountyAvailabilityMessage(bountyItem) }}</b>' +
							'</div>' +
						'</div>' +
 						'<div class="bounty-item-right-details">' +
							'<h3>' +
								'{{ bountyItem.maxValue | currency }}' +
							'</h3>' +
                            '<div class="bounty-types" ng-repeat="typeId in bountyItem.types.slice().reverse() track by $index">' +
								'<div ng-if="plunderOptions.includeTypes.indexOf(typeId) !== -1">' +
                                    '<img class="bounty-type-icon" ng-src="{{getTypeById(typeId).iconPath}}"/>' +
								'</div>' +
							'</div>' +
 						'</div>' +
                        '<div class="condition-list">' +
							'<hr/>' +
                            '<div ng-if="bountyItem.conditions.registrationRequiredUrl" class="ng-scope">' +
                                '<img class="condition-icon" src="images/registrationurl.svg">' +
                                '<a target="_blank" ng-href="{{bountyItem.conditions.registrationRequiredUrl}}">Sign up here</a>' +
                            '</div>' +
                            '<div ng-if="bountyItem.conditions.identificationRequired" class="ng-scope">' +
                                '<img class="condition-icon" src="images/idrequired.svg">' +
                                'Provide ID to verify your date of birth' +
                            '</div>' +
                            '<div ng-if="bountyItem.conditions.digitalVoucherRequired" class="ng-scope">' +
                                '<img class="condition-icon" src="images/digitalvoucher.svg">' +
                                'Present a digital voucher on a phone or tablet' +
                            '</div>' +
                            '<div ng-if="bountyItem.conditions.paperVoucherRequired" class="ng-scope">' +
                                '<img class="condition-icon" src="images/papervoucher.svg">' +
                                'Print off and present a paper voucher' +
                            '</div>' +
                            '<div ng-if="bountyItem.conditions.notes && bountyItem.conditions.notes.length > 0">' +
                                '<b>Notes:</b>' +
                                '<div ng-repeat="note in bountyItem.conditions.notes track by $index">' +
                                    '<div>{{ note }}</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<hr/>' +
                 '<div class="page-controls" ng-if="getTotalPages() > 0">' +
                    '<div class="standard-button" ng-click="changePage(-1)" ng-class="{ disabled: (((pageBegin + 1) + (pageTake * -1) < 0)) }">' +
                        'Previous Page' + 
                    '</div>' +
                    '<div>' + 
                        'Page {{ (pageBegin / pageTake) + 1 }} of {{ getTotalPages() }}' +
                    '</div>' +
                    '<div class="standard-button" ng-click="changePage(1)" ng-class="{ disabled: (((pageBegin + 1) >= getTotalPages())) }">' + 
                        'Next Page' +
                    '</div>' +
                '</div>' +
            '</div>'
  }
});