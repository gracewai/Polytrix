'use strict';

/**
 * @ngdoc service
 * @name clientApp.Drive
 * @description
 * # Drive
 * Drive API for accessing drives
 */
angular.module('clientApp')
	.service('Task', ['$q',function ($q) {

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
	//	when your task being success, call success(), 
	//		no argument needed for this function.
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
	//				success();
	//			}else if(seconds < 0){
	//				fail('memory error');
	//			}
	// 		},500);
	//	}
	//
	Task.prototype.execute = function(success, fail, progress){
		success();
	};


	Task.prototype.addSubTask = function(subTask){
		this.subTask.push(subTask);
	};

	//Overrideing event
	Task.prototype.onSubTaskProgress = function(subTask,progress){};
	Task.prototype.onSubTaskFail = function(subTask){};



	// MoniterTask is a task that own a lot of subTask;
	// And its own progress is equal to the progress of all subTask
	Task.MoniterTask = function(id,executeFunc){
		Task.call(this,id,executeFunc);
	};
	Task.MoniterTask.prototype = Object.create(Task.prototype);
	Task.MoniterTask.prototype.constructor = Task.MoniterTask;
	Task.MoniterTask.prototype.onSubTaskProgress = function(task,progress){
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

			var deffered = $q.defer();

			function onsuccess(){
				deffered.resolve('finished');
			}
			function onfail(msg){
				deffered.notify('fail');
				deffered.resolve(msg);
			}
			function onprogress(progress){
				deffered.notify(progress);
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
}]);