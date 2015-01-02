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


// local
passport.use('local',new LocalStrategy(
	{
		usernameField: 'uid',
		passwordField: 'upw'
	},
	function(uid,upw,done){
		User.findUser(uid)
		.then(function(user){

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

		User.findUser(profile.id)
		.then(function(user){
			if(!user){
				//create one
				profile._type='facebook';
				profile.access_token = accessToken;
				profile.refresh_token = refreshToken;

				User.register(profile.id,profile.displayName,profile, true)
				.then(function(newUser){
					done(null, newUser);
				})
				.catch(function(err){
					done(err);
				})
				.done();
			}else{
				done(null, user);
			}
		})
		.catch(function(err){
			done(err);
		})
		.done();
	}
));

//