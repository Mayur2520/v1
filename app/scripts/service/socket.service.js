angular.module('MyApp')
  .factory('socket', ['$resource', function ($resource, $scope) {
    var socket = io.connect('http://103.252.7.5:8029');
    
    var _scope = angular.element(document.getElementById('ln_vegies')).scope();

 

    return {
       
    };
 
  }]);