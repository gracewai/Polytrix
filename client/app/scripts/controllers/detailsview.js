'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:DetailsView
 * @description
 * # DetailsView
 * DetailsView controller
 */
angular.module('clientApp')
  .controller('DetailsView',['$scope', function ($scope){

    $scope.versions = [
      {img:'/images/test.png'},
      {img:'/images/test.png'},
      {img:'/images/test.png'},
      {img:'/images/test.png'},
      {img:'/images/test.png'},
      {img:'/images/test.png'},
      {img:'/images/test.png'}
    ];

    for(var i = 0; i< $scope.versions.length;i++){
      $scope.versions[i].style = {
        '-webkit-transform':'translate3d(0px, -' + (200 * (i+1)) + 'px, -' + (200 * (i+1)) + 'px); z-index: ' + ($scope.versions.length - i)
      }
    }
    $scope.selectedVersion = $scope.versions.length;

    
    setTimeout(function(){
      $('.ui.test.modal').modal('show');
      $('.ui.checkbox').checkbox();
  var controls = (function($) {
    
    var y_space = 200,
      z_space = 200;
      
    var view = $('#view'),
      lis = $('#stack li'),
      prev = $('#controls .prev'),
      next = $('#controls .next'),
      left = $('#rotate_controls .left'),
      centre = $('#rotate_controls .centre'),
      right = $('#rotate_controls .right');
    
    var z_index = lis.length,
      current_index = 1,
      translate_y = y_space *-1,
      translate_z = z_space *-1;
  
    lis.each(function() {

      this.style['-webkit-transform'] = 'translate3d(0px, ' + translate_y + 'px, ' + translate_z + 'px)';
      this.style['z-index'] = z_index;
      
      $(this).data('translate_y', translate_y);
      $(this).data('translate_z', translate_z);
      
      z_index--;
      translate_y -= y_space;
      translate_z -= z_space;
      
    });
    
    next.bind('click', function() {
      if($(this).attr('disabled')) return false;
      lis.each(function() {
        animate_stack(this, y_space, z_space);  
      });
      lis.filter(':nth-child(' + current_index + ')').css('opacity', 0);
      current_index ++;
      check_buttons();
    });
    
    prev.bind('click', function() {
      if($(this).attr('disabled')) return false;
      lis.each(function() {
        animate_stack(this, -y_space, -z_space);  
      });
      lis.filter(':nth-child(' + (current_index - 1) + ')').css('opacity', 1);
      current_index --;
      check_buttons();  
    });
    
    $(document).bind('mousewheel', function(event, delta, deltaX, deltaY) {
      if(deltaY >= 0) {
        next.trigger('click');
      }
      else {
        prev.trigger('click');
      }
    });
    
    function check_buttons() {
      if(current_index==1) {
        prev.attr('disabled', true);
      }
      else {
        prev.attr('disabled', false);
      }
      
      if(current_index == lis.length) {
        next.attr('disabled', true);        
      }
      else {
        next.attr('disabled', false);
      }
    }
    
    left.bind('click', function() {
      view.get(0).style['-webkit-perspective-origin-x'] = '-200px';
      view.get(0).style['left'] = '100px';
    });
    
    centre.bind('click', function() {
      view.get(0).style['-webkit-perspective-origin-x'] = '400px';
      view.get(0).style['left'] = '0'
    });
    
    right.bind('click', function() {
      view.get(0).style['-webkit-perspective-origin-x'] = '1000px';
      view.get(0).style['left'] = '-200px'
    });
    
    function animate_stack(obj, y, z) {
      
      var new_y = $(obj).data('translate_y') + y;
      var new_z = $(obj).data('translate_z') + z;
      
      obj.style['-webkit-transform'] = 'translate3d(0px, ' + new_y + 'px, ' + new_z + 'px)';
      
      $(obj).data('translate_y', new_y)
      .data('translate_z', new_z);
      
    }
    return {prev:next,next:prev};
    
  })(jQuery);


  var slider = $(".version .ui.slider input")[0];
  slider.max = $scope.versions.length;
  slider.value = $scope.versions.length;
  $(".ui.slider input").on("input", function(){
          console.log(this.value);
          var lastSelected = $scope.selectedVersion;
          $scope.selectedVersion = this.value;
          var diff = this.value - lastSelected;
          if(diff > 0){
            for(var i = 0;i<diff;i++){
              controls.next.trigger('click');  
            }
            
          }else if(diff < 0){
            diff = -diff;
for(var i = 0;i<diff;i++){
              controls.prev.trigger('click');  
            }
          }
        });

    },100);
    













  }]);
