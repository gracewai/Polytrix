// routes for user login
//
//	author: BrianSo
//	date:	2014-12-27

'use strict';

var router = require('express').Router();
var User = require('../database/user');
var passport = require('passport');
var Log = require('../controllers/log');

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
router.get('/passport/:strategy',function(req,res,next){
	console.log('routing login.js /passport/:strategy');
	switch(req.params.strategy){
	case 'facebook':
		passport.authenticate('facebook')(req,res,next);
		break;
	default:
		_404.send(res);
		//response 404
		break;
	}
});

//	POST /login
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
		passport.authenticate('facebook')(req,res,next);
		break;


	default:
	case 'local':
		console.log('using local strategy');
		passport.authenticate('local')(req,res,function(err){
			if(err)
				console.log(err);
			if(!req.user){
				res.send({
					success: false,
					logined: false,
					msg: 'not implemented error message'
				});
			}else{
				Log.login(req);
				res.send({
					success: true,
					logined: true
				});
			}
		});
		break;
	}
}, function(req,res){
	//callback of passport
});

//	POST /register
//
//	@method register
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
		User.registerLocal(req.body.uid,req.body.upw,req.body.name,req.body.email)
		.then(function(user){
			if(user)
				req.login(user, function(err) {
					if (err) console.log(err);
					if (err) { return next(err); }
					Log.createAccount(req);
					Log.login(req);
					res.send({
						success: true,
						logined: true
					});
				});
			else{
				console.log("logical error login.js /register case local");
				res.send({
					success: false,
					logined: false,
					msg: 'not implemented error message'
				});
			}
		})
		.catch(function(err){
			console.log(err);
			res.send({
				success: false,
				logined: false,
				msg: 'not implemented error message'
			});
		});
	}
});

//	POST /logout
//
//	@method logout
//	@return redirect /logout
//
router.post('/logout', function(req, res, next) {
	console.log('routing login.js /logout');
	try{
		req.logout();

		var result = {
			success:true,
			logined:false
		};

		res.send(result);
	}catch(err){

		var result = {
			success: false,
			logined: !!req.user,
			msg: 'unknown error'
		};
		console.log('login.js /logout error:');
		console.log(err);
		res.send(result);
	}
	//res.redirect('/logout');	//redirect to GET request
});


//passport redirects
router.get('/login/redirect/facebook',passport.authenticate('facebook',
	{
		successRedirect: '/console/',
		failureRedirect: '/?failure=true&strategy=facebook'
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