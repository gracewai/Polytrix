// routes for REST resources
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();

var api = require('polytrix-core-api');

function requireLogined(req, res, next){
	var sess = req.session;
	if(sess.uid){
		req.uid = sess.uid;
		next();
	}else{

		var result = {
			success : false,
			logined : false,
			msg : 'user not logined'
		};

		res.send(result);
	}
}
router.use('/api',requireLogined);

//	format:
//		/api/[action]/[the drive name]/[the drive resources identifier]?other_arguments
//	example:
//		/api/download/gdrive/study%20files/year1%20sem%20A/ast20401/lecture/lec1.pptx
//
//	allow using GET when debugging for POST action
//
//	actions:
//		info GET
//		download GET
//		upload GET
//		delete DELETE
//		files GET	(for folder use only, list out all files in the given folder)
//		sharelink GET
//		move GET
//		

router.get('/api/fileIndex/:drive', function(req, res) {
	var client = api[req.params.drive];
	var driveConfig = req.session[req.params.drive];

	client.getFileIndex(req.query.i,driveConfig.access_token,driveConfig.refresh_token)
	.then(function(fileIndex)
	{
		res.send(fileIndex);
	})
	.done();
});

router.get('/api/download/:drive', function(req, res) {
	var client = api[req.params.drive];
	var driveConfig = req.session[req.params.drive];

	client.downloadFile(req.query.i,driveConfig.access_token,driveConfig.refresh_token)
	.then(function(result)
	{
		res.writeHead(200, {
			'Content-Type': result.contentType,
			'Content-Length': result.contentLength
		});
		res.write(result.file);
		res.end();
	})
	.done();
});


module.exports = router;
