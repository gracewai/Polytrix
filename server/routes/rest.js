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
var CacheIndex = require('../database/cacheindex');
var User = require('../database/user');
var UploadHandler = require('../controllers/upload');
var Log = require('../controllers/log');
var Q = require('q');

var requireLogined = require('./login').requireLogined;

var DriveCtrl = require('../controllers/drive');
var Middlewares = require('./middlewares');

router.param('drive', Middlewares.validateParamDrive);

router.param('driveId', Middlewares.validateParamDriveId);
////////////////////////////////////////////////

//	GET /api/auth/[drive name]
//	@method drive
//	@return /redirect to auth link/ & finally redirect to reurl
//
router.get('/api/auth/:drive', requireLogined, DriveCtrl.authlink);

// GET /api/redirect/:drive
//
//
// @return  /redirect to reurl/
router.get('/api/redirect/:drive', requireLogined,
	DriveCtrl.authRedirect.requireCode,
	DriveCtrl.authRedirect.handle);

/////////////////////////////

router.get('/api/info/:driveId', requireLogined,
	Middlewares.functionNotImplemented);

router.get('/api/download/:driveId', requireLogined,
	DriveCtrl.download);

router.post('/api/upload/:driveId', requireLogined,
	DriveCtrl.upload);

router.get('/api/delete/:driveId', requireLogined,
	Middlewares.functionNotImplemented);

router.get('/api/cache/check/:driveId/:identifier', requireLogined,
	DriveCtrl.cache.check);

router.get('/api/cache/update/:driveId', requireLogined,
	DriveCtrl.cache.update);

router.get('/api/cache/get/:driveId', requireLogined,
	DriveCtrl.cache.get);

router.get('/api/fileIndex/:driveId', requireLogined,
	DriveCtrl.file.list);

router.get('/api/sharelink/:driveId', requireLogined,
	Middlewares.functionNotImplemented);

router.get('/api/move/:driveId', requireLogined,
	Middlewares.functionNotImplemented);

//! function not implemented
router.get('/api/across/:driveId', requireLogined,
	Middlewares.functionNotImplemented);


module.exports = router;








// router.get('/api/across/:driveId',

// function(req,res){
// 	res.writeHead(200, {
// 		'Content-Type': 'text/event-stream',
// 		'Cache-Control': 'no-cache',
// 		'Connection': 'keep-alive'
// 	});

// 	var time = 0;
// 	function pushData(val){
// 		res.write("data: " + val + '\n\n');
// 	}

// 	function closeConnecetion(){
// 		res.writeHead(200,{
// 			'Content-Type': 'text/event-stream',
// 			'Connection': 'close'
// 		});
// 		res.end();
// 	}

// 	function keepPushData(){
// 		time++;
// 		var result = {
// 			progress: time
// 		};
// 		result = JSON.stringify(result);
// 		pushData(result);

// 		if(time > 5){
// 			closeConnecetion();
// 		}

// 		setTimeout(function(){keepPushData();},1000);
// 	}
// 	keepPushData();
// }
