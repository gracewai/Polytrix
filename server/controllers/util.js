
var util = function(){};

util.requireArg = function(arg,argName,tag,js){
	argName = argName || 'argument';
	
	if(js)	{ js  = ', js: '  + js;  } else { js  = ''; }
	if(tag)	{ tag = ', tag: ' + tag; } else { tag = ''; }
	
	if(!arg)
		throw new Error(argName + ' is required but not set' + tag + js);
};

util.exists = function(arg){
	return !(typeof arg == "undefined");
};

module.exports = util;