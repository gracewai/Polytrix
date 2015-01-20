'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:Menu
 * @description
 * # Menu
 * Menu controller
 */
angular.module('clientApp')
	.controller('Menu',['$scope', function ($scope){
		var isOpen = false;

		$scope.options = [
			{icon:'fa-home',name:'Home',route:'/'},
			{icon:'fa-heart',name:'Favs',route:'/'},
			{icon:'fa-folder',name:'Files',route:'/browse'},
			{icon:'fa-tachometer',name:'Stats',route:'/'}
		];

		var bodyEl = $(document.body);
		var openbtn;
		setTimeout(function(){openbtn = document.getElementById( 'sm-open-button' );},100);
		setTimeout(function(){openbtn = document.getElementById( 'sm-open-button' );},1000);
		setTimeout(function(){openbtn = document.getElementById( 'sm-open-button' );},3000);

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
				console.log('toggleMenu');
			}
			console.log('clicked');
		};

	}]);

