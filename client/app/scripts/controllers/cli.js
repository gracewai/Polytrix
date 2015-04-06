'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:CliCtrl
 * @description
 * # CliCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('CliCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
