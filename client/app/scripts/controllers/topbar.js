'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:Topbar
 * @description
 * # Topbar
 * Topbar controller
 */
angular.module('clientApp')
	.controller('Topbar',['$scope','UserInfo','User','Global', function ($scope,UserInfo,User,Global){
		$scope.defaultPhoto = '/images/Nyan-Cat.jpg';
		$scope.user = UserInfo.get();
		$scope.getUserPhoto = function(){
			if($scope.user)
				return $scope.user.photo || $scope.defaultPhoto;
			else
				return $scope.defaultPhoto;
		};
		$scope.getIconByCode = function(code){
			if(!code)
				return 'fa-info-circle';
			switch(code){
			case 151:
				return 'fa-refresh';
			case 303:
				return 'fa-link'
			case 401:
				return 'fa-sign-in';
			default:
				return 'fa-info-circle';
			}
		};
		UserInfo.onchange($scope,function(userInfo){
			$scope.user = userInfo;
			User.getLogs(6).then(function(result){
				if(result.success){
					$scope.user.notification = result.logs.map(function(row){
						// if(type == 'Logging'){}
						// if(row.code) switch(row.code){
						// case 401:
						// }
						return row;
					});
				}else{
					console.log(result);
				}
			});
		});
		UserInfo.onerror($scope,function(error){
			if(!error.logined){
				window.location = '/';
			}
		});

		setTimeout(function(){
			$('.ui.floating.labeled.icon.dropdown').dropdown();
			$('#displayNotification').popup({
				lnline : true,
				on: 'click',
				position: 'bottom right',
				setFluidWidth: 'true'
			});
		},300);
	}])
	.directive('timeAgo', ['$interval', 'Tools', function($interval, Tools) {

		function link(scope, element, attrs) {
			var timeoutId;
			scope.time = new Date(scope.time);

			function updateTime() {
				element.text(Tools.timeAgo(scope.time));
			}

			element.on('$destroy', function() {
				$interval.cancel(timeoutId);
			});

			timeoutId = $interval(function() {
				updateTime(); // update DOM
			}, 1000);
		}

		return {
			link: link,
			restrict: 'E',
			terminal: true,
			scope: {time:'='}
		};
	}]);