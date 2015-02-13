(function(){
  'use strict';
  var loading = document.getElementsByClassName('loading-animation')[0];
  var loadingText = loading.innerHTML;
  loading.innerHTML = '';
  for(var i = 0; i < loadingText.length; i++){
    var letter = loadingText[i];
    var element = document.createElement('span');
    var node = document.createTextNode(letter);
    element.appendChild(node);
    
    element.style.webkitAnimationDelay = i/20 + 's';
    element.style.animationDelay = i/20 + 's';
    element.className += ' updown';
    
    loading.appendChild(element);
  }
})();
