'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('DashboardCtrl', ['$scope', '$resource', 'Global', 'UserInfo',function ($scope, $resource, Global, UserInfo) {
  	$scope.user = UserInfo.get();
  	$scope.range = 6;

    $scope.drives = Global.drives.val;
    console.log($scope.drives);
    Global.drives.ready(function(val){
      $scope.drives = val;
    });
    function humanFileSize(bytes, si) {//credit: http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
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

    $scope.storage = [];
    $scope.accumulativeUsage = [];


    var count = $scope.drives.length;
    for(var i = 0;i<$scope.drives.length;i++){
      $scope.drives[i].quotaEnquiry(i,function(result,i){
        var info = {
          type: $scope.drives[i].type,
          total: humanFileSize(result.totalQuota),
          used: [humanFileSize(result.usedQuota), (result.usedQuota/result.totalQuota).toFixed(4)*100],
          free: [humanFileSize(result.totalQuota-result.usedQuota), ((result.totalQuota-result.usedQuota)/result.totalQuota).toFixed(4)*100],

        };
        var name = function(){
          switch($scope.drives[i].type){
            case 'dropbox':     return 'Dropbox';
            case 'googledrive': return 'Google Drive';
            case 'onedrive':    return 'One Drive';
            case 'tesseract':    return 'Tesseract';
            default: return 'Unknown';
          }
        }
        $scope.accumulativeUsage.push({value:result.totalQuota,color: '#234',highlight:'#246', label:name()});
        //console.log(ctx);
        var usage = [{value: info.used[1],color:"#30e8bd",highlight: "#66eece", label: 'Used'},{value: info.free[1],color: "#3080e8",highlight: "#66a1ee", label: 'Available' }]
        //var graph = new Chart(ctx).Doughnut(usage);
        $scope.storage.push({info:info,name:name(), usage: usage});
        setTimeout(function(){

          $scope.storage[i].ctx = $('#'+$scope.storage[i].info.type+'Chart').get(0).getContext("2d");
          $scope.storage[i].graph = new Chart($scope.storage[i].ctx).Doughnut($scope.storage[i].usage);
        },0);


        count--;
        if(count==0){
          setTimeout(function(){
            console.log($scope.accumulativeUsage);
            $scope.accumulativeUsageCtx = $('#accumulativeUsageChart').get(0).getContext("2d");
            $scope.accumulativeUsageGraph = new Chart($scope.accumulativeUsageCtx).Doughnut($scope.accumulativeUsage);
          },0);
        }
      });
      
    }

    console.log($scope.storage);
    //----
  var ctx = $("#myLineChart").get(0).getContext("2d");
  var data = {
    labels: ["January", "February", "March", "April", "May"],
    datasets: [
        {
            label: "Upstream transmission",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "Downstream transmission",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]
};
  	//-----Dashboard graphical data display settings
    var myLineChart = new Chart(ctx).Line(data);  
  	var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  	var lastMonth = (new Date().getMonth)-1;
  	var getDataRange = function (size, option){
  		switch(option){
  			case 'year':
  				break;
  			case 'month':
  				break;
  			case 'day' :
  				break;
  			default:
  				var range = [];
  				for(var i = 0;i < size;i++){
  					range.push(monthNames[i]);
  				}
  		}
  	}

  }]);
