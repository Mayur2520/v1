angular.module('MyApp')
  .factory('Order', ['$resource', function ($resource) {

    return{

      saveOrderDetails: function()
      {
        return $resource('/api/saveOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListOrders: function()
      {
        return $resource('/api/ListOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderDetails: function()
      {
        return $resource('/api/getOrderDetails/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteOrder: function()
      {
        return $resource('/api/deleteOrder/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      }

    }
}]);