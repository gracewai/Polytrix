'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:File
 * @description
 * # File
 * File controller
 */
angular.module('clientApp')
  .controller('File',['$scope','$element',function($scope,$element){
    var dragFileImageDiv = $(".dragFileImage");
    var dragFileImage = dragFileImageDiv.scope();
    dragFileImageDiv = dragFileImageDiv[0];

    $scope.selected = false;

    $scope.onDragStart = function(event){
      dragFileImage.addFile($scope,$element);
      dragFileImage.setTitle($scope.file.name);
      event.dataTransfer.setDragImage(dragFileImageDiv, 0, 0);
    };
    $scope.onDrop = function(event){
      var values = dragFileImage.files;
      console.log(values);
      dragFileImage.clear();
    };
    $scope.getIconClass = function(){
      return _browse_getClass_($scope.file);
    };
    $scope.getFileTypeName = function(){
      return _browse_getFileType_($scope.file.name);
    };
    
    $scope.init = function(_file,drive,draggable,droppable){
      function allowDrop(event){
        event.preventDefault();
      }

      $scope.file = _file;
      $scope.drive = drive;
      if(draggable){
        $element.attr('draggable',true);
        $element[0].addEventListener('dragstart',$scope.onDragStart);
      }
      if(droppable){
        $element[0].addEventListener('dragover',allowDrop);
        $element[0].addEventListener('drop',$scope.onDrop);
      }
    };
  }]);