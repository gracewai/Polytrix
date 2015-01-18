'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:SettingsCtrl
 * @description
 * # SettingsCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('SettingsCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
