var api = require('polytrix-core-api');

module.exports.list = function(req, res) {
	console.log('routing rest.js /api/fileIndex/:driveId');

	var drive = req.drive;
	var client = api[drive._type];

	client.getFileIndex(req.query.i,drive.access_token,drive.refresh_token)
	.then(function(result)
	{
		result.logined = true;
		res.send(result);
	})
	.done();
};
