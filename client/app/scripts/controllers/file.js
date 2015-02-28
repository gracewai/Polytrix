'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:File
 * @description
 * # File
 * File controller
 */
angular.module('clientApp')
  .factory("DragValue",function(){
    this.val = null;
    this.get = function(){
      return this.val;
    };
    this.set = function(val){
      this.val = val;
    };
    return this;
  })
  .controller('File',['$scope','$element','DragValue',function($scope,$element,DragValue){
    var dragFileImage = $(".dragFileImage")[0];
    $scope.onDragStart = function(event){
      dragFileImage.innerHTML = $scope.file.name;
      event.dataTransfer.setDragImage(dragFileImage, 0, 0);
      DragValue.set({scope:$scope,element:$element});
    };
    $scope.onDrop = function(event){
      var values = DragValue.get();
      console.log(values.scope);
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