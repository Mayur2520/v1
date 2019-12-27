angular.module('MyApp')
  .factory('socket', ['$resource', function ($resource) {
    var socket = io.connect('http://localhost:8029');

    socket.on('connection', function(){
        
    });



  return socket;
  }]);