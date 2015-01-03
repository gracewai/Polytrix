// routes for REST resources
//
//	author: BrianSo
//	date:	2014-12-27
//
//	REST link format:
//		/api/[action]/[drive id]/?i=[the drive resources identifier]&other_arguments
//	example:
//		/api/download/1/?i=study%20files/year1%20sem%20A/ast20401/lecture/lec1.pptx
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
var _404 = require('./404');
var api = require('polytrix-core-api');

var requireLogined = require('./login').requireLogined;

//router.use('/api',requireLogined);

router.param('drive', function(req, res, next, val){
	console.log('routing rest.js :drive');
	if(api[val]){
		next();
	}else{
		_404.send(res);// send 404
	}
});

router.param('driveId', function(req, res, next, val){
	console.log('routing rest.js :driveId');
	var drive = req.user.getDrive(req.params.driveId);
	
	if(drive){
		var client = api[drive._type];
		if(client){
			req.drive = drive;
			var now = new Date();
			if(drive._type == 'dropbox' || now < drive.expires_on ){
				next();
			}else{
				client.renewToken(drive.refresh_token)
				.then(function(data){
					if(data.access_token){
						drive.access_token = data.access_token;
					} 
					if(data.expires_on){
						drive.expires_on = new Date(data.expires_on);
					} 
					console.log('===drive');
					console.log(drive);
					console.log('===user');
					console.log(req.user);
					req.user.save();
					next();
				})
				.done();
			}
			return;
		}
	}

	_404.send(res);// send 404
});


////////////////////////////////////////////////	

//	GET /api/auth/[drive name]
//	@method drive
//	@param reurl (optional) the redirect link after authorization
//	@return /redirect to auth link/ & finally redirect to reurl
//
router.get('/api/auth/:drive', requireLogined, function(req, res) {
	console.log('routing rest.js /api/auth/:drive');
	var service = api[req.params.drive];
	var url = service.getAuthURL();
	console.log('redirect to ' + url);

	if(req.query.reurl){
		req.session.driveRedirectUrl = req.query.reurl;
	}

	var result = {
		success : true,
		logined : true,
		redirectUrl : url
	};

	res.send(result);
});

//
// GET /api/redirect/:drive
//
//
// @return  successful msg |Or| /redirect to reurl/
router.get('/api/redirect/:drive', requireLogined, function(req, res) {
	console.log('routing rest.js /api/redirect/:drive');
	var service = api[req.params.drive];

	service.getToken(req.query.code)
	.then(function(tokens){
		//set token to session
		var drive = {
			_type: req.params.drive,
			expires_on: tokens.expires_on || new Date(),
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token
		};

		if(req.params.drive != 'dropbox' && !tokens.refresh_token){
			console.log('rest.js /api/redirect/:drive');
			console.log('no refresh token get');
			console.log(tokens);
			return;
		}

		return req.user.addDrive(drive)
		.then(function(user){
			console.log(drive);

			var result = {
				success : true,
				logined : true,
				drive	: req.params.drive
			};

			res.send(result);
		})
		.catch(function(err){

			console.log(err);

			var result = {
				success : false,
				logined : true,
				drive	: req.params.drive,
				msg		: err
			};

			res.send(result);
		});
	})
	.done();
});

/////////////////////////////

router.get('/api/info/:driveId', requireLogined, function(req,res){
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

router.get('/api/download/:driveId', requireLogined, function(req, res) {
	var drive = req.drive;
	var client = api[drive._type];

	if(client.downloadFilePipe){
		client.downloadFilePipe(
			req.query.i,
			drive.access_token,
			drive.refresh_token,
			res
		);
	}else{
		client.downloadFile(req.query.i,drive.access_token,drive.refresh_token)
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
	}
});

router.get('/api/upload/:driveId', requireLogined, function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/delete/:driveId', requireLogined, function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/fileIndex/:driveId', function(req, res) {
	console.log('routing rest.js /api/fileIndex/:driveId');
	
	var drive = req.drive;
	var client = api[drive._type];

	client.getFileIndex(req.query.i,drive.access_token,drive.refresh_token)
	.then(function(result)
	{
		result.logined = true;
		res.send(result);
	})
	.done();

});

router.get('/api/sharelink/:driveId', requireLogined, function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

router.get('/api/move/:driveId', requireLogined, function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
});

//! function not implemented
router.get('/api/across/:driveId',function(req,res){
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
