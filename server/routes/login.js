// routes for user login
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();
var userLogin = require('../component/login');

//	format of loginStatus:
//	{
//		success : Boolean,
//		logined : Boolean,
//		msg : String
//	}
//

//	POST /logon
//
//	@method login
//	@para{string} uid
//	@para{string} upw
//	@return loginStatus
//
router.post('/login', function(req, res, next) {
	//do login process here
	userLogin.login(req.query.uid,req.query.upw)
	.then(function(result){
		res.send(result);
	}).catch(function(err){
		next(err);
	});
});

//	POST /logout
//
//	@method logout
//	@return loginStatus
//
router.post('/logout', function(req, res, next) {
	//do login process here
	userLogin.logout(req)
	.then(function(result){
		res.send(result);
	}).catch(function(err){
		next(err);
	});
});

function requireLogined(req, res, next){
	var sess = req.session;
	if(sess.uid){
		req.uid = sess.uid;
		next();
	}else{

		var result = {
			success : false,
			logined : false,
			msg : 'user not logined'
		};

		res.send(result);
	}
}

module.exports = router;
module.exports.requireLogined = requireLogined;