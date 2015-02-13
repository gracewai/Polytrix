var Busboy = require('busboy');
var Q = require('q');
// class UploadHandler
// 

// constructor
var Handler = function(cb){
	if(cb) this.start = cb;
	this.deferred = Q.defer();
	this.promise = this.deferred.promise;
};

// main logic of handling
Handler.prototype.process = function(req){
	var _this = this;
	var status = {received: 0};

	var busboy = new Busboy({ headers: req.headers });

	//console.log(req.headers['content-length']);

	busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
		status[fieldname] = val;
		//console.log('Field [' + fieldname + ']: value: ' + val);
	});

	busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
		//console.log(status.path + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

		status.filename = filename;
		if(_this.cbStart)
			cbStart(file,status);

		file.on('data', function(data) {
			status.received += data.length;
			var progress = status.received/status.filesize;

			if(_this.cbData)
				_this.cbData(data,progress,file,status);
			if(_this.cbProgress)
				_this.cbProgress(progress,file,status);
			if(_this.deferred)
				_this.deferred.notify(progress);
			//console.log(status.path + filename + ' got ' + data.length + ' bytes');
			//console.log('progress: ' + status.received/status.filesize);
		});

		file.on('end', function() {
			if(_this.cbEnd)
				_this.cbEnd(file,status);
			//console.log(status.path + filename + ' Finished');
		});
	});

	busboy.on('finish', function() {
		//console.log('Done parsing form!');
		_this.deferred.resolve('Done parsing form!');
	});

	req.pipe(busboy);
};

// allow add callback function(file, status)
Handler.prototype.onstart = function(cb){
	this.cbStart = cb;
};

// allow add callback function(data, progress, file, status)
Handler.prototype.ondata = function(cb){
	this.cbData = cb;
};

// allow add callback function(progress, file, status)
Handler.prototype.onprogress = function(cb){
	this.cbProgress = cb;
};

// allow add callback function(file, status)
Handler.prototype.onend = function(cb){
	this.cbEnd = cb;
};

module.exports = Handler;