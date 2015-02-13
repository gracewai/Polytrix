var mongoose = require('mongoose');

var ip = '127.0.0.1';
var port = '27017';
var db = 'polytrixTest1';

mongoose.connect('mongodb://'+ip+':'+port+'/' + db);
console.log('connected to mongodb server');

module.exports = mongoose;
module.exports.ip = ip;
module.exports.port = port;
module.exports.db = db;