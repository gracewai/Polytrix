'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('LandingCtrl',['$scope', '$resource', 'formValidateService', 'connectService', function ($scope, $resource, formValidateService, connectService) {
		var occupiedID = [];
		var occupiedEmail = [];

		var form = $scope.form = {
			uid:'',
			name:'',
			email:'',
			upw:'',
			upwc:'',
			stayLogin:true,
			width: '280px',
			identifier: 'Email'
		};

		var ID = {
			EMAIL : 'Email',
			USER_ID: 'User ID',
		};

		var Selection = $scope.Selection = {
			DEPLOY: 'deploy',
			LOGIN: 'login',
			REGISTER: 'register'
		};

		$scope.loading = false;
		$scope.selection = Selection.DEPLOY;
		$scope.buttonText = 'Deploy';
		$scope.usingIdentifier = ID.EMAIL;

		var UserInfo = $resource('/api/account/info');

		var Error = $scope.Error = {
			errors: [],
			needUpdate: false,
			add:function(error){
				this.needUpdate = true;
				this.errors.push(error);
			},
			hideThenClear:function(){
				var _this = this;
				this.updateView(false,function(){
					_this.needUpdate = false;
					_this.errors = [];
					$scope.$apply();
				});
			},
			clear:function(){
				if(this.errors.length == 0)
					return;
				this.needUpdate = true;
				this.errors = [];
			},
			updateView:function(show,cb){
				if(typeof show == "undefined" && this.needUpdate == false)
					return;

				if(typeof show == "undefined")
					show = this.needUpdate;


				if(show){
					//$('#errmsg').removeClass('hidden');
					$('#errmsg').transition({animation:'fade down in',onComplete:cb});
				}
				else{
					$('#errmsg').transition({animation:'fade up out',onComplete:function(){
						//$('#errmsg').addClass('hidden');
						if(typeof cb == "function")cb();
					}});
				}
			}
		};

		$scope.formChange = function(event,field){
			if($scope.selection == Selection.REGISTER){
				$scope.usingIdentifier = ID.EMAIL;

				if(field && field == 'uid'){
					console.log(event);
					//check in occupiedID
				}

			}
		};

		$scope.idChange = function(){
			if($scope.selection == Selection.LOGIN){
				$scope.select('deploy');
			}
			if($scope.selection != Selection.REGISTER){
				if(formValidateService.validateEmail(form.email)){
					$scope.usingIdentifier = ID.EMAIL;
				}else{
					$scope.usingIdentifier = ID.USER_ID;
				}
				//form.identifier = $scope.usingIdentifier;
			}
		};

		$scope.select = function(selection){
			$scope.selection = selection;
			switch(selection){
			case Selection.LOGIN:
				$('.deploy.tab').removeClass('select');
				$('.deploy.tab.login').addClass('select');
				form.width='300px';
				form.identifier = $scope.usingIdentifier;
				if($scope.usingIdentifier == ID.USER_ID && form.uid){
					form.email = form.uid;
					form.uid = '';
				}
				$scope.buttonText = 'Login';
				$('.sign-up-input.password')[0].focus();

				break;
			case Selection.REGISTER:
				$('.deploy.tab').removeClass('select');
				$('.deploy.tab.register').addClass('select');
				form.width='400px';
				form.identifier = 'Email';

				if($scope.usingIdentifier == ID.USER_ID && form.email){
					form.uid = form.email;
					form.email = '';
				}

				$scope.buttonText = 'Register';

				break;
			case Selection.DEPLOY:
				$('.deploy.tab').removeClass('select');
				form.width='300px';
				form.identifier = 'Email';

				$scope.buttonText = 'Deploy';
				break;
			}
		};

		$scope.deploy = function(){
			//show loading icon
			$scope.loading = true;


			//check user input uid or email
			if(formValidateService.validateEmail(form.email)){
				$scope.usingIdentifier = ID.EMAIL;
			}else{
				$scope.usingIdentifier = ID.USER_ID;
			}

			var para = {};
			if($scope.usingIdentifier == ID.EMAIL){
				para.email = form.email;
			}else{
				para.uid = form.email;
			}

			var result = UserInfo.get(para, function(){
				console.log(result);
				//show loading icon
				$scope.loading = false;

				if(result.success){
					occupiedID.push(result.userInfo.id);
					if(result.userInfo.email)occupiedEmail.push(result.userInfo.email);
					$scope.select('login');
				}
				else
				{
					if(result.notFound){
						$scope.select('register');
					}else{
						console.log(result);
					}
				}
			});
		};

		function AjaxErrorHandler(response){
			$scope.loading = false;
			if(typeof response.success === 'undefined'){
				switch(response.status){
					case 400:
						Error.add('400 Bad Request');
					break;
					case 401:
						Error.add('Incorrect password or invalid account credentials');
					break;
					case 0:
						Error.add('Server connection timeout, please try again');
					break;
					default:
						Error.add('Unknown Error, Status code:' + response.status);
					break;
				}
			}else{
				if(response.msg) Error.add(response.msg);
				else Error.add('Unknown Error');
			}
			Error.updateView();
		}

		$scope.login = function(){
			$scope.loading = true;
			connectService.login(form.email,form.upw,form.stayLogin,
				function(){
					window.location = '/console/';
				}, AjaxErrorHandler
			);
		};

		$scope.register = function(){
			$scope.loading = true;
			connectService.register(form.uid,form.name,form.email,form.upw,
				function(){
					window.location = '/console/';
				},AjaxErrorHandler
			);
		};

		$scope.buttonClick = function(){
			Error.clear();
			switch($scope.selection){
			case Selection.DEPLOY:
				if(form.email){
					$scope.deploy();
				} else {
					Error.add('Your email address cannot be empty');
					Error.updateView();
				}
				break;
			case Selection.LOGIN:
				$scope.login();
				break;
			case Selection.REGISTER:
				if(form.email){
					$scope.register();
				} else {
					Error.add('Your email address cannot be empty');
					Error.updateView();
				}
				break;
			}
		};
	}]);
