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
// @param driveId
router.get('/api/drive/cache/:driveId/',
	DriveCtrl.cache.get);

// Request the cache to be synced from drive provider
// @param driveId
router.get('/api/drive/cache/:driveId/update/',
	DriveCtrl.cache.update);

// Get the file metadata from the cache
// @param driveId
// @param fileId
router.get('/api/drive/cache/:driveId/:fileId/',
	Middlewares.functionNotImplemented);

// Check the consistency of the file between drive provider and get the file metadata
// @param driveId
// @param fileId
router.get('/api/drive/cache/:driveId/:fileId/sync',
	DriveCtrl.cache.sync);


////=================================
//	Drive

// Get the drive information
// @param driveId
router.get('/api/drive/:driveId/info/',
	Middlewares.functionNotImplemented);

// Get the drive qouta information
// @param driveId
router.get('/api/drive/:driveId/quota/',
	DriveCtrl.qouta);


// Users profile and settings update implementation

router.post('/api/account/update',
	Middlewares.updateAccountDetails);

////=================================
//	File

// Get the metadata
// @param driveId
// @param fileId
router.get('/api/drive/:driveId/:fileId/',
    Middlewares.functionNotImplemented,
    DriveCtrl.file.getMetadata);

// Download the file (redirect to the file's download link)
// @param driveId
// @param fileId
router.get('/api/drive/:driveId/:fileId/download/',
	DriveCtrl.file.download);

// Create a file or folder
// @param driveId
// @param fileId - the destination folder's id
// @param name - the name of the new file or folder
router.get('/api/drive/:driveId/:fileId/new/',
    Middlewares.functionNotImplemented,
    DriveCtrl.file.operation.create);

// Create and upload a file
// @param driveId
// @param fileId - the destination folder's id
// @param name - the name of the new file or folder
// @param (in multipart body) size - the size of the file
router.post('/api/drive/:driveId/:fileId/new/',
    Middlewares.streamBegin,
	DriveCtrl.file.createAndUpload,
    Middlewares.streamEnd);

// Upload the file
// @param driveId
// @param fileId
// @param (in multipart body) size - the size of the file
router.post('/api/drive/:driveId/:fileId/',
	Middlewares.streamBegin,
	DriveCtrl.file.upload,
    Middlewares.streamEnd);

//router.get('/api/share/:fileId', 
//	Middlewares.generateShortenUrl);

// List out the files in a folder
// @param driveId
// @param fileId - the folder's id
router.get('/api/drive/:driveId/:fileId/list/',
	DriveCtrl.file.list);

// Delete the file
// @param driveId
// @param fileId
router.delete('/api/drive/:driveId/:fileId/',
    Middlewares.functionNotImplemented,
    DriveCtrl.file.operation.remove);

// Rename the file or folder
// @param driveId
// @param fileId
// @param name - new name
router.patch('/api/drive/:driveId/:fileId/',
    Middlewares.functionNotImplemented,
	DriveCtrl.file.patch);

// Copy the file
// @param driveId
// @param fileId
// @param destinationFileId - the destination folder's id
router.get('/api/drive/:driveId/:fileId/copy/',
    Middlewares.functionNotImplemented,
    DriveCtrl.file.operation.copy);

// Move the file
// @param driveId
// @param fileId
// @param destinationFileId - the destination folder's id
router.get('/api/drive/:driveId/:fileId/move/',
	DriveCtrl.file.operation.move);

// Move the file across drives
// @param driveId
// @param fileId
// @param fileName
// @param destinationDriveId - the destination drive's id
// @param destinationFileId - the destination folder's id
router.get('/api/drive/:driveId/:fileId/across/',
	DriveCtrl.file.operation.across);

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
