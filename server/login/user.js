var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	uid			: String,
	upw			: String,
	accountType	: { type: String, default: local },
	registerDate	: { type: Date, default: Date.now },
	dirves		: [
		{
			id: String,
			type: String,
			access_token: String,
			refresh_token: String
		}
	]
});

userSchema.statics.findUser = function(callback){
	return this.find({ uid: uid }, callback);
};

userSchema.methods.validate = function(password){
	return this.upw == password;
};

module.exports = mongoose.model('User', userSchema);
