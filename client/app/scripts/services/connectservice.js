'use strict';

/**
 * @ngdoc service
 * @name clientApp.loginService
 * @description
 * # loginService
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('connectService',['formValidateService','UserInfo', '$resource', function (formValidateService,UserInfo,$resource) {
    this.login = function(user_credential,password,success_callback,error_callback){
    	var Login = $resource('/login');
    	var result = Login.save({uid:user_credential,upw:password,strategy: 'local'},function(){
			if(result.success){
				success_callback(result);
			}else{
				error_callback(result);
			}
		});
    	result.$promise.catch(function(response) {
			error_callback(response);
		});

    };

    this.register = function(userid,username,email,password,reg_success_callback,reg_error_callback){
    	var register = $resource('/register');
    	var result = register.save({
    		uid: userid,
    		name: username,
    		email: email,
    		upw: password,
    		strategy: 'local'
    	},function(){
    		if(result.success){
    			reg_success_callback();
    		}else{
    			reg_error_callback(result);
    		}   	
    	});
    	result.$promise.catch(function(response) {
			error_callback(response);
		});
    };

    this.isUserAuthenticated = function(){
        return UserInfo.get().logined;
    }
  }]);
