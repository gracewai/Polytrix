

module.exports = function(req, res) {
	var fileId = req.params.fileId;

	try{
		var client = req.apiClient;

		client.metadata.downloadUrl(fileId)
		.then(function(link){
			res.redirect(link);
		})
		.catch(function(err){
			console.log(err);
			res.send('unsuccess getting file link');
		});
		
	}catch(err){
		console.log(err);
	}
};