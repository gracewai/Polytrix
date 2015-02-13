'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:DriveManager
 * @description
 * # DriveManager
 * DriveManager controller
 */
angular.module('clientApp')
  .controller('DriveManager',['$scope','UserInfo','$location','Tools', function ($scope,UserInfo,$location,Tools){

    $scope.drives = {
      googledrive: {
        type:'googledrive',
        name:'Google Drive',
        icon:'/images/googledrive.png',
        accounts:[]
      },
      onedrive:{
        type: 'onedrive',
        name: 'One Drive',
        icon:'/images/onedrive.png',
        accounts:[]
      },
      dropbox:{
        type: 'dropbox',
        dropbox: 'dropbox',
        name: 'Dropbox',
        icon:'/images/dropbox.png',
        accounts:[]
      }
    };

    var queries = $location.search();

    $scope.success = null;
    $scope.error = null;
    $scope.rediectDriveType = null;

    var userInfo = $scope.userInfo = UserInfo.get();
    UserInfo.onchange($scope,function(info){
      $scope.userInfo = UserInfo.get();
      $scope.userInfoUpdate();
    });

    $scope.open = function(skipAnimation){
      Tools.selectElement('#manageDriveModal',function(jq){
        if(skipAnimation){
          jq = jq.modal('setting', 'duration', 0);
        }else{
          jq = jq.modal('setting', 'duration', 400);
        }
        jq.modal('show');
      },1,50,30);
    };

    $scope.userInfoUpdate = function(){
      if($scope.userInfo.drives.length == 0){
        $scope.open();
      }
      for(var key in $scope.drives){
        $scope.drives[key].accounts = [];
      }
      for(var i in $scope.userInfo.drives){
        var drive = $scope.userInfo.drives[i]
        $scope.drives[drive.type].accounts.push({email:drive.id,id:drive.id});
      }
    };


    $scope.initByParams = function(){
      if(queries.redirect && queries.redirect == 'drive'){
        $scope.open(true);

        $scope.success = queries.success;
        $scope.error = queries.error;
        $scope.rediectDriveType = queries.drive;

        delete $location.$$search.redirect;
        delete $location.$$search.drive;
        delete $location.$$search.error;
        delete $location.$$search.success;
        $location.$$compose();
      }
    };

    $scope.userInfoUpdate();
    $scope.initByParams();

  }])
  .controller('SingleDriveManage',['$scope','$element',function($scope,$element){

    var btnOpenTxt = 'Manage';
    var btnOpenIco = 'settings';

    var btnCloseTxt = 'Save';
    var btnCloseIco = 'save';

    $scope.manageBtnTxt = btnOpenTxt;
    $scope.manageBtnIco = btnOpenIco;

    $scope.toogleManageSegment = function(){
      if($scope.manageBtnTxt == btnOpenTxt){
        $scope.manageBtnTxt = btnCloseTxt;
        $scope.manageBtnIco = btnCloseIco;
      }else{
        $scope.manageBtnTxt = btnOpenTxt;
        $scope.manageBtnIco = btnOpenIco;
      }
      $($element).find(".manageDriveSegment").slideToggle("fast");
    };

    $scope.addDrive = function(){
      window.location="/api/auth/" + $scope.drive.type;
    };

    $scope.revoke = function(id){
      //do sth
    };
  }]);
