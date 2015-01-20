'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('UserCtrl',['$mdDialog', '$scope', '$resource', function ($mdDialog, $scope, $resource) {
		$scope.user = $scope.user || {};
		$scope.user.notification = [
			{icon:'fa-trash-o', msg:'A file has been deleted from your Dropbox'},
			{icon:'fa-file-image-o', msg:'5 pictures have been added to your storage'}
		];

		$scope.showLogoutConfirm = function(ev) {
			var usrReq = $resource('/logout');

			var confirm = $mdDialog.confirm()
				.title('Would you like to log off the system?')
				.content('You will have to login again to gain access to your cloud storage.')
				.ok('Logout')
				.cancel('Cancel')
				.targetEvent(ev);
			$mdDialog.show(confirm).then(function(){
				var result = usrReq.save({}, function(){
					if(result.success && result.logined == false){
						window.location = '/';
					}
				});
			},function(){
				$mdDialog.cancel();
			});
		};

	}]);
