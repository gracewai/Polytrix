'use strict';

/**
 * @ngdoc service
 * @name clientApp.Search
 * @description
 * # Search
 * Service in the clientApp.
 */
angular.module('clientApp')
.service('Search',['Global',function(Global){
  var self = this;

  this.search = function(searchText){
    var tests = [];
    tests.push(new FileNameTest(searchText));
		var result = [];
    for(var i in Global.drives.val){
      searchDrive(Global.drives.val[i].cache.cachedIndex,tests,result);
    }
    return result;
  };
  
    
  function searchDrive(drive,tests,result){
    function _traverseSearch(identifier,path){
      
      var index = drive[identifier];
      var fullpath = path + index.name;
      index.matches = 0;
      for(var i in tests){
        if(tests[i].test(index,fullpath)){
          if(index.matches)
            index.matches++;
          else
            index.matches = 1;
          index.fullpath = fullpath;
        }
      }
      if(index.matches)
        result.push(index);

      if(index.is_folder){
        for(var i = 0; i < index.files.length; i++){
          _traverseSearch(index.files[i],path + index.name + '/');
        }
      }
    }
    var rootIdentifier = drive.rootIndex;
    _traverseSearch(rootIdentifier,'');


    return result;
  }
  
  //
  //FileNameTest
  //
	var FileNameTest = function(val){
    var str = val.split(' ').join('');
    function replace(str){
      return str.replace('\\','\\\\')
          .replace('$','\\$')
          .replace('+','\\+')
          .replace('.','\\.')
          .replace('/','\\/')
          .replace('|','\\|')
          .replace('(','\\(')
          .replace(')','\\)')
          .replace('[','\\[')
          .replace(']','\\]')
          .replace('{','\\{')
          .replace('}','\\}');
    }
    var split = str.split('');
    for(var i = 0;i<split.length;i++){
      split[i] = replace(split[i]);
    }
    var regex_string = '.*' + split.join('.*') + '.*';
    this.testVal = new RegExp(regex_string,'i');
  };
  FileNameTest.prototype.test = function(file,path){
    var re = this.testVal.test(path);
    //console.log(path + ' :\t' + re);
    return re;
  };
     

  
}]);