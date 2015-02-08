'use strict';

/**
 * @ngdoc service
 * @name clientApp.DriveCache
 * @description
 * # DriveCache
 * DriveCache API for getting cached Index.
 */
angular.module('clientApp')
  .service('DriveCache', ['$resource','$rootScope', function ($resource,$rootScope) {

	var FileIndex = $resource('/api/cache/get/:driveId');
	var UpdateIndex = $resource('/api/cache/update/:driveId');

	var Cache = function(type, id){
		this.type = type;
		this.id = id;
		this.onRetrivedEvent = 'onCacheRetrived' + this.id;
		this.onUpdatedEvent = 'onCacheUpdated' + this.id;
		this.cachedIndex = {};
		this.lastUpdate = null;
	};

	Cache.prototype.getMetadata = function(identifier){
		identifier = identifier || this.cachedIndex.rootIndex;
		return this.cachedIndex[identifier];
	};

	Cache.prototype.getFileList = function(identifier){
		identifier = identifier || this.cachedIndex.rootIndex;
		var index = this.cachedIndex[identifier];
		if(!index) return null;
		var _this = this;
		var list = index.files.map(function(id){
			return _this.cachedIndex[id];
		});
		return list;
	};

	//	Sync the fileIndex from drive service provider to polytrix server.
	//	@requestSync
	//	@param{function(err)} errorCallback
	//	@return $promise
	Cache.prototype.requestSync = function(errorCallback){
		var _this = this;
		return UpdateIndex.get({driveId:this.id}).$promise
		.then(function(result) {
			if(result.success){
				//OK
				_this.lastUpdate = result.lastUpdate;
				_this.cachedIndex = JSON.parse(result.cachedIndex);
				$rootScope.$emit(_this.onUpdatedEvent);
			}else{
				console.log(result);
				if(errorCallback) errorCallback(result);
			}
		}, function(err) {
			console.log(err);
			if(errorCallback) errorCallback(err);
		});
	};

	//	Retrive the cache from polytrix server
	//	@retrive
	//	@param{function(err)} errorCallback
	//	@return $promise
	Cache.prototype.retrive = function(errorCallback){
		var _this = this;
		return FileIndex.get({driveId:this.id}).$promise
		.then(function(result) {
			if(result.success){
				//OK
				_this.lastUpdate = result.lastUpdate;
				_this.cachedIndex = JSON.parse(result.cachedIndex);
				$rootScope.$emit(_this.onRetrivedEvent);
			}else{
				console.log(result);
				if(errorCallback) errorCallback(result);
			}
		}, function(err) {
			console.log(err);
			if(errorCallback) errorCallback(err);
		});
	};

	//	EventRegister for the event after retrived the cache.
	//	@onRetrived
	//	@param{function(cache)} func
	Cache.prototype.onRetrived = function(scope,func){
		var _this = this;
		if (typeof scope === 'function'){
			func = scope;
			console.log(new Error('you should pass scope to onRetrived for unbind uses - Service:DriveCache.onchange()'));
			$rootScope.$on(this.onRetrivedEvent, function(){func(_this);});
			return;
		}
		var unbind = $rootScope.$on(this.onRetrivedEvent, function(){func(_this);});
		scope.$on('$destroy', unbind);
	};

	//	EventRegister for the event after updated the cache.
	//	@onUpdated
	//	@param{function(cache)} func
	Cache.prototype.onUpdated = function(scope,func){
		var _this = this;
		if (typeof scope === 'function'){
			func = scope;
			console.log(new Error('you should pass scope to onRetrived for unbind uses - Service:DriveCache.onchange()'));
			$rootScope.$on(this.onUpdatedEvent, function(){func(_this);});
			return;
		}
		var unbind = $rootScope.$on(this.onUpdatedEvent, function(){func(_this);});
		scope.$on('$destroy', unbind);
	};

	return Cache;
}]);
