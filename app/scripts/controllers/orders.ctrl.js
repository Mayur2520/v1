angular.module('MyApp')
	.controller('OrderController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Order','Entity', 'Customer', function ($scope, $http, $route, $location, $window, $timeout, Order, Entity, Customer) {

        $scope.getBackToOrderlist = function()
        {
            $window.sessionStorage.removeItem('orderid');
            $window.history.back();
        };


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
                return ((data.qty != undefined && data.qty > 0) && data.unit != null)   
        };

        $scope.validateRecentlyUpdated = function(newObj, oldObj)
        {
            if(newObj != oldObj)
            {
                newObj.isRecentlyUpdated =true;
            }
        };

        $scope.getCustomerList = function()
        {
                 Customer.getCustomerList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.CustomersList = response.customerList;
                });      
        };

        $scope.deleteOrder = function(orderid)
        {
            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then((result) => {
                if (result.value) {
                    Order.deleteOrder().query({ id: orderid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(() => {
                        $scope.ListOrders();
                      })
                    });
                  }
                });
        }

        $scope.getOrderDetails = function()
        {
            $scope.orderDetails = {};
            Order.getOrderDetails().query({'orderid':$window.sessionStorage.getItem('orderid')}).$promise.then(function (response) {
                     if(!response.status)
                     {
                        $scope.orderdetails = response.orderDetails;
                        $scope.ProductsList.map(function(value){
                            $scope.orderdetails.map(function(orderitem){
                                if(value.id == orderitem.productid)
                                {
                                    value.qty = orderitem.qty;
                                    value.unit = orderitem.unit;
                                    value.orderdetailsid = orderitem.details_id;
                                }
                            });
                        });
                        $scope.orderDetails.customername = $scope.orderdetails[0].cust_name;
                        $scope.orderDetails.orderid = $scope.orderdetails[0].orderid;
                        $scope.orderDetails.orderdate = new Date(new Date($scope.orderdetails[0].orderdate).setDate(new Date($scope.orderdetails[0].orderdate).getDate() +1));
                     }
                });     
        };

        $scope.ListOrders = function()
        {
            Order.ListOrders().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.ordersList = response.ordersList;
                });      
        };

        $scope.InitFunctions = function()
        {
            $scope.getProductList();
            $scope.productUnits();
            $scope.getCustomerList();

            if($window.sessionStorage.getItem('orderid') != null && $window.sessionStorage.getItem('orderid') > 0)
            {
                $scope.getOrderDetails();
            }
        }


        $scope.saveOrderDetails = function()
        {

            var orderDetails = $scope.ProductsList.filter(function(value){
                return value.qty != undefined && value.unit != null
            })

            if(orderDetails.length > 0)
            {
                orderDetails[0].customerdetails = $scope.orderDetails;

                Order.saveOrderDetails().save(orderDetails).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(() => {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.orderDetails = {};
                            $scope.InitFunctions();
                        }
                    });
                });

            }
        };

        $scope.setSessionId = function(orderid)
        {
            $window.sessionStorage.setItem('orderid',orderid);
        }

    }]);