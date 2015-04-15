'use strict';

/**
 * @ngdoc service
 * @name clientApp.Task
 * @description
 * # Task
 * Task
 */
angular.module('clientApp')
	.service('Task', ['$q',function ($q) {

	//
	//	Class Task
	//	id : String
	//	subTask : Task[]
	//	status : String
	//	progress : Number (range: 0-1)
	//	subTaskFaild : Boolean
	//
	//	@constructor Task(id, executeFunc)
	//	@param{String} id
	//	@param{Function} executeFunc	(the overriding function of Task.execute)
	//
	var Task = function(id,expectTimeUses,executeFunc){
		this.id = id || 'AnonymousTask';
		this.subTask = [];
		this.status = 'pending';
		this.progress = 0;
		this.expectTimeUses = expectTimeUses;
		this.timesLeft = expectTimeUses;
		this.subTaskFailed = false;
		this.totalItems = 1;

		if(typeof executeFunc === 'function')
			this.execute = executeFunc;

		//--------
	};

	// override your task here
	//
	//	Guide to write a task:
	//	write a function take 3 arguments: sucess, fail and progress
	//	these 3 arguments are functions to be called.
	//
	//	when your task on progress, call progress(progress),
	//		pass your progress to be the argument 'progress' of progress()
	//		progress is in range of 0 - 1.
	//
	//	when your task being failed, call fail(msg),
	//		pass your error message to be the argument 'msg' of fail()
	//
	//	when your task being success, call success(progress),
	//		it is optional to pass the argument 'progress'
	//
	//	example of a task that will be success after 10 seconds:
	//
	//	function(success, fail, progress){
	//		var seconds = 0;
	//		var timer = setInterval(function(){
	// 			seconds+=0.5;
	//			progress(seconds/10);
	//			if(seconds >= 10){
	//				clearInterval(timer);
	//				success(1);
	//			}else if(seconds < 0){
	//				fail('memory error');
	//			}
	// 		},500);
	//	}
	//
	Task.prototype.execute = function(success, fail, progress){
		success();
	};

	//Task.prototype.executeAll()
	//	call this if you want to run the task and its subtasks.
	//	this is the only way to run the task.
	//	you cannot simply call execute() as you must pass sucess, file, progress functions to it.
	//
	//	implementation is in more below
	//

	Task.prototype.addSubTask = function(subTask){
		this.subTask.push(subTask);
		this.totalItems += subTask.totalItems;
	};

  Task.prototype.removeSubTask = function(subTask){
    var target;
    if(typeof subTask === 'string'){
      var id = subTask;
      for(var i = this.subTask.length-1;i>=0;i--){
        if(this.subTask[i].id === id){
          target = this.subTask[i];
          this.subTask.splice(i,1);
          break;
        }
      }
    }else{
      for(var i = this.subTask.length-1;i>=0;i--){
        if(this.subTask[i] === subTask){
          target = this.subTask[i];
          this.subTask.splice(i,1);
          break;
        }
      }
    }
    if(target)this.totalItems -= target.totalItems;
  };

	//Overrideing event
	Task.prototype.onSubTaskProgress = function(subTask,progress){};
	Task.prototype.onSubTaskFail = function(subTask){};



	// MonitorTask is a task that own a lot of subTask;
	// And its own progress is equal to the progress of all subTask
	Task.MonitorTask = function(id){
		Task.call(this,id,0);
		this.totalItems = 0;
	};
	Task.MonitorTask.prototype = Object.create(Task.prototype);
	Task.MonitorTask.prototype.constructor = Task.MonitorTask;








//===================================================================================
//									End of Public
//===================================================================================

	//	Private functions
	//	Don't call these functions
	//
	Task.prototype.handle = function(parentOnSubTaskNotify){
		var _this = this;
		console.log(this);
		return $q(function(resolve){resolve();})
		.then(function(){
			_this.status = 'processing';
			_this.lastUpdate = new Date();
			_this.lastProgress = 0;
			var deffered = $q.defer();

			function onsuccess(progress){
				if(progress)deffered.notify(progress);
				deffered.resolve('finished');
			}
			function onfail(msg){
				deffered.notify('fail');
				deffered.resolve(msg);
			}
			function onprogress(progress){
				var now = new Date();
				var deltaProgress = progress - _this.lastProgress;
				var deltaTime = (now - _this.lastUpdate)/1000;
				var timesLeft = (1-progress)/deltaProgress*deltaTime;
				_this.timesLeft = timesLeft;

				deffered.notify(progress);

				_this.lastUpdate = now;
				_this.lastProgress = progress;
			}

			setTimeout(function(){_this.execute(onsuccess,onfail,onprogress);},0);

			return deffered.promise;
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
				parentOnSubTaskNotify(_this,progress);
		});
	};
	Task.prototype.executeAll = function(parentOnSubTaskNotify){
		var _this = this;
		_this.status = 'processing';

		function onSubTaskNotify(subTask,progress){
			if(progress=='fail'){
				_this.subTaskFailed = true;
				_this.onSubTaskFail(subTask);
			}else{
				_this.onSubTaskProgress(subTask,progress);
			}

			if(parentOnSubTaskNotify)
				parentOnSubTaskNotify(_this,progress);
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


	//
	//	Task.MonitorTask
	//
	Task.MonitorTask.prototype.onSubTaskProgress = function(task,progress){
		if(this.subTask.length){
			var sum = 0;
			var timesLeft = 0;
			for(var i in this.subTask){
				var subTask = this.subTask[i];
				if(subTask.status != 'fail'){
					sum += subTask.progress;
					timesLeft += subTask.timesLeft;
				}
			}
			sum /= this.subTask.length;
			this.progress = sum;
			this.timesLeft = timesLeft;
		}
	};
	Task.MonitorTask.prototype.addSubTask = function(subTask){
		this.subTask.push(subTask);
		this.expectTimeUses += subTask.expectTimeUses;
		this.timesLeft = this.expectTimeUses;
		this.totalItems += subTask.totalItems;
	};
	Task.MonitorTask.prototype.execute = function(success, fail, progress){
		if(this.subTask.length == 0){
			progress(1);
		}
		success();
	};
	return Task;
}]);



//
//	this controller just for test
//
//
// angular.module('clientApp').controller('taskCtrl', ['$scope','UploadTask', function($scope, UploadTask){

// 	var task = new UploadTask.Task.MonitorTask('MultipleTask');

// 	var rejectTask = new UploadTask.Task('rejectTask',4,function(success,fail,progress){
// 		var seconds = 0;
// 		var timer = setInterval(function(){
// 			seconds+=0.05;
// 			progress(seconds/4);
// 			if(seconds >= 3){
// 				clearInterval(timer);
// 				fail('my error msg');
// 			}
// 		},50);
// 	});
// 	var okTask = new UploadTask.Task('okTask',3,function(success,fail,progress){
// 		var seconds = 0;
// 		var timer = setInterval(function(){
// 			seconds+=0.05;
// 			progress(seconds/3);
// 			if(seconds >= 3){
// 				clearInterval(timer);
// 				success();
// 			}
// 		},50);
// 	});
// 	task.addSubTask(rejectTask);
// 	task.addSubTask(okTask);
// 	$scope.task = new UploadTask.Task.MonitorTask();
// 	$scope.task.addSubTask(task);

// 	var five = new UploadTask.Task('5s',5,function(success, fail, progress){
// 		var seconds = 0;
// 		var timer = setInterval(function(){
// 			seconds+=0.05;
// 			progress(seconds/5);
// 			if(seconds >= 5){
// 				clearInterval(timer);
// 				success();
// 			}else if(seconds < 0){
// 				fail('memory error');
// 			}
// 		},50);
// 	});

// 	$scope.task.addSubTask(five);

// 	$scope.onclick = function(){
// 		$scope.task.executeAll()
// 		.then(function(){
// 			alert('finished');
// 		});
// 	};
// }]);
