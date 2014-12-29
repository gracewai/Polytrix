'use strict';

var express = require('express');
var router = express.Router();

//var api = require('polytrix-core-api');
var api = require('../node_modules/polytrix-core-api/main');


function requireLogined(req, res, next){
	console.log('routing index.js requireLogined');
	var sess = req.session;
	if(sess.uid){
		req.uid = sess.uid;
		next();
	}else{
		
		var result = {
			success : false,
			logined : false,
			msg : 'user not logined'
		};

		res.send(result);
	}
}

// check param drive
router.param('drive', function(req, res, next, val){
	console.log('routing index.js :drive');
	if(api[val]){
		next();
	}else{
		res.status(404).send('<h1>404 not found</h1>');// send 404
	}
});

router.get('/api/auth/:drive', requireLogined, function(req, res) {
	console.log('routing index.js /api/auth/:drive');
	var service = api[req.params.drive];
	var url = service.getAuthURL();
	console.log('redirect to ' + url);

	var result = {
		success : true,
		logined : true,
		redirectUrl : url
	}

	res.send(result);
});

router.get('/api/redirect/:drive', requireLogined, function(req, res) {
	console.log('routing index.js /api/redirect/:drive');
	var service = api[req.params.drive];

	service.setToken(req)
	.then(function(savedData){

		var result = {
			success : true,
			logined : true,
			drive	: req.params.drive
		};

		res.send(result);
	})
	.done();
});

// //dropbox

// router.get('/api/auth/dropbox', function(req, res) {
// 	var url = api.dropbox.getAuthURL();
// 	res.write('<a href="' + url + '">');
// 	res.write(url);
// 	res.write('</a>');
// 	res.end();
// });
// router.get('/api/redirect/dropbox', function(req, res) {
// 	api.dropbox.setToken(req)
// 	.then(function(savedData){
// 		res.send(savedData);
// 	})
// 	.done();
// });

// //onedrive

// router.get('/api/auth/onedrive', function(req, res) {
// 	var url = api.onedrive.getAuthURL();
// 	res.write('<a href="' + url + '">');
// 	res.write(url);
// 	res.write('</a>');
// 	res.end();
// });
// router.get('/api/redirect/onedrive', function(req, res) {
// 	api.onedrive.setToken(req)
// 	.then(function(savedData){
// 		res.send(savedData);
// 	})
// 	.done();
// });

// //googledrive

// router.get('/api/auth/googledrive', function(req, res) {
// 	var url = api.googledrive.getAuthURL();
// 	res.write('<a href="' + url + '">');
// 	res.write(url);
// 	res.write('</a>');
// 	res.end();
// });
// router.get('/api/redirect/googledrive', function(req, res) {
// 	api.googledrive.setToken(req)
// 	.then(function(savedData){
// 		res.send(savedData);
// 	})
// 	.done();
// });


module.exports = router;
