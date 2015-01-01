'use strict';

var express = require('express');
var router = express.Router();
var requireLogined = require('./login').requireLogined;
var api = require('polytrix-core-api');

router.get('/account/addDrive/:drive', requireLogined, function(req, res) {
	console.log('routing index.js /account/addDrive/:drive');
	res.redirect('/api/auth/' + req.params.drive);
});

module.exports = router;
