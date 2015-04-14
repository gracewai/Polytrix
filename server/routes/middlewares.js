var api = require('polytrix-core-api');
var _404 = require('./404');
var Usage = require('../database/activity');
var crypto = require('crypto');
//var request = require('request');

module.exports.functionNotImplemented = function(req,res){
	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
};


module.exports.validateParamDrive = function(req, res, next, val){
	console.log('routing rest.js :drive');
	if(api[val]){
		next();
	}else{
		_404.send(res);// send 404
	}
};

module.exports.validateParamDriveId = function(req, res, next, val){
	console.log('routing rest.js :driveId');
	var drive = req.user.getDrive(req.params.driveId);

	if(drive){
		var service = api[drive._type];
		if(service){
			req.apiClient = service.client(drive.access_token,drive.refresh_token);
			req.drive = drive;
			next();
			return;
		}
	}

	_404.send(res);// send 404
};

module.exports.updateAccountDetails = function(req,res, next){
	req.user.name = req.body.name?req.body.name:req.user.name;
	req.user.password = req.body.password?req.body.password:req.user.password;
	req.user.email = req.body.email?req.body.email:req.user.email;
	req.user.save();
};

module.exports.streamBegin = function(req,res,next){
	req.event.beginTime = new Date();
	next();
};

module.exports.genertateShortenUrl = function(req,res,next){
	var api_key = '31e735f3da507cb3b3c8c4909b35152d544c7595f956498b791ef56faab1a5461f929a0e337057b8574b3edf422a1d15e0f5aea4745525152b672711';
	var api_url = 'https://io.dev:3010/api/'
};

module.exports.forwardStreamEventLog = function(req,res,next){
	var eventID = crypto.createHash('sha1').update(req.event.beginTime+req.event.filename).digest('hex');
	var dataUsage = new Usage({
		size: req.event.filesize,
		type: req.event.type,
		origin: req.event.origin,
		endpoint: req.event.destination,
		record: eventID
	});
	dataUsage.save();
}

module.exports.renewToken = function(req,res,next,val){
	var drive = req.drive;
	var now = new Date();
	if(drive._type == 'dropbox' || now < drive.expires_on ){
		next();
	}else{
		req.apiClient.auth.renewToken(drive.refresh_token)
		.then(function(data){
			if(data.access_token){
				drive.access_token = data.access_token;
			}
			if(data.expires_on){
				drive.expires_on = new Date(data.expires_on);
			}
			console.log('Refreshed the token for ' + drive._type);
			req.user.save();
			next();
		})
		.done();
	}
};

module.exports.requireLogined = function(req, res, next){
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
};

module.exports.chainMiddlewares = function(){
	var _arguments = arguments;
	return function(req,res,next,val){
		var funcs = Array.prototype.slice.call(_arguments);
		function _next(){
			if(funcs.length){
				var func = funcs.shift();
				func(req,res,_next,val);
			}else{
				next();
			}
		}
		_next();
	};
};

// module.exports.paramDriveIdMiddlewares = function(req,res,next,val){
// 	if(!req.user){
// 		var result = {
// 			success : false,
// 			logined : false,
// 			msg : 'user not logined'
// 		};

// 		return res.send(result);
// 	}
// 	///
// 	console.log('routing rest.js :driveId');
// 	var drive = req.user.getDrive(req.params.driveId);

// 	if(!drive){
// 		return _404.send(res);
// 	}
// 	var service = api[drive._type];
// 	if(service){
// 		req.apiClient = service.client(drive.access_token,drive.refresh_token);
// 		req.drive = drive;
// 	}
// 	///
// 	var drive = req.drive;
// 	var now = new Date();
// 	if(drive._type == 'dropbox' || now < drive.expires_on ){
// 		next();
// 	}else{
// 		req.apiClient.auth.renewToken()
// 		.then(function(data){
// 			if(data.access_token){
// 				drive.access_token = data.access_token;
// 			}
// 			if(data.expires_on){
// 				drive.expires_on = new Date(data.expires_on);
// 			}
// 			console.log('Refreshed the token for ' + drive._type);
// 			req.user.save();
// 			next();
// 		})
// 		.done();
// 	}
// };