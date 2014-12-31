'use strict';

var Q = require('q');
var User = require('../database/user');


var loginModule = {};

// return promise
loginModule.registerLocal = function(uid, upw, name, email){
	if(uid && upw && name && email){
		return User.register(uid,name,{
			_type:'local',
			upw:upw,
			email:email
		});
	}else{
		console.log('login.js registerLocal passed value not set');
		throw new Error('login.js registerLocal passed value not set');
	}
};

module.exports = loginModule;