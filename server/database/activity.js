var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//
//	indicate user's recent activities
//

var activitySchema = new Schema({
	beginTime: { type: Date, default: Date.now },
	type: String,
	status: String,
	uid: String,
	undoable: Boolean,
	cancelable: Boolean,
	content: Schema.Types.Mixed
});

activitySchema.statics.types = {
	DRIVE_MANIPULATION : 'Drive manipulation'
};

activitySchema.statics.status = {
	ACTIVE : 'active',
	FINISH : 'finish',
	WAITING : 'waiting', //waiting to be active
};

var Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;

//problems:
//
// how to design a reversible activity algorithm