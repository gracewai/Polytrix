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

var Code = {
	//Drive Manipulation
	NEW_FILE: 101,

	CACHE_SYNC: 151,

	//Account Setting
	PASSWORD_CHANGE: 301,
	UPLOAD_PHOTO: 302,
	LINK_DRIVE:303,
	LINK_TWITTER: 304,
	LINK_FACEBOOK:305,
	UNLINK_DRIVE:306,
	UNLINK_FACEBOOK:307,
	UNLINK_TWITTER: 308,

	//Logging
	LOGIN: 401,
	LOGOUT: 402,


	//Account Creation
	ACCOUNT_CREATION: 601,
};

var logCtrl = {
	log: function(uid,type,code,message,extras){
		Log.log(uid,type,code,message,extras);
	},
	createAccount: function(req){
		if(!req.user)
			throw new Error('Logical error, user not logined, at log.js logCtrl.createAccount()');
		var user = req.user;
		var ip = req.headers['x-forwarded-for'] ||
			req.connection.remoteAddress ||
			req.socket.remoteAddress ||
			req.connection.socket.remoteAddress;

		var client = ip.split(',').shift();

		Log.log(user.uid,Type.ACCOUNT_CREATION,Code.ACCOUNT_CREATION,'Account was created  at ' + client,{uid: user.uid, username: user.name, proxy: ip});
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

		Log.log(user.uid,Type.LOGGING,Code.LOGIN,'You logged in at ' + client,{uid: user.uid, proxy: ip});
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

		Log.log(user.uid,Type.LOGGING,Code.LOGOUT,'You logged out at ' + client,{uid: user.uid, proxy: ip});
	},
	linkDrive: function(user,drive){
		Log.log(user.uid,Type.ACCOUNT_SETTING,Code.LINK_DRIVE,'You have linked a ' + drive._type + ' to your account ',{drive_type:drive._type, drive_id: drive.id});
	},
	unlinkDrive: function(user,drive){
		Log.log(user.uid,Type.ACCOUNT_SETTING,Code.UNLINK_DRIVE,'You have unlinked a ' + drive._type + ' from your account ',{drive_type:drive._type, drive_id: drive.id});
	},

	updateCache: function(user, drive, timeUsed){
		Log.log(user.uid,Type.DRIVE_MANIPULATION,Code.CACHE_SYNC,'You synced the ' + drive._type,{drive_type:drive._type,drive_id:drive.id,timeUsed:timeUsed});
	},

	//
	findLogsByUser: function(uid,limit){
		return Q.Promise(function(reslove, reject){
			var q = Log.find({uid:uid}).sort({'time':-1});
			if(limit){
				q.limit(limit);
			}
			q.exec(function (err, docs) {
				reslove(docs);
			});
		});
	},
};

logCtrl.Type = Type;
logCtrl.Code = Code;

module.exports = logCtrl;