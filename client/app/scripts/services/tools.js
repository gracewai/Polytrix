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
		},
		timeAgo: function(before){
			var now = new Date();
			var diff = now - before;
			var seconddiff = (diff)/1000;
			var mindiff = seconddiff/60;
			var hourdiff = mindiff/60;
			var daydiff = hourdiff/24;


			if(seconddiff<60)
			{
				var sec = Math.floor(seconddiff);
				var s = sec == 1 ? '' : 's';
				return sec + ' second' + s + ' ago';
			}
			else if(mindiff < 60)
			{
				var min = Math.floor(mindiff);
				var s = min == 1 ? '' : 's';
				return min + ' min' + s + ' ago';
			}
			else if(hourdiff < 24)
			{
				var hr = Math.floor(hourdiff);
				var s = hr == 1 ? '' : 's';
				return hr + ' hour' + s + ' ago';
			}
			else if(daydiff < 7)
			{
				var day = Math.floor(daydiff);
				var s = day == 1 ? '' : 's';
				return day + ' day' + s + ' ago';
			}  
			else
			{
				return before.getFullYear() + '-' + (before.getMonth() + 1) + '-' + before.getDate();
			}
		}
	};
  });
