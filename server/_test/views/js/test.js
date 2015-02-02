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

app.service('UploadTask', ['$q', function ($q) {

	//
	// Task
	//
	var Task = function(id,executeFunc){
		this.id = id || 'AnonymousTask';
		this.subTask = [];
		this.status = 'pending';
		this.progress = 0;
		
		//to determine is there any sub task is failed.
		this.subTaskFailed = false;


		if(typeof executeFunc === 'function')
			this.execute = executeFunc;
	};
	Task.prototype.addSubTask = function(subTask){
		this.subTask.push(subTask);
	};

	// execute the task only, no change to the task
	Task.prototype.execute = function(){
		var deffered = $q.defer();
		setTimeout(function(){deffered.notify(0.5);},500);
		setTimeout(function(){
			deffered.notify(1);
			deffered.resolve('finished');
		},1000);
		return deffered.promise;
	};
	Task.prototype.handle = function(parentOnSubTaskNotify){
		var _this = this;
		console.log(this);
		return $q(function(resolve){resolve();})
		.then(function(){
			_this.status = 'processing';
			return _this.execute();
		})
		.then(function(status){
			if(_this.status === 'fail'){
				_this.error = status;
			}else if(_this.subTaskFailed){
				_this.status = 'subTaskFailed';
			}else{
				_this.status = status;
			}
		},null,function(progress){
			if(progress === 'fail'){
				_this.status = 'fail';
				//mark as fail
			}else{
				_this.progress = progress;
			}
			if(parentOnSubTaskNotify)
				parentOnSubTaskNotify(progress);
		});
	};
	Task.prototype.executeAll = function(parentOnSubTaskNotify){
		var _this = this;
		_this.status = 'processing';

		function onSubTaskNotify(progress){
			if(progress=='fail')
				_this.subTaskFailed = true;
			_this.onSubTaskNotify(progress);
			if(parentOnSubTaskNotify)
				parentOnSubTaskNotify(progress);
		}

		return this.executeSubTasks(onSubTaskNotify)
		.then(function(){
			return _this.handle(parentOnSubTaskNotify);
		}).catch(function(err){
			_this.status = 'fail';
			_this.error = err;
		});
	};
	Task.prototype.executeSubTasks = function(onSubTaskNotify){
		var _this = this;

		function loop(i){
			return _this.subTask[i].executeAll(onSubTaskNotify).then(function(){
				if(i+1 < _this.subTask.length){
					return loop(i+1);
				}else{
					return 'all subtask finished';
				}
			});
		}

		if(_this.subTask[0]){
			return loop(0);
		}else{
			//when no subTask
			return $q(function(resolve){
				resolve('all subtask finished');
			});
		}
	};

	//for overrideing event
	Task.prototype.onSubTaskNotify = function(){}

	//
	//	MultipartTask : Task
	//
	var MultipartTask = function(destination, file, path){
		Person.call(this, destination+path);
	};
	MultipartTask.prototype = Object.create(Task.prototype);
	MultipartTask.prototype.constructor = MultipartTask;

	//
	//	ChunckedTask : Task
	//
	var ChunckedTask = function(){
		Person.call(this, '');
	};
	ChunckedTask.prototype = Object.create(Task.prototype);
	ChunckedTask.prototype.constructor = ChunckedTask;

	//
	//	FolderTask : Task
	//
	var FolderTask = function(){
		Person.call(this, '');
	};
	FolderTask.prototype = Object.create(Task.prototype);
	FolderTask.prototype.constructor = FolderTask;

	//
	//
	//
	var createSuitableTask = function(destination, webkitEntry, taskInto){
		// function mb(x){
		// 	return x * 1024 * 1024 * 8;
		// }

		if(webkitEntry.isFile){
			webkitEntry.file(function(file) {
				taskInto.push(new FileTask(webkitEntry,file));
				// Chunk upload will be implemented in later versions
				// if(file.size > mb(5)){
				// 	taskInto.push(new FileTask(webkitEntry,file));
				// }else{
				// 	taskInto.push(new FolderTask(webkitEntry));
				// }
			});
		} else if (item.isDirectory) {
			new FolderTask(webkitEntry);
		}
	};

	return {
		Task:Task,
		MultipartTask:MultipartTask,
		ChunckedTask:ChunckedTask,
		FolderTask:FolderTask,
		createSuitableTask: createSuitableTask,
	};
  }]);

app.controller('taskCtrl', ['$scope','UploadTask','$q', function($scope, UploadTask,$q){
	
	var task = new UploadTask.Task('MultipleTask');

	// a subTask
	task.onSubTaskNotify = function(progress){
		if(this.subTask.length){
			var sum = 0;
			for(var i in this.subTask){
				var subTask = this.subTask[i];
				if(subTask.status != 'fail'){
					sum += subTask.progress;
				}
			}
			sum /= this.subTask.length;
			this.progress = sum;
		}
	};

	task.execute = function(){
		return $q(function(resolve){resolve('finish');})
	};

	task.addSubTask(new UploadTask.Task('rejectTask',function(){
		var deffered = $q.defer();
		setTimeout(function(){deffered.notify(0.2);},500);
		setTimeout(function(){deffered.notify(0.4);},1000);
		setTimeout(function(){deffered.notify(0.5);},1500);
		setTimeout(function(){deffered.notify(0.7);},2000);
		setTimeout(function(){deffered.notify(0.9);},2500);
		setTimeout(function(){
			deffered.notify('fail');
			deffered.resolve('fail');
		},3000);
		return deffered.promise;
	}));
	task.addSubTask(new UploadTask.Task('okTask',function(){
		var deffered = $q.defer();
		setTimeout(function(){deffered.notify(0.2);},500);
		setTimeout(function(){deffered.notify(0.4);},1000);
		setTimeout(function(){deffered.notify(0.5);},1500);
		setTimeout(function(){deffered.notify(0.7);},2000);
		setTimeout(function(){deffered.notify(0.9);},2500);
		setTimeout(function(){
			deffered.notify(1);
			deffered.resolve('finished');
		},3000);
		return deffered.promise;
	}));
	$scope.task = new UploadTask.Task();
	$scope.task.addSubTask(task);
	$scope.task.addSubTask(new UploadTask.Task());
	$scope.task.onSubTaskNotify = task.onSubTaskNotify;
	$scope.task.execute = task.execute;
	//$scope.task.executeAll();
}]);

app.controller('uploadCtrl',['$scope', 'UploadTask',function($scope, UploadTask){
	var task = $scope.Tasks = [];

	setTimeout(function(){
		$("#ajaxfile").on('change',onChange);
		$(document).on('dragenter',dragenter);
		$("#upload_grid").on('dragleave',dragleave);
		$("#upload_grid").on('dragover',dragover);
		$("#upload_grid").on('drop',drop);
	},500);

	function dragenter(){
		$("#bgdiv").css("background-color","#ffd");
		$("#upload_grid").addClass("onupload");
		$("#ani").addClass("play");
		//animation begin
	}
	function dragleave(){
		$("#bgdiv").css("background-color","#fff");
		$("#upload_grid").removeClass("onupload");
		$("#ani").removeClass("play");
		//animation stop
	}
	function dragover(){
		event.stopPropagation();
		event.preventDefault();
	}
	function onChange(event){
		e.stopPropagation();
		e.preventDefault();
		handleFiles($(this)[0].files);
	}
	function drop(){
		dragleave();
		event.stopPropagation();
		event.preventDefault();

		$("#msg").html("geting data");
		var items = event.dataTransfer.items;
		var files = event.dataTransfer.files;

		// use items[0] is correct
		if(items[0] && items[0].webkitGetAsEntry){
			handleWebkitGetAsEntry(items);
		}
	}
	function handleWebkitGetAsEntry(items){
		for (var i=0; i<items.length; i++) {
			
			var item = items[i].webkitGetAsEntry();

			//Determine uses which Task
			if (item) {
				UploadTask.createSuitableTask('root', item, task);
			}
		}
	}



	// function traverseFileTree(item, path){
		
	// 	path = path || "";
	// 	if (item.isFile) {
	// 		// Get file
	// 		item.file(function(file) {
	// 			//console.log("File:", path + file.name);
	// 			console.log(file);
	// 			handleFile(file,path);
	// 		});
	// 	} else if (item.isDirectory) {
	// 		// Get folder contents
	// 		var dirReader = item.createReader();
	// 		dirReader.readEntries(function(entries) {
	// 			for (var i=0; i<entries.length; i++) {
	// 				traverseFileTree(entries[i], path + item.name + "/");
	// 			}
	// 		});
	// 	}
	// }
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
		$scope.fileIndex();
		//$scpoe.$apply();
	},100)
});


app.controller('userLog',['$scope','userInfo',function($scope,userInfo){
	// userInfo.onchange(this,function(userInfo){

	// });
	$scope.logs = [];
	$scope.getLogs = function(){
		$.ajax({
			type: 'GET',
			url: '/api/account/log/',
		}).done(function(res){
			if(res.success){
				$scope.logs = res.logs;
				$scope.$apply();
			}
		});
	};
}]);

app.directive('task', function($compile) {

	function link(scope, element, attrs) {
		var view1 = '<div>' +
						'id:{{val.id}} <br>' +
						'status:{{val.status}} <br>' +
						'<progress value="{{val.progress}}"></progress>';
		var view2 =		'<button ng-click="toggleSubTaskOpen()">{{openst ? "hide" : "show"}} sub tasks</button>' +
						'<div ng-show="openst" style="padding-left:10px;">' +
							'<div ng-repeat="task in val.subTask">' +
								'<task val="task"></task>' +
							'</div>' +
						'</div>';
		var view3 = '</div>';

		
		element.append(view1);
		if(scope.val.subTask.length){
			element.append(view2);
		}
		element.append(view3);

		$compile(element.contents())(scope.$new());
	}

	function controller($scope){
		$scope.openst = true;
		$scope.toggleSubTaskOpen=function(){
			$scope.openst = !$scope.openst;
		}
	}

	return {
		restrict: 'E',
		terminal: true,
		scope: {val:'='},
		link: link,
		controller: controller
	}
});

// app.directive('task', function() {
//   return {
//     restrict: 'E',
//     templateUrl: '/test/taskView.html'
//   };
// });