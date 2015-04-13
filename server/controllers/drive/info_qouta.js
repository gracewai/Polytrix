var api = require('polytrix-core-api');

module.exports.info = function(req,res){
	
};

module.exports.qouta = function(req,res){

	var service = api[req.params.drive];

	req.apiClient.info.usageQouta().then(function(result){
		console.log(result);
		var info = {
			success: true,
			logined: true,
			totalQuota: result.total_bytes,
			usedQuota: result.used_bytes,
		};
		res.send(info);
	});
};