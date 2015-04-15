var api = require('polytrix-core-api');

// Move the file across drives
// @param driveId
// @param fileId
// @param fileName
// @param destinationDriveId - the destination drive's id
// @param destinationFileId - the destination folder's id
module.exports.across = function(req,res){
	console.log(req.params);
	console.log('--');
	console.log(req.query);
	console.log('--');
	try{


	var targetDrive = req.user.getDrive(req.query.destinationDriveId);
	var targetDriveClient = api[targetDrive._type].client(targetDrive.access_token,targetDrive.refresh_token);
	
	req.apiClient.stream.downloadStream(req.params.fileId)
	.then(function(response){
		console.log(response);
		if(response.success === false){
			return response;
		}else{
			return targetDriveClient.stream.createAndUploadStream(
				req.query.destinationFileId,
				response,
				response.mimetype,
				req.query.fileName);
		}
	})
	.then(function(response){
		if(response.success){
			console.log('success');
			return targetDriveClient.metadata.get(response.identifier)
			.then(function(response){
				delete response.success;
				res.send({
					success: true,
					logined: true,
					file:response
				});
			});
		}else{
			res.send({
				success:false,
				logined: true,
				error_code: response.error_code,
				msg: response.msg,
			});
		}
	});
}catch(err){
	console.log(err.stack);
}
};

// Move the file
// @param driveId
// @param fileId
// @param destinationFileId - the destination folder's id
module.exports.move = function(req,res){
	console.log(req.params);
	console.log('--');
	console.log(req.query);
	console.log('--');
	req.apiClient.operation.move(req.params.fileId, req.query.destinationFileId)
	.then(function(response){
		if(response.success){
			res.send({
				success: true,
				logined: true,
				file:{
					identifier: response.identifier,
					name: response.name
				}
			});
		}else{
			res.send({
				success:false,
				logined: true,
				error_code: response.error_code,
				msg: response.msg,
			});
		}
	});
};

module.exports.copy = function(req,res){

};

module.exports.create = function(req,res){

};

module.exports.rename = function(req,res){

};

module.exports.remove = function(req,res){

};