// routes for user login
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();
var User = require('../database/user');
var passport = require('passport');
var Logging = require('../controllers/user/logging');

//	format of loginStatus:
//	{
//		success : Boolean,
//		logined : Boolean,
//		msg : String
//	}
//


//	POST /passport
//
//	@method passport
//	@para{string} strategy	!important indicate using which platform to log in. Accept local, facebook currently
//	@return redirect /login?failure=trur&strategy=String[&msg=String]
//
router.get('/passport/facebook',
	passport.authenticate('facebook'));

//	POST /login
//
//	@method login
//	@para{string} uid		used when using local strategy
//	@para{string} upw		used when using local strategy
//	@return loginStatus
//
router.post('/login',
	Logging.assertMD5Password,
	passport.authenticate('local'),
	Logging.setStayLogin,
	Logging.logLogin,
	Logging.sendStatus);

//	POST /register
//
//	@method register
//	@para{string} strategy	!important indicate using which platform to log in. Accept local, facebook currently
//	@para{string} uid		used when using local strategy
//	@para{string} upw		used when using local strategy
//	@para{string} name		used when using local strategy
//	@para{string} email		used when using local strategy
//	@return loginStatus
//
router.post('/register',
	Logging.assertMD5Password,
	Logging.register,
	Logging.logAccountCreation,
	Logging.logLogin,
	Logging.sendStatus);

//	POST /logout
//
//	@method logout
//	@return loginStatus
//
router.post('/logout',
	Logging.logout,
	Logging.sendStatus);

//passport redirects
router.get('/login/redirect/facebook',
	passport.authenticate('facebook'),
	Logging.logLogin,
	Logging.sendStatus);


module.exports = router;