// routes for REST resources
//
//	author: BrianSo
//	date:	2014-12-27
//
//	REST link format:
//		/api/[action]/[the drive name]/[the drive resources identifier]?other_arguments
//	example:
//		/api/download/googledrive/study%20files/year1%20sem%20A/ast20401/lecture/lec1.pptx
//
//	actions:
//		info GET
//		download GET
//		upload PUT
//		delete GET
//		fileIndex GET	(for folder use only, list out all files in the given folder)
//		sharelink GET
//		move GET
//		across (SSE GET) move file/folder across drive. use Server-Sent Event to receive moving progress
//	

'use strict';

var router = require('express').Router();

var api = require('polytrix-core-api');

var requireLogined = require('./login').requireLogined;

router.use('/api',requireLogined);

router.param('drive', function(req, res, next, val){
	console.log('routing rest.js :drive');
	if(api[val]){
		next();
	}else{
		res.status(404).send('<h1>404 not found</h1>');// send 404
	}
});


////////////////////////////////////////////////	

router.get('/api/auth/:drive', function(req, res) {
	console.log('routing rest.js /api/auth/:drive');
	var service = api[req.params.drive];
	var url = service.getAuthURL();
	console.log('redirect to ' + url);

	var result = {
		success : true,
		logined : true,
		redirectUrl : url
	};

	res.send(result);
});

router.get('/api/redirect/:drive', function(req, res) {
	console.log('routing rest.js /api/redirect/:drive');
	var service = api[req.params.drive];

	service.getToken(req.query.code)
	.then(function(tokens){
		//set token to session
		req.session[req.params.drive] = tokens;

		//TODO
		// save refresh token to database

		var result = {
			success : true,
			logined : true,
			drive	: req.params.drive
		};

		res.send(result);
	})
	.done();
});

/////////////////////////////

router.get('/api/info/:drive',function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/download/dropbox', function(req, res) {
	var client = api.dropbox;
	var driveConfig = req.session.dropbox;

	client.downloadFilePipe(
		req.query.i,
		driveConfig.access_token,
		driveConfig.refresh_token,
		res
	)
	.progress(function(progress){
		console.log("download progress:" + progress.progress);
	})
	.catch(function(err){
		console.log('ERROR when rest.js GET /api/download/dropbox');
		console.log(err);
	})
	.then(function(){
		console.log('finish download');
	}).done();
});

router.get('/api/download/onedrive', function(req, res) {
	var client = api.onedrive;
	var driveConfig = req.session.onedrive;

	client.downloadFilePipe(
		req.query.i,
		driveConfig.access_token,
		driveConfig.refresh_token,
		res
	);
});

router.get('/api/download/:drive', function(req, res) {
	var client = api[req.params.drive];
	var driveConfig = req.session[req.params.drive];

	client.downloadFile(req.query.i,driveConfig.access_token,driveConfig.refresh_token)
	.then(function(result)
	{
		if(result.success){
			res.writeHead(200, {
				'Content-Type': result.contentType,
				'Content-Length': result.contentLength,
				'Content-Disposition': 'attachment;'
			});
			res.write(result.file);
			res.end();
		}else{
			res.send(result);
		}
	})
	.done();
});

router.get('/api/upload/:drive',function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/delete/:drive',function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/fileIndex/:drive', function(req, res) {
	var client = api[req.params.drive];
	var driveConfig = req.session[req.params.drive];

	client.getFileIndex(req.query.i,driveConfig.access_token,driveConfig.refresh_token)
	.then(function(result)
	{
		result.logined = true;
		res.send(result);
	})
	.done();
});

router.get('/api/sharelink/:drive',function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/move/:drive',function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/across/:drive',function(req,res){
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});

	var time = 0;
	function pushData(val){
		res.write("data: " + val + '\n\n');
	}
	
	function closeConnecetion(){
		res.writeHead(200,{
			'Content-Type': 'text/event-stream',
			'Connection': 'close'
		});
		res.end();
	}

	function keepPushData(){
		time++;
		var result = {
			progress: time
		};
		result = JSON.stringify(result);
		pushData(result);

		if(time > 5){
			closeConnecetion();
		}

		setTimeout(function(){keepPushData();},1000);
	}
	keepPushData();
});




module.exports = router;
