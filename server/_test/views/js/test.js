'use strict';



var app = angular.module('polytrix',['ngMaterial']);

app.factory('userInfo', ['$rootScope', function($rootScope) {
	var userInfo = {};
	userInfo.info = {};
	userInfo.set = function(info) {
		console.log(info);
		userInfo.info = info;
		$rootScope.$emit('onUserInfoChange');
	};
	userInfo.get = function(){
		return userInfo.info;
	};
	userInfo.onchange = function(scope, func) {
		var unbind = $rootScope.$on('onUserInfoChange', func);
		scope.$on('$destroy', unbind);
	};
	return userInfo;
}]);

app.factory('appStatus', ['$rootScope', function($rootScope) {
	var appStatus = {};
	appStatus.status = {};
	appStatus.set = function(status) {
		appStatus.status = status;
		$rootScope.$emit('onAppStatusChange');
	};
	appStatus.get = function(){
		return appStatus.status;
	};
	appStatus.onchange = function(scope, func) {
		var unbind = $rootScope.$on('onAppStatusChange', func);
		scope.$on('$destroy', unbind);
	};
	return appStatus;
}]);

app.controller('appStatus',['$scope','appStatus',function($scope,status){
	this.status = '';
	var _this = this;
	status.onchange($scope,function(){
		_this.status = status.get();
	});
}]);

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

app.controller('availableInfo',['$scope','userInfo',function($scope,info){
	this.drives = [];
	var _this = this;
	info.onchange($scope,function(){
		var userInfo = info.get();
		var drives = userInfo.drives;
		_this.drives = [];
		for(var i in drives){
			var drive = drives[i];
			_this.drives.push({
				id: drive.id,
				name: drive.type + ' ' + drive.id,
				val: drive.type
			});
		}
	});
}]);

app.controller('formPost',['$scope','userInfo','appStatus',function($scope,info,status){
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
			status.set(res);
			$scope.$apply();
		});
	};
}]);

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

app.controller('autoLogin',['$scope','userInfo',function($scope,info){
	$scope.status = 'ready';
	$scope.autologin = function(){
		$scope.status = 'loging in...';
		$.ajax({
			type: 'GET',
			url: '/test/logined'
		}).done(function(res){
			if(res.logined){
				$scope.status = 'logined, checking status';
				$scope.$apply();
				$.ajax({
					type: 'GET',
					url: '/api/account/info/',
				}).done(function(res){
					if(res.logined){
						$scope.status = 'logined with user ' + res.userInfo.name;
						info.set(res.userInfo);
						$scope.$apply();
					}
				});
			}
		});
	};
}]);

app.controller('updateLogin',['$scope','userInfo',function($scope,info){
	$scope.status = 'ready';
	$scope.update = function(){
		$scope.status = 'getting information';
		$.ajax({
			type: 'GET',
			url: '/api/account/info/',
		}).done(function(res){
			if(res.logined){
				$scope.status = 'logined with user ' + res.userInfo.name;
				info.set(res.userInfo);
			}else{
				$scope.status = res
			}
			$scope.$apply();
		});
	};
	$scope.update();
}]);

app.controller('login',['$scope','userInfo',function($scope,info){
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
				info.set(res.userInfo);
				$scope.$apply();
			}
		});
	}
	$scope.facebook = function(){
		window.open('/passport/facebook','_blank');
	};
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
	$scope.logout = function(){
		$.ajax({
			type: 'POST',
			url: '/logout',
		})
		.done(function(res){
			if(res){
				loginStatus();
			}
		});
	};
}]);

app.controller('fileInfo',function($scope){

	$scope.data = [];
	$scope.status = 'ready';
	$scope.i = '/';
	$scope.using = 'dropbox';
	$scope.usingType = 'dropbox';
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
		$scope.i = $scope.usingType == 'dropbox' ? '/' : $scope.usingType == 'onedrive' ? 'me/skydrive' : 'root';
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
	setTimeout(function(){
		$scope.i = $scope.usingType == 'dropbox' ? '/' : $scope.usingType == 'onedrive' ? 'me/skydrive' : 'root';
		//$scope.$apply();
	},100)
	
});
