'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:BrowseCtrl
 * @description
 * # BrowseCtrl
 * Controller of the clientApp
 */

function getFileType(filename){
  return filename.split('.').pop();
};

angular.module('clientApp')
  .controller('BrowseCtrl',['$scope', '$resource', function ($scope, $resource) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    var getContainer = function(){
    	var usrRes = $resource('api/account/info');
    	$scope.tabs = [];
    	var result = usrRes.get({}, function(){
    		if(result.success){
    			$scope.tabs = result.drives;
    		}
    	});
    };
    $scope.getContainer = getContainer;
    $scope.getContainer();
  }])
  .controller('containers', ['$scope', '$resource' ,function ($scope, $resource) {
  	$scope.driveType = null;
  	$scope.driveID = null;
  	var res = null;
  	$scope.targetPath = '';
  	$scope.rootPath = '';
  	$scope.container = [];

    $scope.getClass = function(file){
      switch(file.is_folder){
        case true:
          return 'fa fa-folder-o';
          break;
        case false:
          switch(getFileType(file.name)){
            case 'mkv':
            case 'mp4':
            case 'avi':
            case 'wmv':
            case 'mov':
            case 'rmvb':
              return 'fa fa-video';
              break;
            case 'pdf':
            case 'doc':
            case 'docx':
            case 'gdoc':
            case 'txt':
            case 'md':
              return 'fa fa-text-o';
              break;
            case 'mp3':
            case 'flac':
            case 'm4v':
            case 'wav':
            case 'aiff':
            case 'mid':
            case 'wma':
            case 'midi':
              return 'fa fa-audio-o';
              break;
            case 'zip':
            case 'rar':
            case 'tar':
            case 'gz':
            case '7z':
              return 'fa fa-archive-o';
              break;
            case 'jpg':
            case 'png':
            case 'jpeg':
            case 'gif':
            case 'psd':
            case 'tiff':
              return 'fa fa-image-o';
              break;
            case 'cpp':
            case 'java':
            case 'py':
            case 'rb':
            case 'c':
              return 'fa fa-code-o';
              break;
          }
          break;
      }
    };

  	$scope.getFileIndex = function(path){
  		var result = res.get({i: path},function(){
  			if(result.success){
  				$scope.container = result.content;
  			}
  		});
  	};

  	$scope.init = function(){
  		res = $resource('api/fileIndex/' + $scope.driveID);
  		if($scope.driveType === 'googledrive'){
  			$scope.rootPath = 'root';
  		}
  		else if($scope.driveType === 'dropbox'){
  			$scope.rootPath = '/';
  		}
  		else if($scope.driveType === 'onedrive'){
  			$scope.rootPath = 'me/skydrive';
  		}
  		$scope.getFileIndex($scope.rootPath);
  	};
    setTimeout($scope.init,1);
  }]);
