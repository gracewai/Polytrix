//  passport strategies for how user are stored and logined
//
//	author: BrianSo
//	date:	2014-12-31

var passport = require('passport'),
	LocalStrategy = require('passport-local'),
	FacebookStrategy = require('passport-facebook');

var User = require('../database/user');
//
passport.serializeUser(function(user, done) {
	done(null, user.uid);
});

passport.deserializeUser(function(uid, done) {
	User.findUser(uid).then(function(user){
		done(null, user);
	}).catch(function(err){
		done(err);
	});
});

var validateEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// local
passport.use('local',new LocalStrategy(
	{
		usernameField: 'uid',
		passwordField: 'upw'
	},
	function(uid,upw,done){

		function validateEmail(email) {
			return validateEmailRegex.test(email);
		};

		var userPromise;
		if(validateEmail(uid)){
			userPromise = User.findUserByEmail(uid);
		}else{
			userPromise = User.findUser(uid);
		}

		userPromise.then(function(user){

			if(user){
				var valid = user.validPassword(upw);

				if(valid.ok){
					console.log('user ' + user.name + ' found:');
					console.log(user);
					done(null,user);
				}else{
					console.log(valid.msg);
					done(null,false,valid.msg);
				}
			}else{
				done(null, false, { message: 'Can not find user' });
			}
		})
		.catch(function(err){
			done(err);
		})
		.done();
	}
));

// facebook
passport.use('facebook',new FacebookStrategy(
	{
		clientID:'785665464845719',
		clientSecret:'4bb26ec85319d8d3f57d483b3dc651c0',
		callbackURL: '/login/redirect/facebook'
	},
	function(accessToken, refreshToken, profile, done){
		
		User.findUser('fb' + profile.id)
		.then(function(user){
			if(!user){
				//create one
				try{
					User.registerFacebook(accessToken, refreshToken, profile)
					.then(function(newUser){
						done(null, newUser);
					})
					.catch(function(err){
						console.log('error#3');
						console.log(err);
						done(err);
					})
					.done();
				}catch(err){
					console.log('error#2');
					console.log(err);
					done(err);
				}
			}else{
				done(null, user);
			}
		})
		.catch(function(err){
			console.log('error#1');
			console.log(err);
			done(err);
		})
		.done();

		
	}
));

//