var User = require('../database/user');

var Test = {};

Test.test = function(verbose){
	this.findUser('test',true,verbose);//found
	this.findUser('hi',false,verbose);//not found
};


Test.findUser = function(val,expectedFound,verbose){
	User.findUser(val)
	.then(function(user){
		console.log('findUser(\''+ val + '\')');
		if(verbose){
			console.log('result:');
			console.log(user);
			console.log(' ');
		}
		var found = (user && user.uid == val) ? true : false;
		if(found == expectedFound){
			console.log('pass!');
		}else{
			console.log('!!! not pass !!!');
		}
	})
	.catch(function(err){
		console.log('findUser(\''+ val + '\')');
		console.log('error:');
		console.log(err);
		console.log(' ');
	}).done();
};






module.exports = Test;