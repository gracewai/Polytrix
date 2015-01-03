// routes for user REST API
//
//	author: BrianSo
//	date:	2014-01-01
//
//	REST link format:
//		/api/account/[action]
//
//	actions:
//		status GET		return login status and basic info
//		info GET		return infomation of user and drives id
//

'use strict';

var router = require('express').Router();
var requireLogined = require('./login').requireLogined;

router.get('/api/account/status', requireLogined, function(req,res){
	console.log('routing userRest.js /api/account/status');
	if(req.user){
		var user = req.user;
		var result = {
			success : true,
			logined : true,
			uid		: user.uid,
			name : user.name
		};
		res.send(result);
	}else{
		console.log('logical error, requireLogin middleware using? userRest.js /api/account/status');
	}
});

router.get('/api/account/info/', requireLogined, function(req, res) {
	console.log('routing userRest.js /api/account/info');
	if(req.user){
		var user = req.user;
		var passport = user.passport;
		var result = {
			success : true,
			logined : true,
			uid		: user.uid,
			name : user.name,
			passportType : passport._type,
			drives: []
		};
		
		for(var i in user.drives){
			var drive = user.drives[i];
			if(drive.id && drive._type)
				result.drives.push({
					id: drive.id,
					type: drive._type
				});
		}

		switch(passport._type){
		case 'local':
			result.info = {
				displayName: passport.name,
				emails: [{
					value: passport.email,
					type: 'Verification email',
					photos: passport.photos
				}]
			};
			break;
		case 'facebook':
			result.info = {
				provider: 	passport.provider,
				displayName: passport.displayName,
				emails:	passport.emails,
				photos: passport.photos
			};
			break;
		default:
			break;
		}
		res.send(result);
	}else{
		console.log('logical error, requireLogin middleware using? userRest.js /api/account/info');
	}
});

module.exports = router;