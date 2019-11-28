angular.module('MyApp')
	.controller('OrderController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Order','Entity', 'Customer', function ($scope, $http, $route, $location, $window, $timeout, Order, Entity, Customer) {


        $scope.getProductList = function()
        {
               
                Entity.getProductList().query().$promise.then(function (response) {
                    if(!response.status)
                        $scope.ProductsList = response.productsList;     
                });
               
        };


        $scope.productUnits = function()
        {
               
                Entity.productUnits().query().$promise.then(function (response) {
                    $scope.productUnit = response;  
                });
               
        };


        $scope.validateEntries = function(data)
        {

            return ((data.qty != undefined && data.qty > 0) && data.prunit != null)
            
        };

        $scope.getCustomerList = function()
        {
                 Customer.getCustomerList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.CustomersList = response.customerList;
                });      
        };

        $scope.InitFunctions = function()
        {
            $scope.getProductList();
            $scope.productUnits();
            $scope.getCustomerList();
        }

    }]);