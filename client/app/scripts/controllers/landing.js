'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('LandingCtrl',['$scope', '$resource', function ($scope, $resource) {
		var occupiedID = [];
		var occupiedEmail = [];

		var form = $scope.form = {
			uid:'',
			name:'',
			email:'',
			upw:'',
			upwc:'',
			width: '280px',
			identifier: 'Email'
		};

		var ID = {
			EMAIL : 'Email',
			USER_ID: 'User ID',
		};

		var Selection = {
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
			add:function(error){
				this.errors.push(error);
				$('#errmsg').removeClass('hidden');
			},
			clear:function(){
				this.errors = [];
				$('#errmsg').addClass('hidden');
			},
		};

		var validateEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		function validateEmail(email) {
			return validateEmailRegex.test(email);
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
				if(validateEmail(form.email)){
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
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-sign-in');
				form.width='280px';
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
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-pencil-square-o');
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
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-sign-in');
				form.width='280px';
				form.identifier = 'Email';

				$scope.buttonText = 'Deploy';
				break;
			}
		};

		$scope.deploy = function(){
			//show loading icon
			$scope.loading = true;


			//check user input uid or email
			if(validateEmail(form.email)){
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
					$scope.select('register');
				}
			});
		};

		$scope.login = function(){
			$scope.loading = true;
			var Login = $resource('/login');
			//we use form.email field no matter user is using uid or email
			var result = Login.save({uid:form.email,upw:form.upw,strategy: 'local'},function(){
				$scope.loading = false;
				if(result.success){
					window.location = '/console/';
				}else{
					alert('cannot login because' + result.msg);
				}
			});
			result.$promise.catch(function(response) {
				if(response.status == 401)
					alert('wrong user id or password');
			});
		};

		$scope.register = function(){
			$scope.loading = true;

			var Login = $resource('/register');
			var result = Login.save({
				uid: form.uid,
				name: form.name,
				email: form.email,
				upw: form.upw,
				strategy: 'local'
			},function(){
				$scope.loading = false;
				if(result.success){
					window.location = '/console/';
				}else{
					alert('cannot register because' + result.msg);
				}
			});
		};

		$scope.buttonClick = function(){
			switch($scope.selection){
			case Selection.DEPLOY:
				if(form.email){
					$scope.deploy();
				} else {
					Error.add('Your email address cannot be empty');
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
				}
				break;
			}
		};
	}]);
