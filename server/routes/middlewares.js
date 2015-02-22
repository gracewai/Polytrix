var api = require('polytrix-core-api');
var _404 = require('./404');

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