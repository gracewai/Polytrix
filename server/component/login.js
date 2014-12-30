'use strict';

var Q = require('q');

var loginModule = {};

loginModule.login = function(uid, upw){
	return Q.Promise(function(reslove){

		var result = {
			success : true,
			logined : true,
			msg : 'login successful'
		};

		reslove(result);
	});
};

loginModule.logout = function(session){
	return Q.Promise(function(reslove,reject){
		var errOccur = false;
		session.destroy(function(err) {
			errOccur = true;
			reject(err);
		});
		if(!errOccur){

			var result = {
				success : true,
				logined : false,
				msg : 'logout successful'
			};

			reslove(result);
		}
	});
};

loginModule.register = function(uid, upw, email){

};

module.exports = loginModule;