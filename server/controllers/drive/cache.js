var api = require('polytrix-core-api');
var CacheIndex = require('../../database/cacheindex');
var Log = require('../log');

module.exports.get = function(req, res){
	CacheIndex.findByIDs(req.user.uid,req.drive.id)
	.then(function(index){
		if(index){ // FOUND
			index.success = true;
			index.logined = true;
			res.setHeader('Last-Modified', index.lastUpdate.toUTCString());
			res.send({
				success: true,
				logined: true,
				uid: index.uid,
				driveId: index.driveId,

				driveType: index.driveType,
				lastUpdate: index.lastUpdate,
				cachedIndex: index.cachedIndex
			});
		}else{
			res.status(404).end();
			//res.send();
		}
	})
	.done();
};

module.exports.update = function(req, res){
	var begin;
	CacheIndex.findByIDs(req.user.uid,req.drive.id)
	.then(function(index){
		begin = new Date();
		return index.update();
	})
	.then(function(index){
		var timeUsed = new Date() - begin;
		Log.updateCache(req.user,req.drive,timeUsed);
		index.success = true;
		index.logined = true;
		res.send(index);
	})
	.done();
};


module.exports.check = function(req,res){
	//function not implemented

	//check the consistency of that id
	//if inconsist, update that index cache,
	//finally, return the updated index.
};