'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:Topbar
 * @description
 * # Topbar
 * Topbar controller
 */
angular.module('clientApp')
	.controller('Topbar',['$scope','UserInfo','User', function ($scope,UserInfo,User){
		$scope.defaultPhoto = 'http://www.scumlabs.com/wp-content/uploads/2011/04/Nyan-Cat.jpg';
		$scope.user = UserInfo.get();

		$scope.getIconByCode = function(code){
			if(!code)
				return 'fa-info-circle';
			switch(code){
			case 401:
				return 'fa-sign-in';
			default:
				return 'fa-info-circle';
			}
		};

		UserInfo.onchange($scope,function(userInfo){
			console.log(userInfo);
			$scope.user = userInfo;
			User.getLogs(8).then(function(result){
				if(result.success){
					$scope.user.notification = result.logs;
					console.log($scope.user.notification);
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
	}]);