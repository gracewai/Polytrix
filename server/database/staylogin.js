var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var util = require('../controllers/util');
var Q = require('q');

// user uses '{uid}md5(token)' to autologin
var staySchema = new Schema({
	uid			: String,
	token		: String
});

staySchema.statics.generateToken = function(){
	var date = new Date();
	var md5 = util.md5(date.toString());
	return new Buffer(md5).toString('base64');
};

staySchema.statics.findByToken = function(token){
	var _this = this;
	return Q.Promise(function(resolve,reject){
		_this.findOne({ token: token }, function(err, staymatch){
			if (err){
				var _err = {
					error: 'mongoose error',
					details: err
				};
				reject(_err);
			}else{
				resolve(staymatch);
			}
		});
	});
};

var StayLoginToken = mongoose.model('StayLoginToken', staySchema);
module.exports = StayLoginToken;