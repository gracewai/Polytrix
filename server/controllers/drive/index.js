
var download = require('./download');
var authRedirect = require('./authredirect');
var authlink = require('./authlink');
var cache = require('./cache');
var upload = require('./upload');
var file = require('./file');



module.exports = {
	download: download,
	authRedirect: authRedirect,
	authlink: authlink,
	cache: cache,
	upload: upload,
	file: file,
};