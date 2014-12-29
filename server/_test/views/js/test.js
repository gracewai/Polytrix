'use strict';

var app = angular.module('dropbox',[]);

app.controller('fileInfo',function($scope){

	$scope.data = [];
	$scope.status = 'ready';
	$scope.i = '/';
	$scope.using = 'dropbox';
	$scope.redirectUrl = null;
	
	$scope.getAuthUrl = function(){
		$.ajax({
			type: 'GET',
			url: '/api/auth/'+ $scope.using
		}).done(function(res){
			res.content;
			$scope.redirectUrl = res.redirectUrl;
			$scope.$apply();
			console.log(res.redirectUrl);
		});
	};

	$scope.submit = function(){
		$scope.status = 'loading...';
		//$scope.data = [];
		$.ajax({
			type: 'GET',
			url: '/api/fileIndex/' + $scope.using,
			data: { i : $scope.i }
		}).done(function(res){
			$scope.status = 'ready';
			$scope.data = res.content;
			$scope.$apply();
			console.log(res);
		});
	};
	$scope.click = function(i){
		$scope.i = i;
		$scope.submit();
	};
	$scope.download = function(i){
		$scope.status = 'downlading...';
		$.ajax({
			type: 'GET',
			url: '/api/download/' + $scope.using,
			data: { i : i }
		}).done(function(res){
			$scope.status = res;
			console.log(res);
		});
	};
});