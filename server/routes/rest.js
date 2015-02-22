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

////=================================
//	Params middlewares assertion

router.param('drive',
	Middlewares.validateParamDrive);

router.param('driveId',Middlewares.chainMiddlewares(
	Middlewares.requireLogined,
	Middlewares.validateParamDriveId,
	Middlewares.renewToken));

////=================================
//	Drive authorization

// Redirect to drive authorization link
router.get('/api/auth/:drive',
	Middlewares.requireLogined,
	DriveAuthorization.authUrl);

// Not an api, for internal uses
router.get('/api/auth/:drive/redirect',
	Middlewares.requireLogined,
	DriveAuthorization.redirect.requireCode,
	DriveAuthorization.redirect.handle);


////=================================
//	Cache

// Get the cache
router.get('/api/drive/cache/:driveId/',
	DriveCtrl.cache.get);

// Request the cache to be synced from drive provider
router.get('/api/drive/cache/:driveId/update/',
	DriveCtrl.cache.update);

// Get the file metadata from the cache
router.get('/api/drive/cache/:driveId/:fileId/',
	Middlewares.functionNotImplemented);

// Check the consistency of the file between drive provider and get the file metadata
router.get('/api/drive/cache/:driveId/:fileId/check',
	DriveCtrl.cache.check);


////=================================
//	Drive

// Get the drive information
router.get('/api/drive/:driveId/info/',
	Middlewares.functionNotImplemented);

// Get the drive qouta information
router.get('/api/drive/:driveId/qouta/',
	DriveCtrl.qouta);


////=================================
//	File

// Get the metadata
router.get('/api/drive/:driveId/:fileId/',
	Middlewares.functionNotImplemented);

// Download the file (redirect to the file's download link)
router.get('/api/drive/:driveId/:fileId/download/',
	DriveCtrl.file.download);

// Create a file or folder
router.get('/api/drive/:driveId/:fileId/new/',
	Middlewares.functionNotImplemented);

// Create and upload a file
router.post('/api/drive/:driveId/:fileId/new/',
	Middlewares.functionNotImplemented);

// Upload the file
router.post('/api/drive/:driveId/:fileId/',
	DriveCtrl.file.upload);

// List out the files in a folder
router.get('/api/drive/:driveId/:fileId/list/',
	DriveCtrl.file.list);

// Delete the file
router.delete('/api/drive/:driveId/:fileId/',
	Middlewares.functionNotImplemented);

// Rename the file
router.patch('/api/drive/:driveId/:fileId/',
	Middlewares.functionNotImplemented);

// Copy the file
router.get('/api/drive/:driveId/:fileId/copy/',
	Middlewares.functionNotImplemented);

// Move the file
router.get('/api/drive/:driveId/:fileId/move/',
	Middlewares.functionNotImplemented);

// Move the file across drives
router.get('/api/drive/:driveId/:fileId/across/',
	Middlewares.functionNotImplemented);

// Get the share link of the file
router.get('/api/drive/:driveId/:fileId/share/',
	Middlewares.functionNotImplemented);

// Create a share link of the file
router.post('/api/drive/:driveId/:fileId/share/',
	Middlewares.functionNotImplemented);

// Remove the share link of the file
router.delete('/api/drive/:driveId/:fileId/share/',
	Middlewares.functionNotImplemented);


module.exports = router;
