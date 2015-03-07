// routes for user REST API
//
//	author: BrianSo
//	date:	2014-01-01
//
//	REST link format:
//		/api/account/[action]
//
//	actions:
//		status GET		return login status
//		info GET		return infomation of user and drives id
//		activity		return recent activity of current user
//

'use strict';

var router = require('express').Router();
var UserCtrl = require('../controllers/user');
var Logging = require('../controllers/user/logging');
var Middlewares = require('./middlewares');
var requireLogined = Middlewares.requireLogined;

// Check whether the user is logined
//
//	GET /api/account/status
//	@return { success: Boolean, logined: Boolean } loginStatus
//
router.get('/api/account/status',
	UserCtrl.status);

// Get a user's public info or current logined user's details
//
//	GET /api/account/info
//	@params	{String}(optional) uid
//  @params {String}(optional) email
//	@return { success: Boolean, logined: Boolean } loginStatus
//
router.get('/api/account/info/',
	UserCtrl.info);

// Get current user's recent activity
//
//	GET /api/account/activity
//	@return {
//		success: Boolean
//		logined: Boolean
//		activities: [{
//			beginTime: { type: Date, default: Date.now },
//			type: String,
//			status: String,
//			uid: String,
//			undoable: Boolean,
//			cancelable: Boolean,
//			content: Schema.Types.Mixed
//		}]
//	}
//
router.get('/api/account/activity/', requireLogined,
	Middlewares.functionNotImplemented);

router.get('/api/account/log/', requireLogined, 
	UserCtrl.log);

module.exports = router;