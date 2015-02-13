var User  = require('../../database/user');
var Log  = require('../log');


module.exports.status = function(req,res){
	console.log('routing userRest.js /api/account/status');

	var result = {
		success : true,
		logined : !!req.user,
	};

	res.send(result);
};

module.exports.info = function(req, res){
	console.log('routing userRest.js /api/account/info');

	if(req.query.uid || req.query.email){
		sendUserInfo(req,res);
	}else if(req.user){
		sendSelfInfo(req,res);
	}else{
		res.send({
			success: false, logined: false, msg: 'no user sepicified, please give uid' });
	}
};

module.exports.activity = function(req, res) {

};

module.exports.log = function(req, res) {
	console.log('routing userRest.js /api/account/log');

	var limit = req.query.limit || 0;

	Log.findLogsByUser(req.user.uid,limit)
	.then(function(docs){

		res.send({
			success: true,
			logined: true,
			logs: docs,
		});
	})
	.done();
};




function sendUserInfo(req, res){
	var user;

	if(req.query.uid)
		user = User.findUser(req.query.uid);
	else
		user = User.findUserByEmail(req.query.email);

	user.then(function(user){
		if(user)
			res.send({
				success: true, logined: !!req.user, userInfo: user.getPublicInfo() });
		else
			res.send({
				success: false, logined: !!req.user, notFound: true });
	})
	.catch(function(err){
		res.send({
			success: false, logined: !!req.user, msg: err });
	})
	.done();
}

function sendSelfInfo(req, res){
	res.send({
		success:true, logined:!!req.user, userInfo: req.user.getFilteredInfo() });
}