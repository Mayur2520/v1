angular.module('MyApp')
  .factory('Order', ['$resource', function ($resource) {
    var endurl= 'http://localhost:8029';
    return{

      saveOrderDetails: function()
      {
        return $resource(endurl+'/api/saveOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      generateInvoice: function()
      {
        return $resource(endurl+'/api/generateInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListOrders: function()
      {
        return $resource(endurl+'/api/ListOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListInvoice: function()
      {
        return $resource(endurl+'/api/ListInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getPaymentsList: function()
      {
        return $resource(endurl+'/api/getPaymentsList',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      savePaymentDetails: function()
      {
        return $resource(endurl+'/api/savePaymentDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      saveLumsumPaymentDetails: function()
      {
        return $resource(endurl+'/api/saveLumsumPaymentDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      shareInvoice: function()
      {
        return $resource(endurl+'/api/shareInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderDetails: function()
      {
        return $resource(endurl+'/api/getOrderDetails/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoicesOfCustomer: function()
      {
        return $resource(endurl+'/api/getInvoicesOfCustomer/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteOrder: function()
      {
        return $resource(endurl+'/api/deleteOrder/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      confirmToDilivary: function()
      {
        return $resource(endurl+'/api/confirmToDilivary/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoiceDetailsForPayment: function()
      {
        return $resource(endurl+'/api/getInvoiceDetailsForPayment/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deletePaymentDetails: function()
      {
        return $resource(endurl+'/api/deletePaymentDetails/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoiceListForLumsumPayment: function()
      {
        return $resource(endurl+'/api/getInvoiceListForLumsumPayment/:amount/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCustomerAdvancePayment: function()
      {
        return $resource(endurl+'/api/getCustomerAdvancePayment/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getQtySaledReport: function()
      {
        return $resource(endurl+'/api/getQtySaledReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderReport: function()
      {
        return $resource(endurl+'/api/getOrderReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },
// purchase
      ListPOOrders: function()
      {
        return $resource(endurl+'/api/ListPOOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      savePurchaseOrderDetails: function()
      {
        return $resource(endurl+'/api/savePurchaseOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },
    }
}]);