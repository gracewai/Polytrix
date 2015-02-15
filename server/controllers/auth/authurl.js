var api = require('polytrix-core-api');

module.exports = function(req, res) {
	console.log('routing rest.js /api/auth/:drive');
	try{
		var service = api[req.params.drive]
		var url = service.auth.authUrl();
		res.redirect(url);
	}catch(err){
		console.log(err);
	}
	
};