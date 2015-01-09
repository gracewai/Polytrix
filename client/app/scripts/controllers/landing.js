'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
	.controller('LandingCtrl',['$scope', '$resource', '$mdDialog', function ($scope, $resource, $mdDialog) {
		var occupiedID = [];
		var occupiedEmail = [];

		$scope.loading = false;
		$scope.selection = 'depoly';
		$scope.buttonText = 'Deploy';
		var form = $scope.form = {
			uid:'',
			name:'',
			email:'',
			upw:'',
			upwc:'',
			width: '280px',
			identifier: 'Email'
		};
		$scope.usingIdentifier = 'Email';

		var UserInfo = $resource('/api/account/info');

		var validateEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		function validateEmail(email) {
			return validateEmailRegex.test(email);
		};

		$scope.formChange = function(event,field){
			if($scope.selection == 'register'){
				$scope.usingIdentifier = 'Email';

				if(field && field == 'uid'){
					console.log(event);
					//check in occupiedID
				}

			}
		};

		$scope.idChange = function(){
			if($scope.selection == 'login'){
				$scope.select('depoly');
			}
			if($scope.selection != 'register'){
				if(validateEmail(form.email)){
					$scope.usingIdentifier = 'Email';
				}else{
					$scope.usingIdentifier = 'User ID';
				}
				//form.identifier = $scope.usingIdentifier;
			}
		};

		$scope.select = function(selection){
			$scope.selection = selection;
			switch(selection){
			case 'login':
				$('.depoly.tab').removeClass('select');
				$('.depoly.tab.login').addClass('select');
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-sign-in');
				form.width='280px';
				form.identifier = $scope.usingIdentifier;
				if($scope.usingIdentifier == 'User ID' && form.uid){
					form.email = form.uid;
					form.uid = '';
				}
				$scope.buttonText = 'Login';
				$('.sign-up-input.password')[0].focus();

				break;
			case 'register':
				$('.depoly.tab').removeClass('select');
				$('.depoly.tab.register').addClass('select');
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-pencil-square-o');
				form.width='400px';
				form.identifier = 'Email';

				if($scope.usingIdentifier == 'User ID' && form.email){
					form.uid = form.email;
					form.email = '';
				}

				$scope.buttonText = 'Register';

				break;
			case 'depoly':
				$('.depoly.tab').removeClass('select');
				$('button.sign-up-button > i').removeClass('fa-chevron-circle-right');
				$('button.sign-up-button > i').addClass('fa-sign-in');
				form.width='280px';
				form.identifier = 'Email';

				$scope.buttonText = 'Deploy';
				break;
			}
		};

		$scope.depoly = function(){
			//show loading icon
			$scope.loading = true;


			//check user input uid or email
			if(validateEmail(form.email)){
				$scope.usingIdentifier = 'Email';
			}else{
				$scope.usingIdentifier = 'User ID';
			}

			var para = {};
			if($scope.usingIdentifier == 'Email'){
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
			case 'depoly':
				if(angular.isDefined($scope.form.email)){
					$scope.depoly();
				}
				else {
					$scope.err_msg = 'Your email address cannot be empty';
					$('#errmsg').removeClass('hidden');
				}
				break;
			case 'login':
				$scope.login();
				break;
			case 'register':
				if(angular.isDefined($scope.form.email)){
					$scope.register();
				}
				else {
					$scope.err_msg = 'Your email address cannot be empty';
					$('#errmsg').removeClass('hidden');
				}
				break;
			}
		};
		// $mdDialog.show({
		// 	controller: dialogController,
		// 	templateUrl:'/views/register.html',
		// 	targetEvent: event
		// });
	}]);
