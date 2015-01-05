'use strict';

/**
 * @ngdoc factory
 * @name clientApp.userInfo
 * @description
 * use for setting and getting current userInfo.
 *
 *
 *
 */
angular.module('clientApp')
  .factory('userInfo', ['$rootScope','$resource', function($rootScope) {
	var User = $resource('/api/account/info');

	var userInfo = {};
	userInfo.info = {};


	/**
	 * Set the user's info
	 * @method set
	 * @param{String} info
	 */
	userInfo.set = function(info) {
		console.log(info);
		userInfo.info = info;
		$rootScope.$emit('onUserInfoChange');
	};



	/**
	 * Get the user's info, no userInfo update action here, call update() if needed.
	 * @method get()
	 * @return uesrInfo
	 *
	 * Get the specified user's public info
	 * @method get(uid,callback)
	 * @param{String} uid
	 * @param{function} callback
	 * @return-callback-value:
	 *		@param{userInfo}
	 */
	userInfo.get = function(uid, callback){
		if(!uid){
			// @method get()
			return userInfo.info;
		}
		else
		{
			// @method get(uid,callback)
			var result = User.get({uid:uid}, function(){
				if(result.success){
					callback(result.userInfo);
				}
			});
		}
	};

	/**
	 * Update the user's info
	 *	If your already registered the onchange event, 
	 *	implement callback in onchange event instead of passing callback function
	 * @method update
	 * @param{function}(optional) callback
	 * @return-callback-value:
	 *		@param{userInfo}
	 */
	userInfo.update = function(callback){
		var result = User.get({}, function(){
			if(result.success){
				userInfo.set(result.userInfo);
			}
		});
	};

	/**
	 * Register the user's info onchange event. Event emit when the info is being set
	 * @method onchange
	 * @param{$scope} scope
	 * @param{function} func
	 */
	userInfo.onchange = function(scope, func) {
		var unbind = $rootScope.$on('onUserInfoChange', func);
		scope.$on('$destroy', unbind);
	};
	return userInfo;
}]);
