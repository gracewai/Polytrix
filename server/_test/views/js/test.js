'use strict';

var app = angular.module('polytrix',['ngMaterial']);

app.controller('allFileInfo',function($scope){
	this.drives = [
		{
			name: 'Dropbox',
			val: 'dropbox'
		},
		{
			name: 'One Drive',
			val: 'onedrive'
		},
		{
			name: 'Google Drive',
			val: 'googledrive'
		},
	];
});

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

app.controller('addDrive',function($scope){
	$scope.status = 'ready';
	$scope.using = 'dropbox';
	$scope.redirectUrl = null;

	$scope.getAuthUrl = function(){
		$.ajax({
			type: 'GET',
			url: '/api/auth/'+ $scope.using
		}).done(function(res){
			if(res.success){
				$scope.redirectUrl = res.redirectUrl;
			}else{
				$scope.status = res.msg;
				console.log(res.msg);
			}
			$scope.$apply();
		});
	};
});

app.controller('autoLogin',function($scope){
	$scope.status = 'ready';
	$scope.autologin = function(){
		$scope.status = 'loging in...';
		$.ajax({
			type: 'GET',
			url: '/test/logined'
		}).done(function(res){
			if(res.success){
				$scope.status = 'logined, checking status';
				$scope.$apply();
				$.ajax({
					type: 'GET',
					url: '/api/account/status/',
				}).done(function(res){
					if(res.logined){
						$scope.status = 'logined with user ' + res.name;
						$scope.$apply();
					}
				});
			}
		});
	}
});

app.controller('login',function($scope){
	$scope.uid = 'test';
	$scope.upw = '';
	$scope.name = 'test';
	$scope.email = 'test@te.st';
	$scope.result = '';

	function loginStatus(){
		$.ajax({
			type: 'GET',
			url: '/api/account/info/',
		}).done(function(res){
			if(res){
				$scope.result = res;
				$scope.$apply();
			}
		});
	}

	$scope.login = function(){
		$.ajax({
			type: 'POST',
			url: '/login',
			data: {
				uid : $scope.uid,
				upw : $scope.upw
			}
		}).done(function(res){
			if(res){
				loginStatus();
			}
		});
	};
	$scope.register = function(){
		$.ajax({
			type: 'POST',
			url: '/register',
			data: {
				uid : $scope.uid,
				upw : $scope.upw,
				name : $scope.name,
				email : $scope.email
			}
		}).done(function(res){
			if(res){
				loginStatus();
			}
		});
	};
});

app.controller('fileInfo',function($scope){

	$scope.data = [];
	$scope.status = 'ready';
	$scope.i = '/';
	$scope.using = 'dropbox';
	$scope.redirectUrl = null;
	
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
});
