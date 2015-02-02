
var util = function(){};

util.exists = function(arg){
	return (typeof arg !== 'undefined');
};

util.throwError = function(errorMsg, tag, js, details){
	if(js) console.log('error occurs in ' + js);
	if(tag) console.log('error tag: ' + tag);
	if(details) console.log('error details: ' + details);
	throw new Error(errorMsg);
};

util.requireArg = function(arg,argName,tag,js){
	if(arg)
		return;

	argName = argName || 'argument';

	util.throwError(argName + ' is required but not set',tag,js);
};

module.exports = util;