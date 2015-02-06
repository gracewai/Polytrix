var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = require('./user');
var Q = require('q');
var api = require('polytrix-core-api');
//
//	For system log, dashborad, statistic.
//
var CacheIndex;

var indexSchema = new Schema({
	uid: String,
	driveId: String,

	driveType: String,
	lastUpdate: {type: Date, default: Date.now},
	cachedIndex: Schema.Types.Mixed
});

indexSchema.statics.findByIDs = function(uid,driveid){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		_this.findOne({ uid: uid, driveId: driveid }, function(err, cache){
			if (err){
				var _err = {
					error: 'mongoose error',
					details: err
				};
				reject(_err);
			}else{

				resolve(cache);
			}
		});
	});
};

indexSchema.statics.create = function(uid,drive){
	var cache = new CacheIndex({uid:uid,driveId:drive.id,driveType:drive._type,cachedIndex:{rootIndex:null}});
	cache.save();
	return cache;
};

indexSchema.methods.getIndex = function(indexId){
	return this.cachedIndex[indexId];
};

indexSchema.methods.getParentIndex = function(index){
	return this.getIndex(index.parent);
};



function syncIndex(index,cacheRoot,client,type,access_token,refresh_token){
	console.log('stage 2');
	return client.getFileIndex(index.identifier,access_token,refresh_token)
	.then(function(responseIndex){
		
		// console.log(responseIndex);
		// console.log(index);
		console.log('stage 2.5');

		index.files = new Array();
		for(var i = 0; i < responseIndex.content.length; i++){
			var metadata = responseIndex.content[i];
			cacheRoot[metadata.identifier] = metadata;
			index.files.push(metadata.identifier);
			metadata.parent = index.identifier;
		}
		console.log(cacheRoot);
		console.log('stage 2.6');
		//index.files = responseIndex.content;

		function loop(i){
			if(i < index.files.length){
				console.log('Get index, i: ' + i);
				var id = index.files[i];
				var targetIndex = cacheRoot[id];
				if(targetIndex.is_folder){
					return syncIndex(targetIndex,cacheRoot,client,type,access_token,refresh_token)
					.then(function(returnedCacheRoot){
						return loop(i+1);
					});
				}else{
					return loop(i+1);
				}
			}else{
				console.log(index);
				console.log('END of loop');
				return cacheRoot;
			}
		}

		return loop(0);
	});
};

indexSchema.methods.update = function(){
	var _this = this;
	console.log('stage 1')
	return User.findUser(this.uid).then(function(user){
		try{


		console.log('stage 1.1');
		var drive = user.getDrive(_this.driveId);
		if(!drive){
			console.log('cacheindex.js indexSchema.update() no drive found');
			return;
		}
		var client = api[drive._type];

		if(_this.cachedIndex &&
			_this.cachedIndex.rootIndex && false){
			console.log('yes');
			return syncIndex(_this.getIndex(_this.cachedIndex.rootIndex),_this.cachedIndex,client,drive.type,drive.access_token,drive.refresh_token)
			.then(function(returnedCacheRoot){
				var mObj=JSON.stringify(returnedCacheRoot);
				_this.cachedIndex = mObj;
				_this.save();
				return _this;
			});
		}else{
			console.log('no');
			return client.getFolderInformation(client.rootIdentifier,drive.access_token,drive.refresh_token)
			.then(function(metadata){
				console.log(metadata);
				_this.cachedIndex = {};
				metadata.identifier = metadata.identifier || '/';
				_this.cachedIndex.rootIndex = metadata.identifier;
				_this.cachedIndex[metadata.identifier] = metadata;
				return syncIndex(_this.getIndex(_this.cachedIndex.rootIndex),_this.cachedIndex,client,drive.type,drive.access_token,drive.refresh_token);
			}).then(function(returnedCacheRoot){
				console.log(returnedCacheRoot);
				console.log('_this');
				var mObj=JSON.stringify(returnedCacheRoot);
				_this.cachedIndex = mObj;
				console.log(_this);
				_this.save();
				console.log('called save');
				return _this;
			});
		}
	}catch(err){
		console.log(err);
	}
	});
};

CacheIndex = mongoose.model('CacheIndex', indexSchema);
module.exports = CacheIndex;
