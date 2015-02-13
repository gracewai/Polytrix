var api = require('polytrix-core-api');

module.exports = function(req, res) {
	console.log('routing rest.js /api/auth/:drive');
	var service = api[req.params.drive];
	var url = service.getAuthURL();

	if(req.query.reurl){
		req.session.driveRedirectUrl = req.query.reurl;
	}
	res.redirect(url);
};