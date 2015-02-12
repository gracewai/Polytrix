var api = require('polytrix-core-api');

module.exports.list = function(req, res) {
	console.log('routing rest.js /api/fileIndex/:driveId');

	var drive = req.drive;
	var client = api[drive._type];

	client.getFileIndex(req.params.fileId,drive.access_token,drive.refresh_token)
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
