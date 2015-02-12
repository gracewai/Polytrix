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
		var client = api[drive._type];
		if(client){
			req.drive = drive;
			var now = new Date();
			if(drive._type == 'dropbox' || now < drive.expires_on ){
				next();
			}else{
				client.renewToken(drive.refresh_token)
				.then(function(data){
					if(data.access_token){
						drive.access_token = data.access_token;
					}
					if(data.expires_on){
						drive.expires_on = new Date(data.expires_on);
					}
					console.log('===drive');
					console.log(drive);
					console.log('===user');
					console.log(req.user);
					req.user.save();
					next();
				})
				.done();
			}
			return;
		}
	}

	_404.send(res);// send 404
};