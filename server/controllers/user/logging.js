var passport = require('passport');
var User = require('../../database/user');
var Log = require('../log');


module.exports.login = function(req,res,next)
{
};

module.exports.logout = function(req,res,next){
	try{
		req.logout();
		next();
	}catch(err){
		req.unsuccess = true;
		req.myError = err;
		next();
	}
};

module.exports.assertMD5Password = function(req,res,next){
	if(req.body.upw && req.body.upw.length !== 32){
		res.send({
			success: false,
			logined: !!req.user,
			msg: 'invalid input'
		});
		console.log('The password not in hash form, request body: ');
		console.log(req.body);
		return;
	}
	next();
};

module.exports.register = function(req,res,next){
	User.registerLocal(req.body.uid,req.body.upw,req.body.name,req.body.email)
	.then(function(user){
		req.login(user, function(err) {
			if (err) {
				req.unsuccess = true;
				req.myError = err;
			}
			next();
		});
	})
	.catch(function(err){
		req.unsuccess = true;
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
		success: !req.unsuccess,
		logined: !!req.user,
	};
	if(req.unsuccess){
		result.msg = req.myError || 'unknown or not implemented error';
		result.msg = result.msg.toString();
		console.log(result.msg);
	}
	res.send(result);
};