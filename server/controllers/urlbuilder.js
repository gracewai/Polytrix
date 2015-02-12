
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
	var url = this._url;

	var first = true;
	for(var key in this.query){
		if(first){
			first = false;
			url += '?';
		}else{
			url += '&';
		}
		url += encodeURIComponent(key) + '=' + encodeURIComponent(this.query[key]);
	}

	return url;
};

module.exports = function(url){
	return new UriBuilder(url);
};