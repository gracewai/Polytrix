
module.exports.upload = require('./upload');
module.exports.download = require('./download');

module.exports.list = function(req, res) {
	console.log('routing rest.js /api/fileIndex/:driveId');

	req.apiClient.metadata.listFile(req.params.fileId)
	.then(function(result)
	{
		result.logined = true;
		res.send(result);
	})
	.done();
};



// router.get('/api/across/:driveId',

// function(req,res){
// 	res.writeHead(200, {
// 		'Content-Type': 'text/event-stream',
// 		'Cache-Control': 'no-cache',
// 		'Connection': 'keep-alive'
// 	});

// 	var time = 0;
// 	function pushData(val){
// 		res.write("data: " + val + '\n\n');
// 	}

// 	function closeConnecetion(){
// 		res.writeHead(200,{
// 			'Content-Type': 'text/event-stream',
// 			'Connection': 'close'
// 		});
// 		res.end();
// 	}

// 	function keepPushData(){
// 		time++;
// 		var result = {
// 			progress: time
// 		};
// 		result = JSON.stringify(result);
// 		pushData(result);

// 		if(time > 5){
// 			closeConnecetion();
// 		}

// 		setTimeout(function(){keepPushData();},1000);
// 	}
// 	keepPushData();
// }
