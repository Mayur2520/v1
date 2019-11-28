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
}).directive('fileModel', ['$parse', function ($parse) { 
  return { 
      restrict: 'A', 
      link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel); 
          var modelSetter = model.assign;
          element.bind('change', function(){ 
              scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
              }); 
          }); 
      } 
  }; 
}]).filter('startFrom', function() {
  return function(input, start) {
      if(input) {
          start = +start; //parse to int
          return input.slice(start);
      }
      return [];
  }
});;