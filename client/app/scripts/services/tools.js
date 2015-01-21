'use strict';

/**
 * @ngdoc service
 * @name clientApp.Tools
 * @description
 * # Tools
 * common tools
 */
angular.module('clientApp')
  .service('Tools', function () {
	return {
		//
		//	keep try selecting elements until it loaded
		//
		selectElement:function(selector, cb, expectedLength, interval, trylimit){
			interval = interval || 100;
			var trytime = trylimit = trylimit || 10;
			function loop(){
				var e = $(selector);
				if(!expectedLength){
					return cb(e);
				}

				if(e.length === expectedLength){
					cb(e);
				}else if(--trytime){
					setTimeout(loop,interval);
				}else{
					console.log('Tool.selectElement:: tried ' + trylimit + ' times still can not select target element ' + selector);
				}
			}
			loop();
		}
	};
  });
