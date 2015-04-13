var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//
//	indicate user's recent activities
//

var activitySchema = new Schema({
	record: String,
	origin: String,
	endpoint: String,
	type: String,
	status: String,
	uid: String,
	time: Date,
	size: Number,
	recipient: String,
	content: Schema.Types.Mixed
});


var Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;

//problems:
//
// how to design a reversible activity algorithm