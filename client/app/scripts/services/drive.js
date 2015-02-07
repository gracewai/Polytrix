'use strict';

/**
 * @ngdoc service
 * @name clientApp.Drive
 * @description
 * # Drive
 * Drive API for accessing drives
 */
angular.module('clientApp')
  .service('Drive', ['$resource','DriveCache','$q', function ($resource,DriveCache,$q) {

	var Drive = function(type, id){
		var _this = this;
		this.type = type;
		this.id = id;
		this.cacheReady = false;
		this.cache = new DriveCache(type,id);
		this.cacheInitPromise = this.cache.retrive(function(err){
			console.log('retirved error, should be try again but not implemented, error:');//try again??
			console.log(err);
		});
		this.cacheInitPromise.then(function(){
			if(_this.initCallback) _this.initCallback();
		});


		switch(type){
		case 'dropbox':		this.rootPath = '/';			break;
		case 'googledrive':	this.rootPath = 'root';			break;
		case 'onedrive':	this.rootPath = 'me/skydrive';	break;
		default:
			console.log(new Error('Unsupported drive type on Constructor::service::Drive'));
			break;
		}
	};

	//
	//
	//	fromCacheCallback({metadata,files})
	//
	Drive.prototype.list = function(identifier, fromCacheCallback, fromServerCallback){
		var _this = this;
		this.listFromCache(identifier)
		.then(function(index){
			fromCacheCallback(index);
			return _this.listFromServer(identifier);
		})
		.then(function(result){
			if(result.success){
				fromServerCallback(result.content);
			}else{
				console.log('result not success');
				console.log(result);
			}
		},function(err){
			console.log(err);
		});
	};

	Drive.prototype.listFromCache = function(identifier){
		var _this = this;
		identifier = identifier || _this.rootPath;

		//actuall action of getting index from cache
		function getIndex(){
			return $q(function(reslove){
				var metadata = _this.cache.getMetadata(identifier);
				var files = _this.cache.getFileList(identifier);
				reslove({metadata:metadata,files:files});
			});
		}

		//wait until cache retrived.
		if(this.cacheReady){
			return getIndex();
		}else{
			return $q(function(resolve,reject){
				_this.initCallback = function(){
					_this.cacheReady = true;
					resolve();
				};
			}).then(getIndex);
		}
	};

	//
	//	Retrive the file list of specified resource. return a promise of that.
	//	@method listFromServer
	//	@param{string} identifier		(optional) indicate which resource is being retrieved. if not given, retrive the root file list
	//	@return-promise (http response)
	//
	var FileIndex = $resource('/api/fileIndex/:driveId');
	Drive.prototype.listFromServer = function(identifier){
		identifier = identifier || this.rootPath;
		return FileIndex.get({driveId:this.id,i:identifier}).$promise;
	}

	//
	//	@method downloadLink
	//	return a string of downloadLink, passing the identifier.
	//
	Drive.prototype.downloadLink = function(identifier){
		return "/api/download/" + this.id + "?i=" + identifier;
	};

	//
	//	@method upload
	//
	Drive.prototype.info = function(identifier){
		//return FileIndex.get({driveId:this.id,i:identifier}).$promise;
		throw new Error('function not implemented');
	};

	return Drive;
}]);
