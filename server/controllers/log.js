//	log.js
//	
//	provide functions to log a messages to the database
//
//
var Q = require('q');
var Log = require('../database/log');

var Type = {
	DRIVE_MANIPULATION : 'Drive manipulation',
	UNDO_DRIVE_MANIPULATION : 'Undo drive manipulation',
	ACCOUNT_SETTING : 'Account setting',
	UNDO_ACCOUNT_SETTING : 'Undo account setting',
	LOGGING : 'Logging',
	ACCOUNT_CREATION : 'Account creation'
};

var logCtrl = {
	createAccount: function(req){
		if(!req.user)
			throw new Error('Logical error, user not logined, at log.js logCtrl.createAccount()');
		var user = req.user;
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		var client = ip.split(',').shift();

		Log.log(user.uid,Type.ACCOUNT_CREATION,'Account was created  at ' + client,{uid: user.uid, username: user.name, proxy: ip});
	},
	login: function(req){
		if(!req.user)
			throw new Error('Logical error, user not logined, at log.js logCtrl.login()');
		var user = req.user;
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		var client = ip.split(',').shift();

		Log.log(user.uid,Type.LOGGING,'You logined at ' + client,{uid: user.uid, proxy: ip});
	},
	logout: function(req){
		if(!req.user)
			throw new Error('Logical error, user not logined, at log.js logCtrl.logout()');
		var user = req.user;
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		var client = ip.split(',').shift();

		Log.log(user.uid,Type.LOGGING,'You logouted at ' + client,{uid: user.uid, proxy: ip});
	},
	addDrive: function(user,drive){
		Log.log(user.uid,Type.ACCOUNT_SETTING,'You have linked a ' + drive._type + ' to your account ',{uid: user.uid, proxy: ip});
	},
	removeDrive: function(user,drive){
		Log.log(user.uid,Type.ACCOUNT_SETTING,'You have unlinked a ' + drive._type + ' from your account ',{uid: user.uid, proxy: ip});
	},


	//
	findLogsByUser: function(uid){
		return Q.Promise(function(reslove, reject){
			Log.find({ uid: uid }, function (err, docs) {
				console.log(docs);
				reslove(docs);
			});
		});
	},
};

logCtrl.Type = Type;

module.exports = logCtrl;