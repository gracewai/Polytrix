var api = require('polytrix-core-api');
var UploadHandler = require('../../controllers/upload');

module.exports = function(req,res,next){
	console.log('routing rest.js /api/upload/:driveId');

	var handler = new UploadHandler();

	handler.process(req);
};