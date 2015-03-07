var passport = require('passport');
var User = require('../../database/user');
var StayLoginToken = require('../../database/staylogin');
var Log = require('../log');


module.exports.login = function(req,res,next)
{
};

module.exports.setStayLogin = function(req,res,next){
	try{
		if(typeof req.body.stayLogin !== 'boolean')console.log((new Error('the value is not boolean')).stack);
	if(req.body.stayLogin){
		var token = StayLoginToken.generateToken();
		var stayToken = new StayLoginToken({uid:req.user.uid, token:token});
		res.cookie('staytoken', token, { maxAge: 2592000000, secure: true, httpOnly: true });
		stayToken.save();
	}
	next();
}catch(err){
	console.log(err.stack);
}
	
};

module.exports.handleStayLogin = function(req,res,next){
	if(!req.user && req.cookies && req.cookies.staytoken){
		StayLoginToken.findByToken(req.cookies.staytoken)
		.catch(function(err){
			console.log(err);
			return null;
		})
		.then(function(match){
			if(!match){
				return next();
			}
			return User.findUser(match.uid)
			.then(function(user){
				console.log('---staylogin auto logged in,token match:'+req.cookies.staytoken+'---');
				req.login(user,function(err){
					if (err) {
						console.log(err);
						return next();
					}
					var token = StayLoginToken.generateToken();
					res.cookie('staytoken', token, { maxAge: 2592000000, secure: true, httpOnly: true });
					match.token = token;
					match.save();
					next();
				});
			});
		});
	}else{
		next();
	}
};

module.exports.logout = function(req,res,next){
	try{
		req.logout();
		req.session.destroy(function(err){
			console.log('cannot access session');
			console.log(err);
		});
		if(req.cookies && req.cookies.staytoken){
			StayLoginToken.remove({token: req.cookies.staytoken},function(err){
				if(err)console.log(err.stack || err);
			});
		}
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