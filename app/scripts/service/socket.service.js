angular.module('MyApp')
  .factory('socket', ['$resource', function ($resource, $scope) {
    var socket = io.connect('http://localhost:8029');
    
    var _scope = angular.element(document.getElementById('ln_vegies')).scope();

 

    return {
       
    };
 
  }]);