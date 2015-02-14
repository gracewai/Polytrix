var api = require('polytrix-core-api');

module.exports.info = function(req,res){
	
};

module.exports.qouta = function(req,res){

	var service = api[req.params.drive];

	req.apiClient.info.usageQouta();

	var result = {
		success: false,
		logined: true,
		msg: 'function not implemented'
	};
	res.send(result);
};