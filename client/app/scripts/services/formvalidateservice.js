'use strict';

/**
 * @ngdoc service
 * @name clientApp.formValidateService
 * @description
 * # formValidateService
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('formValidateService', ['UserInfo', function (UserInfo){
    this.passowrdMatch = function(p,cp){ return (p===cp)?true:false};
    
    this.passwordComplexityCheck = function(password){
		var pattern = {uppercaseCharacter:/[A-Z]/,lowercaseCharacter:/[a-z]/, digit:/\d/, other:/\W/};
		var passwordComplexity = pattern.uppercaseCharacter.test(password) + pattern.lowercaseCharacter.test(password) + pattern.digit.test(password) + pattern.other.test(passowrd);
		return (passwordComplexity + password.length);
    };
    
    this.validateEmail = function(email){
    	var validateEmailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return validateEmailRegex.test(email);
    };

    this.IsUsernameTaken = function(credential,cb){
    	UserInfo.get(credential, function(result){

    	});
    }
    return this;

  }]);
