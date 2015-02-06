'use strict';

/**
 * @ngdoc service
 * @name clientApp.user
 * @description
 * get user resources
 *
 */
angular.module('clientApp')
  .service('User', ['$q','$resource', function($q,$resource) {
  	var logs = $resource('/api/account/log');

  	return {
  		getLogs : function(limit){
  			return logs.get({limit:limit||20}).$promise;
  		},
  		getNotification : function(){

  		},
  	};
}]);
