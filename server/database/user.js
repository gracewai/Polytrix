var mongoose = require('mongoose');
var Q = require('q');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	uid			: String,
	name		: String,
	passport	: Schema.Types.Mixed,
	
	// passport content:
	// {
	//	_type: String,
	//	
	//	//for _type=local
	//	upw: String,
	//	email: String,
	//
	//	//for _type=facebook,twitter & others
	//	profile: Mixed
	// }


	registerDate	: { type: Date, default: Date.now },
	dirves		: [
		{
			id: String, // normally user id
			_type: String,
			access_token: String,
			refresh_token: String
			//expire on: store in session
		}
	]
});

userSchema.statics.register = function(uid,name,passport,skipCheck){
	var User = this;
	var check;

	function createNewUser(){
		var newUser = new User({
			uid: uid,
			name: name,
			passport: passport,
			dirves: []
		});
		newUser.save();
		console.log('new user created:');
		console.log(newUser);
		return newUser;
	}

	if(skipCheck){
		return Q.fcall(createNewUser);
	}else{
		if(!uid)
			return Q.fcall(function(){ throw new Error('uid not set'); });
		if(!name)
			return Q.fcall(function(){ throw new Error('name not set'); });
		if(!passport)
			return Q.fcall(function(){ throw new Error('passport not set'); });

		return User.findUser(uid)
		.catch(function(err){
			console.log(err);
		})
		.then(function(user){
			if(!user){
				return createNewUser();
			}else{
				console.log(user);
				throw new Error('user already exit');
			}
		});
	}
};

userSchema.statics.findUser = function(uid){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		_this.findOne({ uid: uid }, function(err, user){
			if (err){
				var _err = {
					error: 'mongoose error',
					details: err
				};
				reject(_err);
			}else{
				resolve(user);
			}
		});
	});
};

userSchema.methods.addDrive = function(drive){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		//validate drive
		if(drive._type){
			switch(drive._type){
			case 'googledrive':
			case 'onedrive':
			case 'dropbox':
				_this.drives.push(drive);
				_this.save();
				resolve(_this);
				break;
			default:
				var err = {
					error: 'unsupported drive type',
					details: drive
				};
				reject(err);
			}
		}else{
			var err = {
				error: 'invalid passed value',
				details: drive
			};
			reject(err);
		}
	});
};

userSchema.methods.validPassword = function(upw){
	var ok = false;
	var msg = '';

	if(this.passport._type == 'local'){
		if(this.passport.upw == upw){
			ok = true;
		}else{
			msg = 'incorrect password';
		}
	}else{
		msg = 'user passport type not local';
	}

	return {
		ok: ok,
		msg: msg
	};
};

userSchema.methods.removeDrive = function(driveId){
	throw new Error('function not implemented');
};

var User = mongoose.model('User', userSchema);
module.exports = User;
