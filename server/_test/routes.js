'use strict';
var express = require('express');
var router = express.Router();
var api = require('polytrix-core-api');
var passport = require('passport');
var _404 = require('../routes/404');
var uploadHandlers = require('../controllers/upload');
var CacheIndex = require('../database/cacheindex');

router.use('/test/js',express.static(__dirname + '/views/js'));
router.use('/test/css',express.static(__dirname + '/views/css'));

//	POST /api/upload/task
//	@param{string} type 	(chunked / others)
//	@header{Number} X-Upload-Content-Length
//	@header{string} X-Upload-Content-Type
//
router.post('/test/uploadtask',/* requireLogined ,*/function(req,res){
	function dump(func){
		try{
			func();
		}catch(err){
			console.log(err);
		}
	}

	dump(function(){
		var multipartHandler = new uploadHandlers();
		multipartHandler.onprogress(function(progress,file,status){
			console.log(progress);
		});

		multipartHandler.process(req);
		multipartHandler.onend(function(file, status){
			res.send('file created');
		})
	});

});

router.post('/test/cache/:driveId',function(req,res){
	console.log('/test/cache/:driveId');

	// var drive = req.user.getDrive(req.params.driveId);
	// var cache = CacheIndex.create(req.user.uid,drive);
	// console.log(cache);
	// res.send(cache);

	CacheIndex.findByIDs(req.user.uid, req.params.driveId)
	.then(function(cache){
		console.log('stage 0.1');
		console.log(cache);
		return cache.update();
	})
	.then(function(index){
		res.send(index);
	});
	
	// var drive = req.user.getDrive(req.params.driveId);
	// CacheIndex.findByIDs(req.user.uid,drive.id)
	// .then(function(cache){
	// 	cache.rootIndex.logined = true;
	// 	cache.rootIndex.success = true;
	// 	res.send(cache.rootIndex);
	// });
});

router.post('/test/getFolderInformation/:driveId',function(req,res){
	console.log('route /test/getFolderInformation/:driveId');
	var drive = req.user.getDrive(req.params.driveId);
	

	function next(){
		var drive = req.drive;
		var client = api[drive._type];

		client.getFolderInformation(req.query.i,drive.access_token,drive.refresh_token)
		.then(function(result)
		{
			result.logined = true;
			res.send(result);
		})
		.done();
	}


	if(drive){
		var client = api[drive._type];
		if(client){
			req.drive = drive;
			var now = new Date();
			if(drive._type == 'dropbox' || now < drive.expires_on ){
				next();
			}else{
				client.renewToken(drive.refresh_token)
				.then(function(data){
					if(data.access_token){
						drive.access_token = data.access_token;
					} 
					if(data.expires_on){
						drive.expires_on = new Date(data.expires_on);
					} 
					console.log('===drive');
					console.log(drive);
					console.log('===user');
					console.log(req.user);
					req.user.save();
					next();
				})
				.done();
			}
			return;
		}
	}

});

router.post('/test/upload/:type',function(req,res){
	switch(req.params.type){
	case 'multipart':
		uploadHandlers.multipartUpload(req,res);
		break;
	case 'chunk':
		uploadHandlers.chunkUpload(req,res);
		break;
	default:
		_404.send(res);
		break;
	}
});





router.get('/test/refresh',function(req,res){
	var sess = req.session;
	api.googledrive.renewToken(sess.googledrive.refresh_token);
});

router.use('/test/',express.static(__dirname + '/views/'));

router.get('/test/',function(req,res){
	res.sendFile(__dirname + '/views/test.html');
});

router.get('/test/logined', function(req, res) {
	console.log('routing test/routes.js /test/logined');
	if(!req.user){
		// var user = {
		// 	uid:'test',
		// 	name:'test',
		// 	passport: {
		// 		_type: 'local',
		// 		upw: 'test',
		// 		email: 'test@te.st'
		// 	},
		// 	registerDate: new Date(2000, 1, 1, 0, 0, 0, 0),
		// 	dirves:[
		// 		{
		// 			id: 1,
		// 			_type: 'dropbox',
		// 			access_token: 'r2YJWpOcVrcAAAAAAAABURU0S-a8NfkTWRuG6ljbQ9D4d1FzaLte4wIHXuakTgQP',
		// 			refresh_token: null
		// 		},
		// 		{
		// 			id: 2,
		// 			_type: 'onedrive',
		// 			access_token: 'EwBwAq1DBAAUGCCXc8wU/zFu9QnLdZXy+YnElFkAAV3NdcLGODwXQ1m2pKt2swgJT3kOT+FZBCnH9wZcoVZEVykD0tHy7vg7Y2q9QotIjOrNLi04WzYf6bZYwlWu7lHenx+PpYOqA2ljPu2nsH7cS+grpn7sRbXhB9mIufr+eRYFzByeNhYUxRFBa4qFVRl8ps6AsgjHdj7XjozmytQBJyshUSbomskRtQklhRBm26aJn39DLG0xpGppP6m14K7p8dU5geYMKJ9SX1oljDZeXXcEymBORtnA2Xu2MuzjU7CfwrlS0gxjnK9GvrwcPB4qgOp+YZdhom6LaUJaMV/k2zl0p60MgrCQYJ4GfgW6BjQ5HfiynnNBTldXa2UF4hMDZgAACLYYAZagONUdQAGK/OVS4MR3KDttqVdRaAUZ8lRK7pVJzHV4UjVf+VwTr3QzsmbkyTQHyfl0NTGmGuWyLl+DUetdoVO5bEsgVFfmGQCQi3nQgZK9oDtNLAbsxM6gffEPRDYP3+kUY1PZzasLmX0DShj0KfMHOP900h+8tsU6m1OlETD+e3UcK/uMdl1PL7X+1rKfj/dvDWEmUD2GRmUY7Hg/q38rSIVLqCbJi/dLw2yl5ro916+T7u6ezf2R96mMXq6/+OGNBeQOqviRgL7KvVm5rP03onEZnJpkRtMFdASU9mWztHf6Wvmdk3ee/5bL2QIhvMHoZieU2eXl1o2fCTSB4QT85SRPWulAM8kdO6CKDra3EXdR3MYgNvzEK5tNE8VWpRfwoMNkNcziQlDU8/eQcBqXqxCH88e8SZ2HZO5u5IpMcapqvGQP0lgB',
		// 			refresh_token: 'CjBcqGSoUFGV02C4F9Gim12Hu4K773K!zHAY*LtrDQ2aFCWKQ9vqz6T*85AKZmXrnM4l!DQ*JUb0dvOCkJs6MW427o3ztJ9s9zNsUJEuyIRzxiu7*hG33YS5CpbGKW!Q6E9n3DlmB*IHnE6QB7pNit2ls*HAWOmixVCnvDP2LxrElIq0CbzE!dS2lO8Trcxl6lQ1h9LZojVk!oT6LwweigyNq!kTR!2WKJAoPRntwDvWOWI5mvxh0NYx7eGGa9c1*F0QAbubRP9yYJZ9QhPNnQc5DShXSETbN5FaLFaJDcCG1GCB1BBxq80hnhELdSHxLZxt9xTve*ShUnkiQpezLwZVgvHR0Mw3nwYWjnsYz5R9*Ucsd7JZLJmaGKxUKc!r7tk3T1Jl8QfoBO1!wI4czP0$'
		// 		},
		// 		{
		// 			id: 3,
		// 			_type: 'googledrive',
		// 			access_token: 'ya29.7ADSBxzIaWldiLoZr8I7OVdbfwTakoLc_jU3S_5iMyiwe9piZN5Ef47XhkKwnEWAmeJIBfc6-gnFlA',
		// 			refresh_token: '1/Li-gcOhg70feUi3LZJxLPLWTk7kui9crT3ovaolf3pp90RDknAdJa_sgfheVM0XT'
		// 		}
		// 	]
		// }

		req.body = {
			uid:'test',
			upw:'test'
		};

		passport.authenticate('local')(req,res,function(err){
			if(err)
				console.log(err);
			if(!req.user){
				res.send({success:false,logined:false});
			}else{
				res.send({success:true,logined:true});
			}
		});

		// var sess = req.session;
		// sess.dropbox = {
		// 	access_token:'r2YJWpOcVrcAAAAAAAABURU0S-a8NfkTWRuG6ljbQ9D4d1FzaLte4wIHXuakTgQP',
		// 	refresh_token: null
		// };
		// sess.onedrive = {
		// 	access_token:'EwBwAq1DBAAUGCCXc8wU/zFu9QnLdZXy+YnElFkAAV3NdcLGODwXQ1m2pKt2swgJT3kOT+FZBCnH9wZcoVZEVykD0tHy7vg7Y2q9QotIjOrNLi04WzYf6bZYwlWu7lHenx+PpYOqA2ljPu2nsH7cS+grpn7sRbXhB9mIufr+eRYFzByeNhYUxRFBa4qFVRl8ps6AsgjHdj7XjozmytQBJyshUSbomskRtQklhRBm26aJn39DLG0xpGppP6m14K7p8dU5geYMKJ9SX1oljDZeXXcEymBORtnA2Xu2MuzjU7CfwrlS0gxjnK9GvrwcPB4qgOp+YZdhom6LaUJaMV/k2zl0p60MgrCQYJ4GfgW6BjQ5HfiynnNBTldXa2UF4hMDZgAACLYYAZagONUdQAGK/OVS4MR3KDttqVdRaAUZ8lRK7pVJzHV4UjVf+VwTr3QzsmbkyTQHyfl0NTGmGuWyLl+DUetdoVO5bEsgVFfmGQCQi3nQgZK9oDtNLAbsxM6gffEPRDYP3+kUY1PZzasLmX0DShj0KfMHOP900h+8tsU6m1OlETD+e3UcK/uMdl1PL7X+1rKfj/dvDWEmUD2GRmUY7Hg/q38rSIVLqCbJi/dLw2yl5ro916+T7u6ezf2R96mMXq6/+OGNBeQOqviRgL7KvVm5rP03onEZnJpkRtMFdASU9mWztHf6Wvmdk3ee/5bL2QIhvMHoZieU2eXl1o2fCTSB4QT85SRPWulAM8kdO6CKDra3EXdR3MYgNvzEK5tNE8VWpRfwoMNkNcziQlDU8/eQcBqXqxCH88e8SZ2HZO5u5IpMcapqvGQP0lgB',
		// 	refresh_token:'CjBcqGSoUFGV02C4F9Gim12Hu4K773K!zHAY*LtrDQ2aFCWKQ9vqz6T*85AKZmXrnM4l!DQ*JUb0dvOCkJs6MW427o3ztJ9s9zNsUJEuyIRzxiu7*hG33YS5CpbGKW!Q6E9n3DlmB*IHnE6QB7pNit2ls*HAWOmixVCnvDP2LxrElIq0CbzE!dS2lO8Trcxl6lQ1h9LZojVk!oT6LwweigyNq!kTR!2WKJAoPRntwDvWOWI5mvxh0NYx7eGGa9c1*F0QAbubRP9yYJZ9QhPNnQc5DShXSETbN5FaLFaJDcCG1GCB1BBxq80hnhELdSHxLZxt9xTve*ShUnkiQpezLwZVgvHR0Mw3nwYWjnsYz5R9*Ucsd7JZLJmaGKxUKc!r7tk3T1Jl8QfoBO1!wI4czP0$'
		// };
		// sess.googledrive = {
		// 	access_token:'ya29.7ADSBxzIaWldiLoZr8I7OVdbfwTakoLc_jU3S_5iMyiwe9piZN5Ef47XhkKwnEWAmeJIBfc6-gnFlA',
		// 	refresh_token:'1/Li-gcOhg70feUi3LZJxLPLWTk7kui9crT3ovaolf3pp90RDknAdJa_sgfheVM0XT'
		// };
	}else{
		res.send({success:false,logined:true,msg:'user already logined'});
	}
});

router.get('/unit',function(req,res){
	var test = require('./unitTest');
	test.test();
	res.send('ok');
});

module.exports = router;
