
var cache = require('./cache');
var file = require('./file');
var info_qouta = require('./info_qouta');

module.exports = {
	cache: cache,
	file: file,
	info: info_qouta.info,
	qouta: info_qouta.qouta
};