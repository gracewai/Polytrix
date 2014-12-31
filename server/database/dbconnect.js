var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/polytrixTest1');
console.log('connected to mongodb server');

module.exports = mongoose;