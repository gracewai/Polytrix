'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:Menu
 * @description
 * # Menu
 * Menu controller
 */
angular.module('clientApp')
	.controller('Menu',['$scope','Tools', function ($scope,Tools){
		var isOpen = false;

		$scope.options = [
			{icon:'fa-home',name:'Home',route:'/'},
			{icon:'fa-folder',name:'Files',route:'/browse'},
			{icon:'fa-terminal' ,name:'Terminal', route:'/cli'},
			{icon:'fa-tachometer',name:'Dashboard',route:'/dashboard'},
			{icon:'fa-gears' ,name:'Settings',route:'/settings'},
			{icon:'fa-sign-out' ,name:'Logout', route:'/logout'}
		];

		var bodyEl = $(document.body);
		var openbtn;

		Tools.selectElement('#sm-open-button',function(element){
			openbtn = element[0];
		},1,50);
		

		$scope.toggleMenu = function() {
			if( isOpen ) {
				bodyEl.removeClass('show-menu');
			}
			else {
				bodyEl.addClass('show-menu');
			}
			isOpen = !isOpen;
		};

		$scope.closeMenuIfOpened = function(ev){
			var target = ev.target;
			if( isOpen && target !== openbtn ) {
				$scope.toggleMenu();
			}
		};

	}]);

