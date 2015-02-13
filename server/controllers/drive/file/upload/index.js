var api = require('polytrix-core-api');
var MultipartHandler = require('./multipart');

module.exports = function(req,res,next){
	console.log('routing rest.js /api/upload/:driveId');

	var handler = new MultipartHandler();
	handler.onprogress(function(progress,file,status){
		console.log('progress: ' + progress);
	});
	handler.onend(function(file, status){
		res.send('file created');
	})
	handler.process(req);
};