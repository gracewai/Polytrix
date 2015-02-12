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
var User  = require('../database/user');
var Log  = require('../controllers/log');
var requireLogined = require('./login').requireLogined;

// Check whether the user is logined
//
//	GET /api/account/status
//	@return { success: Boolean, logined: Boolean } loginStatus
//
router.get('/api/account/status', function(req,res){
	console.log('routing userRest.js /api/account/status');

	var result = {
		success : true,
		logined : !!req.user,
	};

	res.send(result);
});

// Get a user's public info or current logined user's details
//
//	GET /api/account/info
//	@params	{String}(optional) uid
//  @params {String}(optional) email
//	@return { success: Boolean, logined: Boolean } loginStatus
//
router.get('/api/account/info/', function(req, res) {
	console.log('routing userRest.js /api/account/info');

	if(req.query.uid || req.query.email){
		var user;

		if(req.query.uid){
			user = User.findUser(req.query.uid);
		}else{
			user = User.findUserByEmail(req.query.email);
		}

		user
		.then(function(user){
			if(user){
				res.send({
					success:true,
					logined:!!req.user,
					userInfo: user.getPublicInfo()
				});
			}else{
				res.send({
					success:false,
					logined:!!req.user,
					notFound: true
				});
			}
		})
		.catch(function(err){
			res.send({
				success:false,
				logined:!!req.user,
				msg: err
			});
		})
		.done();
		
	}else if(req.user){
		
		res.send({
			success:true,
			logined:!!req.user,
			userInfo: req.user.getFilteredInfo()
		});

	}else{
		res.send({
			success: false, logined: false, msg: 'no user sepicified, please give uid'
		});
	}
});

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
router.get('/api/account/activity/', requireLogined, function(req, res) {
	console.log('routing userRest.js /api/account/activity');

	res.send({
		success:false,
		logined: true,
		msg: 'unimplemented route'
	})

});

router.get('/api/account/log/', requireLogined, function(req, res) {
	console.log('routing userRest.js /api/account/log');

	var limit = req.query.limit || 0;

	Log.findLogsByUser(req.user.uid,limit)
	.then(function(docs){

		res.send({
			success: true,
			logined: true,
			logs: docs,
		});
	})
	.done();
});

module.exports = router;