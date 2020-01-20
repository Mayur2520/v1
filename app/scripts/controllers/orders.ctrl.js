angular.module('MyApp')
	.controller('OrderController', ['$scope', '$rootScope' ,'$http', '$route', '$location', '$window', '$timeout', 'Order','Entity', 'Customer', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, Order, Entity, Customer) {



        $scope.dateOptions = {
            changeYear: false,
            changeMonth: false,
            yearRange:new Date().getFullYear()+':-0',
            minDate: new Date()
            };

        $scope.dateOptionsFilters = {
            changeYear: true,
            changeMonth: true,
            yearRange:'2019:-0',
            };

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
            var stringRev ="";
            for(var i= 0; i<str.length; i++){
                stringRev = str[i]+stringRev;
            }
            return stringRev;
    }

    $scope.userDetails = {};
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
              }).then(function(result) {
                if (result.value) {
                    Order.deleteOrder().query({ id: orderid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.ListOrders();
                      })
                    });
                  }
                });
        }

       
        $scope.setCartStatus = function()
        {
                $scope.orderDetails.cartStatus = 1;
        }


        $scope.setDilivaryStatusofOrder = function(orderDetails)
        {
            Swal({
                title: 'Please confirm details',
                text: "",
                html: "<div><table><tr><td>Customer:</td><td>"+orderDetails.cust_name+"</td></tr><tr><td>Order Date(Y/M/D):</td><td>"+formatDate(orderDetails.orderdate)+"</td></tr><tr><td>Ordered By:</td><td>"+orderDetails.ordered_by+"</td></tr></table></div>",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
              }).then(function(result)  {
                if (result.value) {
                    Order.confirmToDilivary().query({ id: orderDetails.id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
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
                                        value.dil_qty = orderitem.dil_qty;
                                        value.unit = orderitem.unit;
                                        value.orderdetailsid = orderitem.details_id;
                                    }
                                });
                            });
                        }
                        $scope.orderDetails.customername = $scope.orderdetails[0].cust_name;
                        $scope.orderDetails.orderid = $scope.orderdetails[0].orderid;
                         $scope.orderDetails.orderdate = $scope.orderdetails[0].orderdate;
                     }
                });     
        };

        $scope.getTotal = function(){
            var total = 0;
            for(var i = 0; i < $scope.orderdetails.length; i++){
                var product = $scope.orderdetails[i];
                if(isNaN(product.netprice))
                {
                    product.netprice = 0;
                }
                total += (product.netprice);
            }
            
            return total;
        }

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

        $scope.ListInvoice = function(invoiceDate_from, invoiceDate_to)
        {

            {
                if(invoiceDate_from)
                {
                    var fromInvoiceDate =  invoiceDate_from;
                }
                else
                {
                    var fromInvoiceDate =  new Date();
                }

                if(invoiceDate_to)
                {
                    var toInvoiceDate =  invoiceDate_to;
                }
                else
                {
                    var toInvoiceDate =  fromInvoiceDate;
                }
            }

            Order.ListInvoice().save([{fromInvoiceDate:formatDate(fromInvoiceDate),toInvoiceDate:formatDate(toInvoiceDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.invoiceList = response.invoiceList;
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

        $scope.setDilQtyAsQty = function(data)
        {
            data.dil_qty = data.qty;
            $scope.validateCartQty(data);
        }

        $scope.orderDetails = {};
        $scope.setCustomerDetails = function(customerDetails)
        {
            $scope.orderDetails.customername = customerDetails;
        }

        $scope.VerifyUserRole = function()
        {
            if($scope.userDetails.role == 'customer' || $scope.userDetails.role == 'customer_admin')
            {
                $scope.setCustomerDetails({customername:{id:$scope.userDetails.customerid}})
            }
        }

        $scope.saveOrderDetails = function()
        {
            if($scope.ProductsList)
            {
                var orderDetails = $scope.ProductsList.filter(function(value){
                        return value.orderdetailsid != undefined || value.qty != undefined && value.unit != null
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

                /* if($scope.orderDetails.orderdate)
                {
                    $scope.orderDetails.orderdate = formatDate($scope.orderDetails.orderdate)
                } */
                orderDetails[0].customerdetails = $scope.orderDetails;

                Order.saveOrderDetails().save(orderDetails).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.orderDetails = {};
                            $scope.getBackToOrderlist();
                            $scope.InitFunctions();
                        }
                    });
                });

            }
        };


        $scope.generateInvoice = function()
        {
            $scope.orderdetails[0].taxamt = 0;
            $scope.orderdetails[0].netamt = $scope.orderdetails[0].totalAmount + $scope.orderdetails[0].taxamt;
            Order.generateInvoice().save($scope.orderdetails).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function()  {
                    if(response.status == 0)
                    {
        
                    }
                    else
                    {
                        $scope.orderDetails = {};
                        $scope.getBackToOrderlist();
                        $scope.InitFunctions();
                    }
                });
            });
        }

        $scope.setSessionId = function(orderid)
        {
            $window.sessionStorage.setItem('orderid',orderid);
        }

        $scope.RedirectToInvoiceView = function(id,path)
        {
            $scope.setSessionId(id);
            $location.path( "/"+path );
        }

        $scope.paymentDateils = [];

        $scope.getInvoicesOfCustomer = function(customerDetails)
        {


            Order.getInvoicesOfCustomer().query({'customerid':customerDetails.id}).$promise.then(function (response) {
                if(!response.status)
                {
                    $window.sessionStorage.setItem('customerid',customerDetails.id);
                    $window.sessionStorage.setItem('customername',customerDetails.name);
                   $scope.CustomerInvoicesList = response.invoiceList;
                }
            });
        };

        $scope.togglePaymentMethod = function(btntype)
        {
            if(btntype == 'orderwise')
            {
                $scope.paymentDateils.againestOrder = true;
                $scope.paymentDateils.paidlumpsum = false;
            }
            else
            {
                $scope.paymentDateils.againestOrder = false;
                $scope.paymentDateils.paidlumpsum = true;
            }
          
        }

        $scope.getInvoiceDetailsForPayment = function()
        {
            Order.getInvoiceDetailsForPayment().query({'orderid':$window.sessionStorage.getItem('orderid')}).$promise.then(function (response) {
                if(!response.status)
                {
                   $scope.PaymentinvoiceDetails = response.invoicedetails;
                }
                });
        }

        $scope.orderList = false;
        $scope.toggleOrderList = function()
        {
            if($scope.orderList == false)
            $scope.orderList = true;
            else
            $scope.orderList = false;
        }
       

        $scope.getPaymentsList = function(PaymentDate_from, PaymentDate_to)
            {
    
                {
                    if(PaymentDate_from)
                    {
                        var fromPaymentDate =  PaymentDate_from;
                    }
                    else
                    {
                        var fromPaymentDate =  new Date();
                    }
    
                    if(PaymentDate_to)
                    {
                        var toPaymentDate =  PaymentDate_to;
                    }
                    else
                    {
                        var toPaymentDate =  fromPaymentDate;
                    }
                }
    
                Order.getPaymentsList().save([{fromPaymentDate:formatDate(fromPaymentDate),toPaymentDate:formatDate(toPaymentDate)}]).$promise.then(function (response) {
                    if(!response.status)
                    $scope.PaymentsList = response.PaymentsList;
                }); 
        }

        $scope.savePaymentDetails = function()
        {
                Order.savePaymentDetails().save($scope.PaymentinvoiceDetails[0]).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.PaymentinvoiceDetails = [];
                            $scope.getBackToOrderlist();
                        }
                    });
                });
        }

        function getTotalAmount()
        {
            // return $scope.InvoiceListforPayments.reduce((sum, value) => sum + value.pendingpayment, 0)
            return $scope.InvoiceListforPayments.reduce(function(sum, value){sum + value.pendingpayment}, 0)
        }

        $scope.getInvoiceListForLumsumPayment = function(amount)
        {
            $scope.lumsumpaidamout = amount;
            if(amount)
            {
                Order.getInvoiceListForLumsumPayment().query({amount:amount, customerid:$window.sessionStorage.getItem('customerid')}).$promise.then(function(response){
                   
                        if(!response.status)
                        {
                            $scope.InvoiceListforPayments = response.invoiceList;
                            $scope.TotalPaymentAmount = getTotalAmount();
                        }
                });
            }
        }

        $scope.getCustomerAdvancePayment = function()
        {
            $scope.lumsumpaymentDetails = [];

                Order.getCustomerAdvancePayment().query({customerid:$window.sessionStorage.getItem('customerid')}).$promise.then(function(response){
                   
                        if(!response.status)
                        {
                            $scope.advanceAmount = response.amount;
                        }
                });
        }

        $scope.getPatmentDetails = function(paymentDetails)
        {
           $scope.paymentDetails = [paymentDetails] ;
        }

        $scope.deletePaymentDetails = function(paymentid)
        {
            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then(function(result) {
                if (result.value) {
                    Order.deletePaymentDetails().query({ id: paymentid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.getPaymentsList();
                      })
                    });
                  }
                });
        }

        $scope.PaymentMode = 'Cash';
        $scope.setPaymentMode = function(mode)
        {
            $scope.PaymentMode = mode;
        }

        $scope.getCustomerName = function()
        {
            return String($window.sessionStorage.getItem('customername'));
        }

       

        $scope.ValidatePaymentConditions = function()
        {
            if($scope.paymentamount != undefined && $scope.paymentamount > 0)
            {
                if($scope.lumsumpaymentDetails != undefined && ($scope.lumsumpaymentDetails[0].payment_date != undefined && $scope.lumsumpaymentDetails[0].payment_date != "Invalid Date") && ($scope.lumsumpaymentDetails[0].payment_mode != undefined))
                {
                   return true
                }
            }
            else
            {
                return false
            }

        }

        $scope.saveLumsumPaymentDetails = function()
        {

            $scope.InvoiceListforPayments[0].paymentDetails = $scope.lumsumpaymentDetails[0];
            Order.saveLumsumPaymentDetails().save($scope.InvoiceListforPayments).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function()  {
                    if(response.status == 0)
                    {
        
                    }
                    else
                    {
                        $scope.lumsumpaymentDetails = [];
                        $scope.getBackToOrderlist();
                    }
                });
            });
        }

        $scope.getCompanyDetailsforInvoice = function()
        {
            Entity.getCompanyDetails().query({}).$promise.then(function(response){
              
                    if(!response.status)
                    {
                        $scope.companyDetails = response.companyDetails;
                    }
            });
        }

        $scope.printInvoice = function(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=300,height=300');
            popupWin.document.open();
            var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://103.252.7.5:8029/styles/style.css" /><link rel="stylesheet" href="http://103.252.7.5:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > th{border:1.2px solid black;}</style></head><body onload="window.print()"><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:5px;padding-left:7px;">' + printContents + '</div></div></body></html>';

            //'<html><head><link rel="stylesheet" type="text/css" href="http://103.252.7.5:8029/styles/style.css" /><link rel="stylesheet" href="http://103.252.7.5:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body onload="window.print()">' + printContents + '</body></html>'
            popupWin.document.write(htmlContent);
            popupWin.document.close();
          } 

        $scope.shareInvoice = function(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            // var billheader = document.getElementById('bill-header').innerHTML;

                var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://103.252.7.5:8029/styles/style.css" /><link rel="stylesheet" href="http://103.252.7.5:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > th{border:1.2px solid black;}</style></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:4px;padding-left:11.2px;position:relative;top:-20px;">' + printContents + '</div></div></body></html>';

                //var billHeaderContent = '<html><head><link rel="stylesheet" type="text/css" href="http://103.252.7.5:8029/styles/style.css" /><link rel="stylesheet" href="http://103.252.7.5:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 pl-2 pr-2">' + billheader + '</div></div></body></html>';

                var billHeaderContent = '';




                

                var height = $( '#'+divName ).height();
                var width = $( '#'+divName ).width();
                
               

                Order.shareInvoice().save({billheader:billHeaderContent,invoiceContent:htmlContent,orderData: $scope.orderdetails[0],size:{height:height,width:width}}).$promise.then(function(response){
                    window.open("http://103.252.7.5:8029/invoices/"+response.filename);
                });

          } 


          $scope.ListOrdersReport = function(order_Date_from, orer_date_to)
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

           /*  Order.ListOrders().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.ordersList = response.ordersList;
            }); */
        };



        $scope.getTotalQtyFromReport = function(productid, cust_id)
        {
            if($scope.SaledReportData && $scope.SaledReportData != null)
            {
                var filteredData =  $scope.SaledReportData.filter(function(value){
                     return (value.product_id == productid && value.cust_id == cust_id)
                 })
                    return filteredData[0].total_qty;
            }
            else
            return 0
        }
      
        $scope.getQtySaledReport = function(order_Date_from, orer_date_to)
        {
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

            Order.getQtySaledReport().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.SaledReportData = response.SaledReportData;

            });
        };

        $scope.SetCustomerid = function(cust_id)
        {
            $scope.Customerid = cust_id;
        }


        $scope.getOrderReport = function(customerdetails, order_Date_from, order_date_to)
        {
            if( ($scope.Customerid &&  $scope.Customerid > 0))
            {
                var customerid = $scope.Customerid;
                $scope.SetCustomerid(customerid)
            }
            if((customerdetails && customerdetails.id))
            {
                var customerid = customerdetails.id;
                $scope.SetCustomerid(customerid)
            }
           
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(order_date_to)
                {
                    var to_orderDate =  order_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.getOrderReport().save([{customerid:customerid, from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.orderReportData = response.orderReportData;
                console.log( $scope.orderReportData)
            });
        };

        $scope.CalculateTotalAmountInReport = function()
        {
            var totalamt = 0;
            $scope.orderReportData.map(function(value){
                totalamt = totalamt+ value.net_amount;
            })

           return totalamt;
        }


    }]);