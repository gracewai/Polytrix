'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:Topbar
 * @description
 * # Topbar
 * Topbar controller
 */
angular.module('clientApp')
	.controller('Topbar',['$scope', function ($scope){
		setTimeout(function(){
			$('.ui.floating.labeled.icon.dropdown').dropdown();
			$('#displayNotification').popup({
				lnline : true,
				on: 'click',
				position: 'bottom right',
				setFluidWidth: 'true'
			});
		},300);

	}]);