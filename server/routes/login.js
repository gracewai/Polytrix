// routes for user login
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();
var userLogin = require('../controllers/login');
var passport = require('passport');

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
//	@para{string} strategy	!important indicate using which platform to log in. Accept local, facebook currently
//	@para{string} uid		used when using local strategy
//	@para{string} upw		used when using local strategy
//	@return redirect /login?failure=trur&strategy=String[&msg=String]
//
router.post('/login', function(req, res, next) {
	console.log('routing login.js /login');
	switch(req.body.strategy){

	case 'facebook':
		console.log('using facebook strategy');
		passport.authenticate('facebook')(req,res);
		break;


	default:
	case 'local':
		console.log('using local strategy');
		passport.authenticate('local')(req,res,function(err){
			if(err)
				console.log(err);
			if(!req.user){
				res.redirect('/login?failure=true&strategy=local');
			}else{
				res.redirect('/app');
			}
		});
		break;
	}
});

//	POST /register
//
//	@method login
//	@para{string} strategy	!important indicate using which platform to log in. Accept local, facebook currently
//	@para{string} uid		used when using local strategy
//	@para{string} upw		used when using local strategy
//	@para{string} name		used when using local strategy
//	@para{string} email		used when using local strategy
//	@return redirect /login?failure=true&strategy=String[&msg=String]
//
router.post('/register', function(req, res, next) {
	console.log('routing login.js /register');
	switch(req.body.strategy){

	case 'facebook':
		passport.authenticate('facebook')(req,res);
		break;

	default:
	case 'local':
		userLogin.registerLocal(req.body.uid,req.body.upw,req.body.name,req.body.email)
		.then(function(user){
			if(user)
				req.login(user, function(err) {
					if (err) console.log(err);
					if (err) { return next(err); }
					return res.redirect('/app');
				});
			else{
				console.log("logical error login.js /register case local");
				res.redirect('/login?failure=true&strategy=local');
			}
		})
		.catch(function(err){
			console.log(err);
			res.redirect('/login?failure=true&strategy=local&msg='+err);
		});
		break;
	}
});

//	POST /logout
//
//	@method logout
//	@return redirect /logout
//
router.post('/logout', function(req, res, next) {
	console.log('routing login.js /logout');
	res.logout();
	res.redirect('/logout');	//redirect to GET request
});


//passport redirects
router.get('/login/redirect/facebook',passport.authenticate('facebook',
	{
		successRedirect: '/app/',
		failureRedirect: '/login?failure=true&strategy=facebook'
	}
));


function requireLogined(req, res, next){
	if(req.user){
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