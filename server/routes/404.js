var path = require('path');

var _404 = {
	path: path.join(__dirname + '/../../client/app/404.html'),
	send: function(res){
		console.log(_404.path);
		res.status(404).sendFile(_404.path);
	}
};

module.exports =  _404;