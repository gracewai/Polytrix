
var uploadHandler = require('./upload');
module.exports.upload = uploadHandler.upload;
module.exports.createAndUpload = uploadHandler.createAndUpload;

var download = require('./download');
var operation = require('./operation');

var metadataHandler = require('./metadata');

module.exports = {
    upload:uploadHandler.upload,
    createAndUpload:uploadHandler.createAndUpload,

    download:download,
    operation:operation,

    list:metadataHandler.list,
    getMetadata:metadataHandler.getMetadata,
    patch:metadataHandler.patch,

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
