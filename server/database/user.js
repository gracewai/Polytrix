var mongoose = require('mongoose');
var Q = require('q');
var util = require('../controllers/util');
var Schema = mongoose.Schema;
var js = 'database/user.js';
var redirectCtrl = require('../controllers/auth/redirect');

var userSchema = new Schema({
	uid			: String,
	name		: String,
	email		: String,
	serviceType : String,
	passport	: Schema.Types.Mixed,

	// passport content:
	// {
	//	_type: String,
	//
	//
	//	//for _type=local
	//	upw: String,
	//
	//	//for _type=facebook,twitter & others
	//		reference to http://passportjs.org/guide/profile/
	// }


	registerDate: { type: Date, default: Date.now },
	photoUse	: { type: Number, default: -1 },
	photos		: [String],
	drives		: [
		{
			id: String, // normally user id
			_type: String,
			access_token: String,
			refresh_token: String,
			expires_on: Date,
			account_info: Schema.Types.Mixed,
		}
	],
	nextDriveId: {type: Number, default: 1},



	facebook: Schema.Types.Mixed,
	twitter: Schema.Types.Mixed
	// setttings: {

	// }
});




//
//	find user
//


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

userSchema.statics.findUserByEmail = function(email){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		_this.findOne({ email: email }, function(err, user){
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








//
//	login, register related
//
function createNewUser(uid,name,email,passport,options){
	var newUser = new User({
		uid: uid,
		name: name,
		email: email,
		serviceType : null,
		passport: passport,
		drives: []
	});

	if(util.exists(options.photoUse))	newUser.photoUse	= options.photoUse;
	if(options.photos)		newUser.photos		= options.photos;

	newUser.save();
	console.log('new user created:');
	console.log(newUser);
	return newUser;
}

userSchema.statics.register = function(uid,name,email,passport,options){
	var User = this;
	options = options || {};
	if(!passport)
		throw new Error('missing argument passport');

	if(options.skipCheck){
		return Q.fcall(function(){return createNewUser(uid,name,email,passport,options);});
	}else{
		return Q.fcall(function(){
			util.requireArg('uid',uid,'register',js);
			util.requireArg('name',name,'register',js);
			util.requireArg('passport',passport,'register',js);
		})
		.then(function(){
			return User.findUser(uid);
		})
		.catch(function(err){
			console.log(err);
		})
		.then(function(user){
			if(!user){
				return createNewUser(uid,name,email,passport,options);
			}else{
				console.log('user already exist');
				console.log(user);
				throw new Error('user already exist');
			}
		}).then(redirectCtrl.handleTesseract);
	}
};

// return promise{new user}
userSchema.statics.registerLocal = function(uid, upw, name, email){
	util.requireArg('uid',uid,'registerLocal',js);
	util.requireArg('upw',upw,'registerLocal',js);
	util.requireArg('name',name,'registerLocal',js);
	util.requireArg('email',email,'registerLocal',js);

	return this.register(uid,name,email,{
		_type:'local',
		upw:upw,
		emails: [{
			value: email,
			type: 'Verification email',
		}],
	});
};

//return promise{new user}
userSchema.statics.registerFacebook = function(accessToken, refreshToken, profile){
	util.requireArg('accessToken',accessToken,'registerFacebook',js);
	util.requireArg('refreshToken',refreshToken,'registerFacebook',js);
	util.requireArg('profile',profile,'registerFacebook',js);

	profile._type='facebook';
	profile.access_token = accessToken;
	profile.refresh_token = refreshToken;

	var email = '';
	if(profile.emails)
		email = profile.emails[0];
	var options = {skipCheck:true};
	if (profile.photos){
		options.photoUse = 0;
		options.photos = profile.photos;
	}
	return this.register('fb' + profile.id,profile.displayName,email,profile, options);
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








//
// drives
//
userSchema.methods.addDrive = function(drive){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		//validate drive
		if(drive && drive._type){
			switch(drive._type){
			case 'googledrive':
			case 'onedrive':
			case 'dropbox':
            case 'tesseract':
				_this.nextDriveId = _this.nextDriveId || 1;
				drive.id = drive.id || 'nu' + (_this.nextDriveId++) ;

				var existed = false;
				for(var i in _this.drives){
					if(_this.drives[i].id == drive.id){
						existed = true;
						reject({
							error: 'drive already added.',
							details: drive
						});
						break;
					}
				}
				if(!existed){
					_this.drives.push(drive);
					_this.save();
					resolve(_this);
				}
				break;
			default:
				reject({
					error: 'unsupported drive type',
					details: drive
				});
			}
		}else{
			reject({
				error: 'invalid passed value',
				details: drive
			});
		}
	});
};

userSchema.methods.getDrive = function(driveId){
	var drives = this.drives;
	for(var i in drives){
		var drive = drives[i];
		if(drive.id == driveId){
			return drive;
		}
	}
	return null;
};

userSchema.methods.removeDrive = function(driveId){
	throw new Error('function not implemented');
};




//
//info
//

//return user infos without security infomation like access_token
userSchema.methods.getFilteredInfo = function(){
	var user = this;

	var passport = user.passport;
	var result = {
		uid		: user.uid,
		name : user.name,
		email : user.email,
		photo: this.photos[this.photoUse] || null,
		passportType : passport._type,
		drives: []
	};

	//filter drives
	for(var i in user.drives){
		var drive = user.drives[i];
		if(drive.id && drive._type)
			result.drives.push({
				id: drive.id,
				type: drive._type
			});
	}

	//construct result.info
	switch(passport._type){
	case 'local':
		result.info = {
			displayName: passport.name,
			photos: user.photos
		};
		break;
	case 'facebook':
		result.info = {
			provider: 	passport.provider,
			displayName: passport.displayName,
		};
		break;
	default:
		break;
	}

	result.info.emails = passport.emails;
	result.info.photos = user.photos;

	return result;
};

//return user public infomation
userSchema.methods.getPublicInfo = function(){
	return {
		uid: this.uid,
		name: this.name,
		email: this.email,
		photo: this.photos[this.photoUse],
		registerDate: this.registerDate
	}
};





//
//	user settings
//
userSchema.methods.setPassword = function(newPw){
	this.password = newPw;
	this.save();
};





var User = mongoose.model('User', userSchema);
module.exports = User;
