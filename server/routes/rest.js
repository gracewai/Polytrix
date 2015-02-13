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
//		quota GET
//		across (SSE GET) move file/folder across drive. use Server-Sent Event to receive moving progress
//
'use strict';

var router = require('express').Router();
var DriveCtrl = require('../controllers/drive');
var DriveAuthorization = require('../controllers/auth');
var Middlewares = require('./middlewares');
var requireLogined = Middlewares.requireLogined;

////=================================
//	Params middleware assertion

router.param('drive', Middlewares.validateParamDrive);

router.param('driveId', Middlewares.validateParamDriveId);

////=================================
//	Drive authorization

// Redirect to drive authorization link
router.get('/api/auth/:drive', requireLogined, DriveAuthorization.authUrl);

// Not an api, for internal uses
router.get('/api/auth/:drive/redirect', requireLogined,
	DriveAuthorization.redirect.requireCode,
	DriveAuthorization.redirect.handle);


////=================================
//	Cache

// Get the cache
router.get('/api/drive/cache/:driveId/', requireLogined,
	DriveCtrl.cache.get);

// Request the cache to be synced from drive provider
router.get('/api/drive/cache/:driveId/update/', requireLogined,
	DriveCtrl.cache.update);

// Get the file metadata from the cache
router.get('/api/drive/cache/:driveId/:fileId/', requireLogined,
	Middlewares.functionNotImplemented);

// Check the consistency of the file between drive provider and get the file metadata
router.get('/api/drive/cache/:driveId/:fileId/check', requireLogined,
	DriveCtrl.cache.check);


////=================================
//	Drive

// Get the drive information
router.get('/api/drive/:driveId/info/', requireLogined,
	Middlewares.functionNotImplemented);

// Get the drive qouta information
router.get('/api/drive/:driveId/qouta/', requireLogined,
	DriveCtrl.qouta);


////=================================
//	File

// Get the metadata
router.get('/api/drive/:driveId/:fileId/', requireLogined,
	Middlewares.functionNotImplemented);

// Download the file (redirect to the file's download link)
router.get('/api/drive/:driveId/:fileId/download/', requireLogined,
	DriveCtrl.file.download);

// Create a file
router.get('/api/drive/:driveId/new/', requireLogined,
	Middlewares.functionNotImplemented);

// Create and upload a file
router.post('/api/drive/:driveId/new/', requireLogined,
	Middlewares.functionNotImplemented);

// Upload the file
router.post('/api/drive/:driveId/:fileId/', requireLogined,
	DriveCtrl.file.upload);

// List out the files in a folder
router.get('/api/drive/:driveId/:fileId/list/', requireLogined,
	DriveCtrl.file.list);

// Delete the file
router.delete('/api/drive/:driveId/:fileId/', requireLogined,
	Middlewares.functionNotImplemented);

// Move the file
router.get('/api/drive/:driveId/:fileId/move/', requireLogined,
	Middlewares.functionNotImplemented);

// Move the file across drives
router.get('/api/drive/:driveId/:fileId/across/', requireLogined,
	Middlewares.functionNotImplemented);

// Get the share link of the file
router.get('/api/drive/:driveId/:fileId/share/', requireLogined,
	Middlewares.functionNotImplemented);

// Create a share link of the file
router.post('/api/drive/:driveId/:fileId/share/', requireLogined,
	Middlewares.functionNotImplemented);

// Remove the share link of the file
router.delete('/api/drive/:driveId/:fileId/share/', requireLogined,
	Middlewares.functionNotImplemented);


module.exports = router;
