var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//
//	For system log, dashborad, statistic.
//
var Log;

var logSchema = new Schema({
	time: { type: Date, default: Date.now },
	type: String,
	message: String,
	uid: String,
	extras: Schema.Types.Mixed
});

logSchema.statics.log = function(uid,type,message,extras){
	var log = new Log({uid:uid,type:type,message:message,extras:extras});
	log.save();
};

Log = mongoose.model('Log', logSchema);
module.exports = Log;
