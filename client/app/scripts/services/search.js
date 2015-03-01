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

  var alias = {
    'document' : /document|word/,
    'music' : /music|song|audio/,
    'video' : /film|movie|video|clip/,
    'speardsheet' : /speardsheet|stat/,
    'presentation' : /powerpoint|slide|presentation|keynote/,
    'archive' : /archive|compressed|zip/
  }

  function lastWeekDay(dayofLastWeek){
    var now = new Date();
    var dayofThisWeek = now.getDay();
    var dayToMinus = dayofLastWeek+7-today;
    var begin =  new Date(now - dayToMinus*1000*60*60*24);
    var end = new Date(begin + 1000*60*60*24);
    return {begin:begin,end:now};
  }

  var lastConvertor = {
    lastPeriod : function(days){
      var now = new Date();
      var begin = new Date(now - new Date(days * 1000*60*60*24));
      return {begin:begin,end:now};
    },
    week : function(){
      var now = new Date();
      var day = now.getDay();
      var end = new Date(now - new Date(day * 1000*60*60*24));
      var begin = new Date(end - new Date(7 * 1000*60*60*24));
      return {begin:begin,end:end};
    },
    day : function(){
      return this.lastPeriod(1);
    },
    month: function(){
      var now = new Date();
      var day = now.getDate();
      var end = new Date(now - new Date(day * 1000 * 60 * 60 * 24));
      var begin = new Date(end - new Date(30 * 1000 * 60 * 60 * 24));
      return {begin:begin,end:end};
    },

    year: function(){
      var now = new Date();
      var year = now.getFullYear();
      var begin = (new Date(0)).setFullYear(year - 1);
      var end = (new Date(0)).setFullYear(year);
      return {begin:begin,end:end};
    },
    monday: function(){
      return lastWeekDay(1);
    },
    tuesday: function(){
      return lastWeekDay(2);
    },
    wednesday: function(){
      return lastWeekDay(3);
    },
    thursday: function(){
      return lastWeekDay(4);
    },
    friday: function(){
      return lastWeekDay(5);
    },
    saturday: function(){
      return lastWeekDay(6);
    },
    sunday: function(){
      return lastWeekDay(0);
    }
  }

  this.search = function(searchText){
    var tests = [];
    tests.push(new ShortCutFileNameTest(searchText));
    tests.push(new FileNameTest(searchText));

    var chainTest = [];
    for(var type in alias){
      
      if(alias[type].test(searchText)){
        chainTest.push(new TypeMatch(type));
      }

      var type = null;
      var dateBegin = null;
      var dateEnd = null;

      if(/created/.test(searchText)){
        type = 'created_date';
      }
      if(/modified/.test(searchText)){
        type = 'modified_date';
      }
      if(/last/.test(searchText)){
        for(var i in lastConvertor){
          if(searchText.search(i)!=-1){
            var ans = lastConvertor[i]();
            console.log(ans);
            dateBegin = ans.begin;
            dateEnd = ans.end;
          }
        }
      }
      console.log(type);
        console.log(dateBegin);
        console.log(dateEnd);
      if(type != null && dateBegin != null && dateEnd != null){

        chainTest.push(new DateMatch(type,dateBegin,dateEnd));
      }
    }
    tests.push(chainTest);


		var result = [];
    for(var i in Global.driveCaches.val){
      searchDrive(Global.driveCaches.val[i].cachedIndex,tests,result);
    }
    return result;
  };
  
    
  function searchDrive(drive,tests,result){
    function _traverseSearch(identifier,path){
      
      var index = drive[identifier];
      var fullpath = path + index.name;
      index.matches = 0;
      for(var i in tests){
        if(typeof tests[i].test === 'function'){
          if(tests[i].test(index,fullpath)){
            if(index.matches)
              index.matches++;
            else
              index.matches = 1;
            index.fullpath = fullpath;
          }
        }else if(tests[i].length){
          var pass = true;
          for(var j in tests[i]){
            console.log(tests[i]);
            if(!tests[i][j].test(index,fullpath)){
              pass = false;
            }
          }
          if(pass){
            if(index.matches)
              index.matches++;
            else
              index.matches = 1;
            index.fullpath = fullpath;
          }
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
	var ShortCutFileNameTest = function(val){
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
  ShortCutFileNameTest.prototype.test = function(file,path){
    var re = this.testVal.test(path);
    //console.log(path + ' :\t' + re);
    return re;
  };
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
    str = replace(str);
    this.testVal = new RegExp(str,'i');
  };
  FileNameTest.prototype.test = function(file,path){
    var re = this.testVal.test(path);
    //console.log(path + ' :\t' + re);
    return re;
  };

  var TypeMatch = function(type){
    this.type = type;
  }
  TypeMatch.dictionary = {
    'music':  
    [
      "mp3",
      "aac",
      "flac",
      "aiff",
      "ape",
      "wav",
      "3gp",
      "wma",
      "ogg",
      "m4a"
    ],
    'document':
    [
      "csv",
      "ppt",
      "pptx",
      "xlsx",
      "xls",
      "pages",
      "txt",
      "epub",
      "mobi",
      "doc",
      "docx",
      "pdf"
    ],
    'video' :
    [
      "mp4",
      "mkv",
      "wmv",
      "avi",
      "3gp",
      "mov",
      "rmvb"
    ],
    'presentation' :
    [
      "pptx",
      "keynote",
      "ppt"
    ],
    'spreadsheet' :
    [
      "xlsx",
      "xls",
      "number"
    ]
    'archive' :
    [
      "rar",
      "zip",
      "7zip",
      "tar",
      "gz",
      "gz2"
    ]
  };
  TypeMatch.prototype.test = function(file, path){
    var extension = file.name.split('.').pop();
    for(var i = 0; i < TypeMatch.dictionary[this.type].length; i++){
      if(TypeMatch.dictionary[this.type][i] == extension)
        return true;
    }
        return false;
  }

  var DateMatch = function(type, begin, end){
    this.type = type;
    this.begin= begin;
    this.end = end;
  }
  DateMatch.prototype.test = function(file, path){
    var testingDate = new Date(file[this.type]);
    console.log('asd');
    if(this.begin - testingDate > 0){
      return false;
    }
    if(testingDate - this.end > 0){
      return false;
    }
    return true;
  }
}]);