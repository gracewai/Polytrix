
//
//	Usage: var url = UriBuilder();
//	url.query.key = 'val';
//	url = url.build();
//
var UriBuilder = function(url){
	this._url = url;
	this.query = {};
};

UriBuilder.prototype.build = function(){
	var url = '';

	var first = true;
	for(var key in this.query){
		if(first){
			first = false;
			url += '?';
		}else{
			url += '&';
		}
		url += encodeURIComponent(key) + '=' + encodeURIComponent(value);
	};
};

module.exports = function(url){
	return new UriBuilder(url);
};