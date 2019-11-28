angular.module('MyApp')
  .factory('Customer', ['$resource', function ($resource) {

    return{

        CustomerTypes: function () {
            return $resource('/api/CustomerTypes',
                {}, { 'query': { method: 'GET',isArray:true } });
        },
        getCustomerList: function()
        {
            return $resource('/api/getCustomerList',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        deleteCustomerDetails: function()
        {
            return $resource('/api/deleteCustomerDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        SaveCustomerDetails: function()
        {
            return $resource('/api/SaveCustomerDetails',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyCustomerEmail: function()
        {
            return $resource('/api/VerifyCustomerEmail',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyCustomerMobile: function()
        {
            return $resource('/api/VerifyCustomerMobile',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

    }
}]);