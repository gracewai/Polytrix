var api = require('polytrix-core-api');
var Q = require('q');

var Log = require('../log');
var CacheIndex = require('../../database/cacheindex');
var UrlBuilder = require('../urlbuilder');

module.exports.requireCode = function(req, res, next) {
	console.log('routing rest.js /api/redirect/:drive');

	if(req.query.code){
		next();
	}else{
		var error = req.query.error || 'unknown';
		res.redirect(redirectLink(false,error));
	}

};

module.exports.handle = function(req,res){
	var service = api[req.params.drive];
	
	service.getToken(req.query.code)
	.then(function(tokens){

		var drive = createDrive(type,tokens);
		if(!drive)return;

		return req.user.addDrive(drive)
		.then(function(user){

			Log.linkDrive(user,drive);
			var cache = CacheIndex.create(user.uid,drive);

			res.redirect(redirectLink(true,req.params.drive));

			followUpActions(req.user.uid,drive,cache);
		})
		.catch(function(err){

			console.log(err);

			res.redirect(redirectLink + '?redirect=drive&success=0&drive=' + req.prams.drive);
		});
	})
	.done();
};







function redirectLink(success, driveOrError){
	var url = UrlBuilder('/console/#settings');
	url.query.redirect = 'drive';
	url.query.success = success ? '1' : '0';
	if(success){
		url.query.drive = driveOrError;
	}else{
		url.query.error = driveOrError;
	}
	return url.build();
}

function createDrive(type,tokens){
	if(!tokens.access_token){
		console.log('/api/redirect/:drive controller/drive/authredirect.js - no access token get');
		console.log(tokens);
		return;
	}

	if(type != 'dropbox' && !tokens.refresh_token){
		console.log('/api/redirect/:drive controller/drive/authredirect.js - no refresh token get');
		console.log(tokens);
		return;
	}


	var drive = {
			_type: type,
			expires_on: tokens.expires_on || new Date(),
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token
	};
	if(tokens.driveid) drive.id = tokens.driveid;

	return drive;
}


function followUpActions(uid,drive,cache){
	try{

		//followup actions
		//--cache--
		console.log('cache');
		var begin;
		Q.Promise(function(resolve){
			setTimeout(function(){
				resolve();
			},500);
		})
		.then(function(){
			begin = new Date();
			return cache.update();
		}).then(function(){
			var timeUsed = new Date() - begin;
			Log.updateCache(req.user,drive,timeUsed);
		})
		.done();

		// update account info
		// console.log('account info');
		// service.accountInfo(drive.access_token,drive.refresh_token)
		// .then(function(accountInfo){
		// 	return User.findUser(uid)
		// 	.then(function(user){
		// 		user.getDrive(drive.id).accountInfo = accountInfo;
		// 		user.save();
		// 	});
		// })
		// .done();
	}catch(err){
		console.log(err);
	}
}
