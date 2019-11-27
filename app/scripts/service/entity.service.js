angular.module('MyApp')
  .factory('Entity', ['$resource', 'Upload', function ($resource, Upload) {

    return{

      getProductList: function () {
          return $resource('/api/getProductList',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      productTypes: function () {
          return $resource('/api/productTypes',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      productUnits: function () {
          return $resource('/api/productUnits',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      deleteProductDetails: function () {
          return $resource('/api/deleteProductDetails/:id',
              {}, { 'delete': { method: 'DELETE',isArray:false } });
      },
    }
  }]);