var api = require('polytrix-core-api');

module.exports.info = function(req,res){
	
};

module.exports.qouta = function(req,res){

	var service = api[req.params.drive];

	service.getQouta(req.drive.access_token,req.drive.refresh_token);

	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
};