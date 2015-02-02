'use strict';

/**
 * @ngdoc service
 * @name clientApp.UploadTask
 * @description
 * # UploadTask
 * UploadTask
 */
angular.module('clientApp')
  .service('UploadTask', ['Task','$q' , function (Task,$q) {
  	//
	//	MultipartTask : Task
	//
	var MultipartTask = function(destination, webkitEntry, file){
		Task.call(this, webkitEntry.name, file.size/8388608);
		this.file = file;
		this.webkitEntry = webkitEntry;
		this.destination = destination;
	};
	MultipartTask.prototype = Object.create(Task.prototype);
	MultipartTask.prototype.constructor = MultipartTask;
	MultipartTask.prototype.execute = function(success, fail, progress){
		var file = this.file;
		var webkitEntry = this.webkitEntry;
		var destination = this.destination;
		var file_data = file;
		var form_data = new FormData();
		var path = webkitEntry.fullpath;
		form_data.append("path",destination + path);
		form_data.append("filesize",file.size);
		form_data.append("file",file_data);
		$.ajax({
			url: "/test/uploadtask/",
			type: 'post',
			//dataType: 'text',
			xhr: function(){
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){
					myXhr.upload.addEventListener('progress',progressHandler,false);
				}
				return myXhr;
			},
			beforeSend: beforeSendHandler,
			success: function(response){
				console.log(response);
				success(1);
			},
			error: errorHandler,
			data: form_data,
			cache: false,
			contentType: false,
			processData: false
		});
		function beforeSendHandler(){

		}
		function errorHandler(err){
			fail(err);
		}
		function progressHandler(e){
			if(e.lengthComputable){
				progress(e.loaded/e.total);
			}
		}
	};

	//
	//	ChunckedTask : Task
	//
	var ChunckedTask = function(destination, webkitEntry, file){
		Task.call(this, webkitEntry.name, file.size/8388608);
	};
	ChunckedTask.prototype = Object.create(Task.prototype);
	ChunckedTask.prototype.constructor = ChunckedTask;
	ChunckedTask.prototype.execute = function(success, fail, progress){
		
	};

	//
	//	FolderTask : Task
	//
	var FolderTask = function(destination, webkitEntry){
		Task.MonitorTask.call(this, webkitEntry.name, 0);
		var _this = this;

	};
	FolderTask.prototype = Object.create(Task.MonitorTask.prototype);
	FolderTask.prototype.constructor = FolderTask;
	FolderTask.prototype.execute = function(success, fail, progress){
		if(this.subTask.length == 0){
			//create folder here
			progress(1);
		}
		success();
	};

	var createFolderTask = function(destination, webkitEntry){
		function readEntries(webkitEntry){
			return $q(function(resolve){
				var dirReader = webkitEntry.createReader();
				dirReader.readEntries(function(entries) {
					resolve(entries);
				});
			});
		}

		return readEntries(webkitEntry)
		.then(function(entries){
			var folder = new FolderTask(destination, webkitEntry);

			function loop(i){
				if(i < entries.length){
					return createSuitableTask(destination,entries[i])
					.then(function(task){
						folder.addSubTask(task);
						return i+1
					})
					.then(loop);
				}else{
					return folder;
				}
			}
			return loop(0);
		});
	};

	var createFileTask = function(destination, webkitEntry){
		function getFile(webkitEntry){
			return $q(function(resolve){
				webkitEntry.file(function(file) {
					resolve(file);
				});
			});
		}

		return getFile(webkitEntry)
		.then(function(file){
			return new MultipartTask(destination,webkitEntry,file);
		});
	};

	var createSuitableTask = function(destination, webkitEntry){
		if(webkitEntry.isFile){
			return createFileTask(destination,webkitEntry);
		} else if (webkitEntry.isDirectory) {
			return createFolderTask(destination,webkitEntry);
		}
	};

	return {
		Task:Task,
		MultipartTask:MultipartTask,
		ChunckedTask:ChunckedTask,
		FolderTask:FolderTask,
		createSuitableTask:createSuitableTask,
		createFileTask:createFileTask,
		createFolderTask:createFolderTask,
	};
  }]);


// Chunk upload will be implemented in later versions
// if(file.size > mb(5)){
// 	taskInto.push(new FileTask(webkitEntry,file));
// }else{
// 	taskInto.push(new FolderTask(webkitEntry));
// }