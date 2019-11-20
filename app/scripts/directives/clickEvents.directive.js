angular.module('MyApp').directive('section', function() {
  return {
    restrict: 'C',
    controller: 'LoginController',
    link: function(scope, elem, attrs) {
      elem.bind('click', function() {
        scope.$apply(function() {
          if ($(elem).is('div.section')) {
        
               scope.hideNavbar();
           
          } else {
            
          }
        });
      });
    }
  }
});