angular.module('MyApp')
  .factory('Order', ['$resource', function ($resource) {

    return{

      saveOrderDetails: function()
      {
        return $resource('/api/saveOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      }

    }
}]);