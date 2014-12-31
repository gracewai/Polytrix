'use strict';

var app = angular.module('dropbox',[]);

app.controller('formPost',function($scope){
	$scope.postTarget = '/login';
	$scope.resBody = '';
	$scope.postData = JSON.stringify({
		strategy:'local',
		uid:'test',
		upw:'test',
		name:'test',
		email:'test@te.st'
	});
	$scope.post = function(){
		$.ajax({
			type: 'POST',
			url: $scope.postTarget,
			data: JSON.parse($scope.postData)
		}).done(function(res){
			$scope.resBody = res;
			$scope.$apply();
		});
	}
});

app.controller('fileInfo',function($scope){

	$scope.data = [];
	$scope.status = 'ready';
	$scope.i = '/';
	$scope.using = 'dropbox';
	$scope.redirectUrl = null;
	
	$scope.autologin = function(){
		$scope.status = 'loging in...';
		$.ajax({
			type: 'GET',
			url: '/test/logined'
		}).done(function(res){
			if(res.success){
				$scope.status = 'login successful';
				$scope.$apply();
			}
		});
	}

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

	$scope.fileIndex = function(){
		$scope.status = 'loading...';
		//$scope.data = [];
		$.ajax({
			type: 'GET',
			url: '/api/fileIndex/' + $scope.using,
			data: { i : $scope.i }
		}).done(function(res){
			console.log(res);
			if(res.success){
				$scope.status = 'ready';
				$scope.data = res.content;
			}else{
				$scope.status = res.msg;
			}
			$scope.$apply();
		});
	};
	$scope.toFolder = function(i){
		$scope.i = i;
		$scope.fileIndex();
	};
	$scope.toRoot = function(){
		$scope.i = $scope.using == 'dropbox' ? '/' : $scope.using == 'onedrive' ? 'me/skydrive' : 'root';
		$scope.fileIndex();
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
	$scope.autologin();
});
