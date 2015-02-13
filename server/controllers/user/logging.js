var passport = require('passport');
var User = require('../../database/user');
var Log = require('../log');


module.exports.login = function(req,res,next)
{
};

module.exports.logout = function(req,res){
	try{
		req.logout();
		req.mySuccess = true;
		next();
	}catch(err){
		req.mySuccess =  false;
		req.myError = err;
		next();
	}
};

module.exports.register = function(req,res,next){
	User.registerLocal(req.body.uid,req.body.upw,req.body.name,req.body.email)
	.then(function(user){
		req.login(user, function(err) {
			if (!err) {
				req.mySuccess = true;
			}else{
				req.mySuccess = false;
				req.myError = err;
			}
			next();
		});
	})
	.catch(function(err){
		req.mySuccess = false;
		req.myError = err;
		next();
	});
};

module.exports.logLogin = function(req,res,next){
	Log.login(req);
	next();
};

module.exports.logAccountCreation = function(req,res,next){
	Log.createAccount(req);
	next();
};

module.exports.sendStatus = function(req,res){
	var result = {
		success: !!req.mySuccess,
		logined: !!req.user,
	};
	if(!req.mySuccess){
		result.msg = req.myError || 'unknown or not implemented error';
		result.msg = result.msg.toString();
		console.log(result.msg);
	}
	res.send(result);
};