'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:BrowseCtrl
 * @description
 * # BrowseCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('BrowseCtrl',['$scope','UserInfo','Tools','Global','Search','$timeout', function ($scope, UserInfo, Tools, Global, Search,$timeout) {
		$scope.drivelist = [];
		$scope.drives = [];
		$scope.searchText = '';
		$scope.viewOption = 'my-grid';
    $scope.filterTargets = {
      audio:false,
      video:false,
      image:false,
      document:false,
      text:false,
      other:false,
      file:false,
      folder:false
    };

		$scope.search = function(){
			if($scope.searchText){
				console.clear();
				console.table(Search.search($scope.searchText),['fullpath','created_date', 'modified_date','matches']);
			}
		};
		$scope.selectViewOption = function(option){
			$scope.viewOption = option;
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
        case 'tesseract':    return 'Tesseract';
				default: return 'Unknown';
			}
		};
    $scope.getFileSizeString = function humanFileSize(bytes, si) {//credit: http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
      if(!bytes)return '';
      si = !si;

      var thresh = si ? 1000 : 1024;
      if(bytes < thresh) return bytes + ' B';
      var units = si ? ['KB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
      var u = -1;
      do {
        bytes /= thresh;
        ++u;
      } while(bytes >= thresh && u <= 7);
      return bytes.toFixed(1)+' '+units[u];
    };

		$('#psudoUpload').on("click", function(){
			$('#ajaxfile').trigger("click");
		});
		//var uploadShadowRoot = $('#ajaxfile')[0].createShadowRoot();
		//var psuedoUpload = $('#psudoUpload');
		//uploadShadowRoot.appendChild(document.importNode(psuedoUpload.content, true));

    /*
     2015 Jason Mulligan
     @version 3.1.2
     */
    //$scope.getFileSizeString()
    //!function(a){var b=/b$/,c={bits:["B","kb","Mb","Gb","Tb","Pb","Eb","Zb","Yb"],bytes:["B","kB","MB","GB","TB","PB","EB","ZB","YB"]},d=function(a){var d=void 0===arguments[1]?{}:arguments[1],e=[],f=!1,g=0,h=void 0,i=void 0,j=void 0,k=void 0,l=void 0,m=void 0,n=void 0,o=void 0,p=void 0,q=void 0,r=void 0;if(isNaN(a))throw new Error("Invalid arguments");return j=d.bits===!0,p=d.unix===!0,i=void 0!==d.base?d.base:2,o=void 0!==d.round?d.round:p?1:2,q=void 0!==d.spacer?d.spacer:p?"":" ",r=void 0!==d.suffixes?d.suffixes:{},n=void 0!==d.output?d.output:"string",h=void 0!==d.exponent?d.exponent:-1,m=Number(a),l=0>m,k=i>2?1e3:1024,l&&(m=-m),0===m?(e[0]=0,e[1]=p?"":"B"):((-1===h||isNaN(h))&&(h=Math.floor(Math.log(m)/Math.log(k))),h>8&&(g=1e3*g*(h-8),h=8),g=2===i?m/Math.pow(2,10*h):m/Math.pow(1e3,h),j&&(g=8*g,g>k&&(g/=k,h++)),e[0]=Number(g.toFixed(h>0?o:0)),e[1]=c[j?"bits":"bytes"][h],!f&&p&&(j&&b.test(e[1])&&(e[1]=e[1].toLowerCase()),e[1]=e[1].charAt(0),"B"===e[1]?(e[0]=Math.floor(e[0]),e[1]=""):j||"k"!==e[1]||(e[1]="K"))),l&&(e[0]=-e[0]),e[1]=r[e[1]]||e[1],"array"===n?e:"exponent"===n?h:"object"===n?{value:e[0],suffix:e[1]}:e.join(q)};"undefined"!=typeof exports?module.exports=d:"function"==typeof define?define(function(){return d}):a.getFileSizeString=d}($scope);
    $scope.selectFilter = function(target){
      $timeout(function(){
        $scope.filterTargets[target] = !$scope.filterTargets[target];
        console.log($scope.filterTargets[target]);
      });
    };
    $scope.myFilter = function(item, i){
      var needFilter = false;
      for(var i in $scope.filterTargets){
        if($scope.filterTargets[i]){
          needFilter = true;
          break;
        }
      }
      if(!needFilter)return true;
      var faClass = _browse_getClass_(item);
      switch(faClass){
        case 'fa fa-file-audio-o':
          return $scope.filterTargets.audio;
        case 'fa fa-file-image-o':
          return $scope.filterTargets.image;
        case 'fa fa-file-pdf-o':
        case 'fa fa-file-powerpoint-o':
        case 'fa fa-file-excel-o':
        case 'fa fa-file-text-o':
          return $scope.filterTargets.document;
        case 'fa fa-file-video':
          return $scope.filterTargets.video;
        case 'fa fa-file-archive-o':
          return $scope.filterTargets.archive;
        case 'fa fa-file-code-o':
        case 'fa fa-file-o':
          return $scope.filterTargets.other;
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
      return file.name;
			//function driveName(driveType){
			//	switch(driveType){
			//		case 'dropbox':     return 'Dropbox';
			//		case 'googledrive': return 'Google Drive';
			//		case 'onedrive':    return 'One Drive';
			//		default: return 'Unknown';
			//	}
			//}
			//return file.name + ' @ ' + driveName(file.drive.type);
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
