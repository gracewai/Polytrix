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

	var FileIndex = $resource('/api/drive/cache/:driveId/');
	var UpdateIndex = $resource('/api/drive/cache/:driveId/update/');

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


	Cache.prototype.syncFileListIndex = function(fileList,folderId){
		var cachedIndex = this.cachedIndex;
		var changed = false;
		var folder = cachedIndex[folderId];
		if(!folder && (folderId == 'root' || folderId == '/' || folderId == 'me/skydrive' || typeof folderId === 'undefined')){
			folder = cachedIndex[cachedIndex.rootIndex];
		}
		//remove the index
		(function(){
			function existIn(fileId,fileList){
				for(var j in fileList){
					var file = fileList[j];
					if(file.identifier === fileId){
						return true;
					}
				}
				return false;
			}

			var i = folder.files.length;
			while (i--) {
				if (!existIn(folder.files[i],fileList)) {
					delete cachedIndex[folder.files[i]];
					folder.files.splice(i, 1);
					changed = true;
				}
			}
		})();


		//update index
		(function(){
			function fileConsistent(file1,file2){
				if(file1.is_file !== file2.is_file ||
						file1.etag !== file2.etag ||
						file1.identifier !== file2.identifier ||
						file1.parent_identifier !== file2.parent_identifier ||
						file1.mimetype !== file2.mimetype ||
						file1.created_date !== file2.created_date ||
						file1.modified_date !== file2.modified_date ||
						file1.name !== file2.name ||
						file1.description !== file2.description ||
						file1.checksum !== file2.checksum ||
						file1.file_size !== file2.file_size
					)
					return false;
				return true;
			}
			function set(file,src){
				for(var key in src){
					file[key] = src[key];
				}
			}
			for(var i in fileList){
				var file1 = fileList[i];
				var file2 = cachedIndex[file1.identifier];
				if(file2){
					if(!fileConsistent(file1,file2)){
						set(cachedIndex[file1.identifier],file1);
						changed = true;
					}
				}else{
					folder.files.push(file1.identifier);
					cachedIndex[file1.identifier] = { files:[]};
					set(cachedIndex[file1.identifier],file1);
					changed = true;
				}
			}
		})();
		return changed;
	};

	return Cache;
}]);
