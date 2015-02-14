

module.exports = function(req, res) {
	console.log('routing rest.js /api/auth/:drive');

	var url = req.apiClient.auth.authUrl();

	res.redirect(url);
};