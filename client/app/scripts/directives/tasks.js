'use strict';
//
//
//	Task
//
//
//
//
//
angular.module('clientApp')
.controller('taskDirectiveCtrl',['$scope',function($scope){
	$scope.openst = false;
	$scope.Math = Math;
  var parent = $scope.$parent.$parent.$parent.$parent;

    $scope.removeTask = function(task){
      $scope.val.removeSubTask(task);
    };
    $scope.removeFromParent = function(){
      if(parent.removeTask){
        parent.removeTask($scope.val);
      }
    };
    $scope.hasParent = !!parent.removeTask;
    console.log($scope.hasParent);
    console.log($scope);
}])
.directive('task', function(){
	return {
		restrict: 'E',
		scope: {val:'='},
		templateUrl: '/views/task.html',
		controller: 'taskDirectiveCtrl'
	};
})
.directive('subTasks', function($compile) {

	function link(scope, element, attrs) {
		var view = '<task ng-repeat="task in val" val="task"></task>';
		function update(){
			if(scope.val.length){
				element.html(view);
			}
			$compile(element.contents())(scope.$new());
		}
		update();
		scope.$watchCollection('val', function() {
			update();
		},true);
	}

	return {
		restrict: 'E',
		terminal: true,
		scope: {val:'='},
		link: link,
	};
});
