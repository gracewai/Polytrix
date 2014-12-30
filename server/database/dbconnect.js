var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/polytrix');

module.exports = mongoose;