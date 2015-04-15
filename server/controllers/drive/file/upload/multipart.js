var Busboy = require('busboy');
var Q = require('q');
// class UploadHandler
// 

// constructor
var Handler = function(handler){
	this.handler = handler;
};

// main logic of handling
Handler.prototype.process = function(req){
	var _this = this;

    //every things will be saved in here
	var status = {
        size: 'unknown'
    };

	var busboy = new Busboy({ headers: req.headers });

	console.log(req.headers['content-length']);

	busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		status[fieldname] = val;
	});

	busboy.on('file', function(fieldname, filestream, filename, encoding, mimetype) {
		status.filename = status.filename || filename;
        status.mimetype = status.mimetype || mimetype;
        filestream.httpVersion = req.httpVersion;
        filestream.headers = req.headers;
        if(_this.handler)_this.handler(filestream, status);
	});

	busboy.on('finish', function() {
		console.log('Done parsing form!');
	});

	req.pipe(busboy);
};

module.exports = Handler;