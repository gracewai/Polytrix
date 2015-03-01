'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:BrowseCtrl
 * @description
 * # BrowseCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('BrowseCtrl',['$scope','UserInfo','Tools','Drive','Search', function ($scope, UserInfo, Tools, Drive, Search) {
		$scope.drivelist = [];
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

			for(var i in $scope.drivelist){
				var drive = $scope.drivelist[i];
				drive.drive = new Drive(drive.type, drive.id);
			}
		});

		UserInfo.update();

		$scope.select = function(index){
			console.log(index);
		};

		$scope.switchAndView = function(id, drive){
			$('#driveTabs>.item').tab('change tab', drive.id);
			angular.element('#' + drive.id).scope().getFileIndex(id);
		};
		$scope.getDriveName = function(driveType){
			switch(driveType){
				case 'dropbox':     return 'Dropbox';
				case 'googledrive': return 'Google Drive';
				case 'onedrive':    return 'One Drive';
				default: return 'Unknown';
			}
		};
	}])
	.controller('CombinedView',['$scope', 'UserInfo', 'Drive',function($scope, UserInfo, Drive){
		var userInfo = null;
		var drivelist = [];
		$scope.files = [];
		var drive = $scope.drive = {
			id:null,
			type:'all',
			drive_list: drivelist
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
			drivelist = [];
			for(var i in userInfo.drives){
				var driveI = userInfo.drives[i];
				drivelist.push(new Drive(driveI.type, driveI.id));
			}
		}


		$scope.getClass = _browse_getClass_;
		UserInfo.onchange($scope,init);

		init();
		setTimeout($scope.getFileIndex,100);
	}])
	.controller('SingleDriveCtrl', ['$scope', '$resource', function ($scope, $resource) {
		var drive = $scope.drive = null;
		$scope.currentPath = null;
		$scope.parentIndex = null;
		$scope.files = [];

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
				$scope.files = index.files;
				$scope.parentIndex =  index.metadata.parent_identifier;
			},
			function fromServer(index){
				if($scope.currentPath == path){//view not changed
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
