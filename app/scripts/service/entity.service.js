angular.module('MyApp')
  .factory('Entity', ['$resource', 'Upload', function ($resource, Upload) {

    return{

      getProductList: function () {
          return $resource('/api/getProductList',
              {}, { 'query': { method: 'GET',isArray:false } });
      },
    }
  }]);