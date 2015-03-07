'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:BrowseCtrl
 * @description
 * # BrowseCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('BrowseCtrl',['$scope','UserInfo','Tools','Global','Search', function ($scope, UserInfo, Tools, Global, Search) {
		$scope.drivelist = [];
		$scope.drives = [];
		$scope.searchText = '';
		$scope.search = function(){
			if($scope.searchText){
				console.clear();
				console.table(Search.search($scope.searchText),['fullpath','created_date', 'modified_date','matches']);
			}
		};

		UserInfo.onchange($scope,function(){
			var info = UserInfo.get();
			$scope.drivelist = info.drives;

			Tools.selectElement('#driveTabs>.item', function(elements){
				elements.tab();
			},$scope.drivelist.length+1,50);

			$scope.drives = Global.drives.val;
			Global.drives.ready(function(val){
				$scope.drives = val;
			});
		});

		UserInfo.update();

		$scope.getDriveName = function(driveType){
			switch(driveType){
				case 'dropbox':     return 'Dropbox';
				case 'googledrive': return 'Google Drive';
				case 'onedrive':    return 'One Drive';
				default: return 'Unknown';
			}
		};
	}])
	.controller('CombinedView',['$scope', 'UserInfo', 'Global',function($scope, UserInfo, Global){
		var userInfo = null;
		var drivelist = [];
		$scope.files = [];
		var drive = $scope.drive = {
			id:null,
			type:'all',
			drive_list: drivelist
		};

		$scope.clickOnFolder = function(file){
			$scope.switchAndView(file.identifier,file.drive);
		};

		$scope.switchAndView = function(id, drive){
			$('#driveTabs>.item').tab('change tab', drive.id);
			angular.element('#' + drive.id).scope().getFileIndex(id);
		};

		$scope.getFileTitle = function(file){
			function driveName(driveType){
				switch(driveType){
					case 'dropbox':     return 'Dropbox';
					case 'googledrive': return 'Google Drive';
					case 'onedrive':    return 'One Drive';
					default: return 'Unknown';
				}
			}
			return file.name + ' @ ' + driveName(file.drive.type);
		};
		$scope.getDownloadLink = function(file){
			return file.drive.downloadLink(file.identifier);
		};

		$scope.update = function(){
			$scope.getFileIndex();
		};

		$scope.getFileIndex = function(path,drive){
			$scope.files = [];

			function get(i){
				if(i < drivelist.length)
					return drivelist[i].listFromServer(path)
					.then(function(result){
						if(result.success){
							var prased = result.content.map(function(element){
								element.drive = drivelist[i];
								return element;
							});
							$scope.files.push.apply($scope.files,prased);
						}
						return ++i;
					})
					.then(get);
			}
			get(0);
		};

		function init(){
			userInfo = UserInfo.get();
			drivelist = Global.drives.val;
		}


		$scope.getClass = _browse_getClass_;
		$scope.getFileTypeName = _browse_getFileType_;
		
		UserInfo.onchange($scope,init);
		init();
		setTimeout($scope.getFileIndex,100);
	}])
	.controller('SingleDriveCtrl', ['$scope', '$resource', function ($scope, $resource) {
		var drive = $scope.drive;
		$scope.currentPath = null;
		$scope.parentIndex = null;
		$scope.files = [];

		$scope.clickOnFolder = function(file){
			$scope.getFileIndex(file.identifier);
		};

		$scope.update = function(){

		};

		$scope.getFileTitle = function(file){
			return file.name;
		};
		$scope.getDownloadLink = function(file){
			return drive.downloadLink(file.identifier);
		};

		$scope.update = function(){
			$scope.getFileIndex($scope.currentPath);
		};

		$scope.getFileIndex = function(path){
			$scope.currentPath = path;
			// drive.listFromServer(path)
			// .then(function(result){
			//   if(result.success){
			//     $scope.files = result.content;
			//   }
			// });
			drive.list(path,
			function fromCache(index){
				if(!index)
					return;
				$scope.files = index.files;
				$scope.parentIndex =  index.metadata.parent_identifier;
			},
			function fromServer(index){
				if($scope.currentPath == path && index && index[0]){//view not changed
					$scope.files = index;
				}
			})
		};

		$scope.init = function(_drive){
			drive = $scope.drive = _drive;
			$scope.parentIndex = drive.rootPath;
			$scope.getFileIndex();
		};

		$scope.getClass = _browse_getClass_;
		$scope.getFileTypeName = _browse_getFileType_;
	}]);

function _browse_getFileType_(filename){
	return filename.split('.').pop();
};
function _browse_getClass_(file){
	switch(file.is_folder){
		case true:
			return 'fa fa-folder-o';
			break;
		case false:
			switch(_browse_getFileType_(file.name)){
				case 'mkv':
				case 'mp4':
				case 'avi':
				case 'wmv':
				case 'mov':
				case 'rmvb':
					return 'fa fa-file-video';
				case 'doc':
				case 'docx':
				case 'gdoc':
				case 'txt':
				case 'md':
					return 'fa fa-file-text-o';
				case 'mp3':
				case 'flac':
				case 'm4v':
				case 'wav':
				case 'aiff':
				case 'mid':
				case 'wma':
				case 'midi':
					return 'fa fa-file-audio-o';
				case 'zip':
				case 'rar':
				case 'tar':
				case 'gz':
				case '7z':
					return 'fa fa-file-archive-o';
				case 'jpg':
				case 'png':
				case 'jpeg':
				case 'gif':
				case 'psd':
				case 'tiff':
					return 'fa fa-file-image-o';
				case 'cpp':
				case 'java':
				case 'py':
				case 'rb':
				case 'c':
					return 'fa fa-file-code-o';
				case 'pdf':
					return 'fa fa-file-pdf-o';
				case 'ppt':
				case 'pptx':
				case 'keynote':
					return 'fa fa-file-powerpoint-o';
				case 'xls':
				case 'xlsx':
					return 'fa fa-file-excel-o';
				default:
					return 'fa fa-file-o';
			}
			break;
	}
};
