'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('SettingsCtrl',['$scope', 'UserInfo', '$resource', function ($scope, UserInfo, $resource) {
  	$scope.selectedSection = 'user_account_tab';
  	$scope.option = 'link step';
  	$scope.select = function(selection){
  		$scope.selectedSection = selection;
  		$('.step').removeClass('active');
  		$('#'+selection).addClass('active');
  		$scope.option = 'active step';
      setTimeout(function(){
          $('.ui.search.dropdown').dropdown();
  $('.ui.checkbox').checkbox();
    $('.ui.buttons').tab();
      })
  	};
    $scope.getName = function(id){
      switch(id){
        case 'user_account_tab':
        return 'Account Infomation & Details';
        break;
        case 'general_tab':
        return 'General Settings';
        break;
        case 'transmit_tab':
        return 'Transmission';
        break;
        case 'interface_tab':
        return 'Interface and Tweaks';
        break;
        case 'experimental_tab':
        return 'Experimental Features (Beta)';
        break;
        case 'payment_tab':
        return 'Payment & Subscription';
        break;
      }
    }
    $scope.settingCache = {
      password: 'placeholder',
      confirm_password: 'placeholder',
    }
    $scope.user = UserInfo.get();

  }]);


