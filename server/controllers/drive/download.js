
var api = require('polytrix-core-api');

module.exports = function(req, res) {
	try{
		var drive = req.drive;
		var client = api[drive._type];
		if(client.downloadFileLink){
			client.downloadFileLink(
				req.query.i,
				drive.access_token,
				drive.refresh_token)
			.then(function(link){
				console.log('donwload link gotten: ' + link);
				res.redirect(link);
			})
			.catch(function(err){
				console.log(err);
				res.send('unsuccess getting file link');
			});
		}
		else if(client.downloadFilePipe){
			client.downloadFilePipe(
				req.query.i,
				drive.access_token,
				drive.refresh_token,
				res
			);
		}else{
			client.downloadFile(req.query.i,drive.access_token,drive.refresh_token)
			.then(function(result)
			{
				if(result.success){
					res.writeHead(200, {
						'Content-Type': result.contentType,
						'Content-Length': result.contentLength,
						'Content-Disposition': 'attachment;'
					});
					res.write(result.file);
					res.end();
				}else{
					res.send(result);
				}
			})
			.done();
		}
	}catch(err){
		console.log(err);
	}
};