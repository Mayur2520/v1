angular.module('MyApp')
  .factory('Order', ['$resource', function ($resource) {

    return{

      saveOrderDetails: function()
      {
        return $resource('/api/saveOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      generateInvoice: function()
      {
        return $resource('/api/generateInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListOrders: function()
      {
        return $resource('/api/ListOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListInvoice: function()
      {
        return $resource('/api/ListInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderDetails: function()
      {
        return $resource('/api/getOrderDetails/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoicesOfCustomer: function()
      {
        return $resource('/api/getInvoicesOfCustomer/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteOrder: function()
      {
        return $resource('/api/deleteOrder/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      confirmToDilivary: function()
      {
        return $resource('/api/confirmToDilivary/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      }

    }
}]);