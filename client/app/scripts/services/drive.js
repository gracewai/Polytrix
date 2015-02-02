'use strict';

/**
 * @ngdoc service
 * @name clientApp.Drive
 * @description
 * # Drive
 * Drive API for accessing drives
 */
angular.module('clientApp')
  .service('Drive', ['$resource', function ($resource) {

	var Drive = function(type, id){
		this.type = type;
		this.id = id;
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
	//	Retrive the file list of specified resource. return a promise of that.
	//	@method list
	//	@param{string} identifier		(optional) indicate which resource is being retrieved. if not given, retrive the root file list
	//	@return-promise (http response)
	//
	var FileIndex = $resource('/api/fileIndex/:driveId');
	Drive.prototype.list = function(identifier){
		identifier = identifier || this.rootPath;
		return FileIndex.get({driveId:this.id,i:identifier}).$promise;
	};

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
