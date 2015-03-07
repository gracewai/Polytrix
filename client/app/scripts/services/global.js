'use strict';

/**
 * @ngdoc factory
 * @name clientApp.Global
 * @description
 * Global storage
 *
 *
 *
 */
angular.module('clientApp')
  .factory('Global', ['$rootScope','Drive','UserInfo','Ready', function($rootScope,Drive,UserInfo,Ready) {
    var _this = this;
    this.ready = function(element, func){
      this[element].ready(func);
    };

    this.userinfo = new Ready(UserInfo.get());
    if(this.userinfo.get().uid){
      this.userinfo.ready();
    }
    UserInfo.onchange($rootScope,function(info){
      _this.userinfo.set(info);
      _this.userinfo.ready();
      _this.userinfo.change();
    });

    this.drives = new Ready([]);
    this.userinfo.ready(function(userinfo){
      for(var i in userinfo.drives){
        var drive = userinfo.drives[i];
        _this.drives.val.push(new Drive(drive.type,drive.id));
      }
      var interval = setInterval(function(){
        for(var i in _this.drives.val){
          if(!_this.drives.val[i].cacheReady){
            return false;
          }
        }
        clearInterval(interval);
        console.log('ready');
        _this.drives.ready();
      },100);
    });


    return this;
  }])
//
// Service Ready
//  Provide just like document.ready function
//  Give state to your object
//
//  A typical use is for any ajax object
//
  .service('Ready',['$rootScope',function($rootScope){
    var Ready = function(val){
      this.id = '' + Math.random();
      this.funcs = [];
      this.val = val;
      this.isReady = false;
    };
    // Ready.ready = function(val){
    //   var ready = function temporary() { return Ready.prototype.ready.apply(this, arguments); };
    //   for(var i in Ready.prototype){
    //     ready[i] = Ready.prototype[i];
    //   }
    //   Ready.call(ready,val);
    //   return ready;
    // };
    // Ready.extend = function(obj,val){
    //   if(typeof val === 'undefined'){val = obj;}
    //   for(var i in Ready.prototype){
    //     obj[i] = Ready.prototype[i];
    //   }
    //   Ready.call(obj,val);
    //   return obj;
    // };
    Ready.prototype.ready = function(func){
      if(typeof func === 'function'){
        if(this.isReady === false){
          this.funcs.push(func);
        }else{
          func(this.get());
        }
      }else if(typeof func === 'undefined' && this.isReady === false){
        this.isReady = true;
        for(var i in this.funcs){
          this.funcs[i](this.get());
        }
      }
    };
    Ready.prototype.change = function(){
      if(this.isReady){
        $rootScope.$emit(this.id);
      }
    };
    Ready.prototype.onchange = function(scope,func){
      var _this = this;
      if (typeof scope === 'function'){
        func = scope;
        console.log(new Error('you should pass scope to onchange for unbind uses - Factory:userInfo.onchange()'));
        $rootScope.$on(_this.id, func);
        return;
      }
      var unbind = $rootScope.$on(_this.id, function(){
        func(_this.get());
      });
      scope.$on('$destroy', unbind);
    };
    Ready.prototype.set = function(val){
      this.val = val;
      this.change();
    };
    Ready.prototype.get = function(){
      return this.val;
    };
    return Ready;
  }
]);
