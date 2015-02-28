'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:DragFileImage
 * @description
 * # DragFileImage
 * DragFileImage controller
 */
angular.module('clientApp')
	.controller('DragFileImage',['$scope',function($scope){
		$scope.clear = function(){
			$scope.files = [];
			$scope.title = 'title not set';
		};
		$scope.clear();


		$scope.setTitle = function(title){
			$scope.title = title;
			$scope.$apply();
		};

		
		$scope.addFile = function(fileScope,fileElement){
			$scope.files.push({scope:fileScope,element:fileElement});
		};


	}]);