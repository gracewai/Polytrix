// routes for user login
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();
var userLogin = require('../login/login');

// router.get('/login', function(req, res) {
//   // send the login page file
//   //res.sendFile(__dirname + );
// });


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


module.exports = router;