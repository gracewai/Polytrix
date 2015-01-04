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
//

'use strict';

var router = require('express').Router();
var User  = require('../database/user');

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

		res.send({
			success:true,
			logined:!!req.user,
			userInfo: user.getPublicInfo()
		});

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

module.exports = router;