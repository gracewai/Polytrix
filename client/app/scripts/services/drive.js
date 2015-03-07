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
		}).then(function(){
			_this.cacheReady = true;
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
		var promise;
		if(!this.cacheReady){
			promise = $q(function(r){r();});
		}else{
			promise = this.listFromCache(identifier)
			.then(function(index){
				fromCacheCallback(index);
			},function(err){
				console.log(err);
			});
		}
		promise.then(function(){
			return _this.listFromSyncedCache(identifier);
		})
		.then(function(result){
			if(result.success){
				_this.cache.syncFileListIndex(result.content,identifier);
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
		//actuall action of getting index from cache
		function getIndex(){
			return $q(function(reslove){
				var metadata = _this.cache.getMetadata(identifier);
				var files = _this.cache.getFileList(identifier);
				if(identifier === ''){
					console.log({metadata:metadata,files:files});
				}
				if(metadata){
					reslove({metadata:metadata,files:files});
				}else{
					reslove(null);
				}
			});
		}

		//wait until cache retrived.
		if(this.cacheReady){
			return getIndex();
		}else{
			return $q(function(resolve){
				_this.initCallback = function(){
					_this.cacheReady = true;
					resolve();
				};
			}).then(getIndex);
		}
	};

	Drive.prototype.parentOf = function(file){
		console.log(this);
		return this.cache.cachedIndex[file.parent_identifier];
	};

	// Move the file
	// @param driveId
	// @param fileId
	// @param destinationFileId - the destination folder's id
	// @param scope (optional) the scope to be apply after moving
	var FileMove = $resource('/api/drive/:driveId/:fileId/move/');
	Drive.prototype.move = function(file, destinationFolder, scope){
		var _this = this;
		var fileId = file.identifier;
		var originalFolder = this.parentOf(file);
		var destinationId = destinationFolder.identifier;

		var result = FileMove.get({driveId:this.id,fileId:fileId,destinationFileId:destinationId},function(){
			if(result.success){
				updateModel(result.file);
			}else{
				console.log(result);
			}
		});

		function updateModel(fileMeta){
			//remove from original folder
			for(var i = originalFolder.files.length;i;i--){
				if(originalFolder.files[i] == fileId){
					originalFolder.files.splice(i,1);
				}
			}

			//add to destinationFolder
			destinationFolder.files = destinationFolder.files || [];
			destinationFolder.files.push(fileId);

			//set parent to destinationFolder
			file.parent_identifier = destinationFolder.identifier;

			//dropbox identifier fix
			if(_this.type == 'dropbox'){
				var oldId = file.identifier;
				file.identifier = fileMeta.identifier;
				_this.cache.cachedIndex[file.identifier] = file;
				delete _this.cache.cachedIndex[oldId];
			}
			if(scope){
				if(scope.update){
					scope.update();
				}else{
					scope.$apply();
				}
			}
				
		}

	};

	// Move the file across drives
	// @param driveId
	// @param fileId
	// @param fileName
	// @param destinationDriveId - the destination drive's id
	// @param destinationFileId - the destination folder's id
	// @param scope (optional) the scope to be apply after moving
	var FileAcross = $resource('/api/drive/:driveId/:fileId/across/');
	Drive.prototype.across = function(file, destinationDrive, destinationFolder, scope){
		var fileId = file.identifier;
		var destinationId = destinationFolder.identifier;

		var result = FileAcross.get({
			driveId:this.id,
			fileId:fileId,
			fileName:file.name,
			destinationDriveId:destinationDrive.id,
			destinationFileId:destinationId
		},function(){
			if(result.success){
				updateModel(result.file);
			}else{
				console.log(result);
			}
		});

		function updateModel(file){
			destinationDrive.cache.cachedIndex[file.identifier] = file;
			if(scope){
				if(scope.update){
					scope.update();
				}else{
					scope.$apply();
				}
			}
		}
	};

	//
	//	Retrive the file list of specified resource. return a promise of that.
	//	@method listFromServer
	//	@param{string} identifier		(optional) indicate which resource is being retrieved. if not given, retrive the root file list
	//	@return-promise (http response)
	//
	var SyncIndex = $resource('/api/drive/cache/:driveId/:fileId/sync');
	Drive.prototype.listFromSyncedCache = function(identifier){
		identifier = identifier || this.rootPath;
		return SyncIndex.get({driveId:this.id,fileId:identifier}).$promise;
	};


	//
	//	Retrive the file list of specified resource. return a promise of that.
	//	@method listFromServer
	//	@param{string} identifier		(optional) indicate which resource is being retrieved. if not given, retrive the root file list
	//	@return-promise (http response)
	//
	var FileIndex = $resource('/api/drive/:driveId/:fileId/list/');
	Drive.prototype.listFromServer = function(identifier){
		identifier = identifier || this.rootPath;
		return FileIndex.get({driveId:this.id,fileId:identifier}).$promise;
	};

	//
	//	@method downloadLink
	//	return a string of downloadLink, passing the identifier.
	//
	Drive.prototype.downloadLink = function(identifier){
		return "/api/drive/" + this.id + "/" + identifier + "/download";
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
