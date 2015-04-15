'use strict';

angular.module('clientApp')
	.controller('uploadCtrl',['$scope', 'UploadTask', '$q',function($scope, UploadTask, $q){
	  var task = $scope.task = new UploadTask.Task.MonitorTask('rootTask');
    var $outerScope = $scope.$parent;

	setTimeout(function(){
		$("#ajaxfile").on('change',onChange);
		$("#ajaxfolder").on('change',onChange);
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
	function onChange(){
		event.stopPropagation();
		event.preventDefault();
		var files = $(this)[0].files;
		for(var i = 0; i < files.length;i++){
			var file = files[i];
      if($outerScope.selectedDrive){
        var destination = {
          drive:$outerScope.selectedDrive,
          folder:$outerScope.destination[$outerScope.selectedDrive]
        };
        task.addSubTask(new UploadTask.MultipartTask(destination,file,file));
      }else{
        console.error('cannot find destination to upload');
      }
		}
		$scope.$apply();
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
			handleWebkitGetAsEntry(items)
			.then(function(task){

			});
		}
	}
	$scope.selectFiles = function(){
		$("#ajaxfile").trigger('click');
	};
	$scope.selectFolders = function(){
		$("#ajaxfolder").trigger('click');
	};
	$scope.startUpload = function(){
		task.executeAll()
		.then(function(){
			console.log('finish');
		});
	};
	function handleWebkitGetAsEntry(items){
		function handleItem(item){
			if (item) {

        if($outerScope.selectedDrive){
          var destination = {
            drive:$outerScope.selectedDrive,
            folder:$outerScope.destination[$outerScope.selectedDrive]
          };
          return UploadTask.createSuitableTask(destination, item)
            .then(function(_task){
              task.addSubTask(_task);
              return task;
            });
        }else{
          console.error('cannot find destination to upload');
          return $q(function(r){r(task);});
        }


			}else{
				return $q(function(r){r(task);});
			}
		}

		function forloop(i){
			if(i<items.length){
				var item = items[i].webkitGetAsEntry();
				return handleItem(item)
				.then(function(){ return forloop(i+1); });
			}else{
				return $q(function(r){r(task);});
			}
		};

		return forloop(0);
	}

    function init(outerScope){
      $outerScope = outerScope;
    }
}]);
