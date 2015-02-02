'use strict';

/**
 * @ngdoc service
 * @name clientApp.notifier
 * @description
 * # notifier
 * Service in the clientApp.
 */
angular.module('clientApp')
  .service('notifier', function () {
    this.notify = function(msg) {

    };

    this.error = function(msg){

    };

    this.success = function(msg){

    };

    this.send = function(){

    }
  })
  .factory('messageFactory', function(){
  });
