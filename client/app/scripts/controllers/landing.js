'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the clientApp
 */
  function dialogController($scope, $mdDialog){
    		$scope.onRegister = function(){

    		};
    		$scope.onCollapse = function(){
    			$mdDialog.hide();
    		};
	}
angular.module('clientApp')
  .controller('LandingCtrl',['$scope', '$resource', '$mdDialog', function ($scope, $resource, $mdDialog) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    $scope.email = '';

    var existingAccount = $resource('api/account/info');
    $scope.retrieveAccount = function(event){
    	$mdDialog.show({
    		controller: dialogController,
    		templateUrl:'scripts/controllers/register.html',
    		targetEvent: event});
    	var result = existingAccount.get({value: $scope.email}, function(){
    		if(result.success){
    			$mdDialog.show({controller: function(){}, templateUrl:'login.html', targetEvent: event});
    		}
    		else{
    			$mdDialog.show({controller: function(){}, templateUrl:'register.html', targetEvent: event});	
    		}
    	});
    };
  }]);
