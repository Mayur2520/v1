angular.module('MyApp')
	.controller('OrderController', ['$scope', '$rootScope' ,'$http', '$route', '$location', '$window', '$timeout', 'Order','Entity', 'Customer', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, Order, Entity, Customer) {

        $scope.getBackToOrderlist = function()
        {
            $window.sessionStorage.removeItem('orderid');
            $window.history.back();
        };


        function formatDate(date){
           
            if(date)
            {
                var dd = new Date(date).getDate();
                var mm = new Date(date).getMonth()+1;
                var yy = new Date(date).getFullYear();
            }
        
            return yy+'/'+mm+'/'+dd;
    }

        function reverseString(str){
            let stringRev ="";
            for(let i= 0; i<str.length; i++){
                stringRev = str[i]+stringRev;
            }
            return stringRev;
    }

        function getSession()
        {
            Entity.getSession().query().$promise.then(function (response) {
                $scope.userDetails = response;    
            });   
        } getSession();

        $scope.getProductList = function()
        {
                Entity.getProductList().query().$promise.then(function (response) {
                    if(!response.status)
                        $scope.ProductsList = response.productsList;         
                });               
        };

        $scope.productTypes = function()
        {
               
                Entity.productTypes().query().$promise.then(function (response) {
                    $scope.product_type = response;
                    $scope.ProductsType=[{title:'All',value:''}];
                    $scope.product_type.map(function(value){
                        $scope.ProductsType.push({title:value,value:value})
                    });
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

        $scope.validateCartQty = function(newObj)
        {
                    if(newObj.qty <= newObj.dil_qty)
                    {
                        newObj.isQtySame = true;
                    }
                    if(newObj.qty > newObj.dil_qty)
                    {
                        newObj.lowQty = true;
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
                        if($scope.ProductsList && $scope.ProductsList.length > 0)
                        {
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
                        }
                        $scope.orderDetails.customername = $scope.orderdetails[0].cust_name;
                        $scope.orderDetails.orderid = $scope.orderdetails[0].orderid;
                        $scope.orderDetails.orderdate = new Date(new Date($scope.orderdetails[0].orderdate).setDate(new Date($scope.orderdetails[0].orderdate).getDate() +1));
                     }
                });     
        };

        $scope.ListOrders = function(order_Date_from, orer_date_to)
        {

            // if(order_Date_from ||  orer_date_to)
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(orer_date_to)
                {
                    var to_orderDate =  orer_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.ListOrders().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.ordersList = response.ordersList;
            });
        };

        $scope.InitFunctions = function()
        {
            $scope.getProductList();
            $scope.productUnits();
            $scope.productTypes();
            // if($scope.userDetails.role != 'customer')
             $scope.getCustomerList();
        

            if($window.sessionStorage.getItem('orderid') != null && $window.sessionStorage.getItem('orderid') > 0)
            {
                $scope.getOrderDetails();
            }
        }


        $scope.saveOrderDetails = function()
        {
            if($scope.ProductsList)
            {
                var orderDetails = $scope.ProductsList.filter(function(value){
                    return value.qty != undefined && value.unit != null
                })
            }
            else if($scope.orderdetails)
            {
                var orderDetails = $scope.orderdetails.filter(function(value){
                    return value.dil_qty != undefined
                })
            }

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