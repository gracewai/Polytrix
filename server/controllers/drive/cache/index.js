var api = require('polytrix-core-api');
var CacheIndex = require('../../../database/cacheindex');
var Log = require('../../log');

module.exports.get = function(req, res){
	console.log('get');
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


module.exports.sync = function(req,res){
	req.apiClient.metadata.listFile(req.params.fileId)
	.then(function(result)
	{
		return CacheIndex.findByIDs(req.user.uid,req.drive.id)
		.then(function(index){
			if(index){
				var cache = JSON.parse(index.cachedIndex);
				if(syncFileListIndex(cache,result.content,req.params.fileId)){
					index.cachedIndex = JSON.stringify(cache);
					index.save();
					console.log('updated index');
				}
				result.logined = true;
				res.send(result);
			}else{
				res.status(404).end();
			}
		});
	})
	.done();
};

function syncFileListIndex(cachedIndex,fileList,folderId){
	var changed = false;
	var folder = cachedIndex[folderId];
	if(!folder && (folderId == 'root' || folderId == '/' || folderId == 'me/skydrive')){
		folder = cachedIndex[cachedIndex.rootIndex];
	}

	//remove the index
	(function(){
		function existIn(fileId,fileList){
			for(var j in fileList){
				var file = fileList[j];
				if(file.identifier == fileId){
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
				cachedIndex[file1.identifier] = { parent: folderId, files:[]};
				set(cachedIndex[file1.identifier],file1);
				changed = true;
			}
		}
	})();
	return changed;
}
// { is_file: false,
//   is_folder: true,
//   etag: undefined,
//   identifier: '',
//   parent_identifier: '',
//   mimetype: undefined,
//   created_date: Thu Jan 01 1970 08:00:00 GMT+0800 (HKT),
//   modified_date: Thu Jan 01 1970 08:00:00 GMT+0800 (HKT),
//   name: '',
//   description: '',
//   checksum: null,
//   file_size: 0,

// metadata (file)
// { is_file: true,
//   is_folder: false,
//   etag: '157e1a04db6a',
//   identifier: '/CTNET.jpg',
//   parent_identifier: '',
//   mimetype: undefined,
//   created_date: Sun Nov 24 2013 14:37:14 GMT+0800 (HKT),
//   modified_date: Sun Nov 24 2013 14:37:14 GMT+0800 (HKT),
//   name: 'CTNET.jpg',
//   description: '',
//   checksum: null,
//   file_size: 194202,