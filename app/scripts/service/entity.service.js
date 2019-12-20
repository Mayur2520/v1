angular.module('MyApp')
  .factory('Entity', ['$resource', 'Upload', function ($resource, Upload) {

    return{

        VerifyCompanyEmail: function () {
          return $resource('/api/VerifyCompanyEmail',
              {}, { 'save': { method: 'POST',isArray:false } });
      },
      VerifyCompanyMobile: function () {
          return $resource('/api/VerifyCompanyMobile',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

      ImporProductsDetails: function () {
          return $resource('/api/ImporProductsDetails',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

      getSession: function () {
          return $resource('/api/getSession',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

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
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyList: function () {
          return $resource('/api/getCompanyList/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteCompanyDetails: function () {
          return $resource('/api/deleteCompanyDetails/:companyid',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyDetails: function () {
          return $resource('/api/getCompanyDetails/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },
    }
  }]);