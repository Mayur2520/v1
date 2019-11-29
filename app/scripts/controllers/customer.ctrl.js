angular.module('MyApp')
	.controller('CustomerController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Customer', function ($scope, $http, $route, $location, $window, $timeout, Customer) {

        $scope.CustomerDetails = [];
        $scope.CustomerTypes = function()
        {
                 Customer.CustomerTypes().query().$promise.then(function (response) {
                    $scope.customer_type = response;
                });      
        };

        $scope.getCustomerDetails = function(customerdetails)
        {
            $scope.CustomerDetails.push(customerdetails);
        };

        $scope.getCustomerList = function()
        {
                 Customer.getCustomerList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.CustomersList = response.customerList;
                });      
        };

        $scope.deleteCustomerDetails = function(id)
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
                    Customer.deleteCustomerDetails().query({ id: id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(() => {
                        $scope.getCustomerList();
                      })
                    });
                  }
                });
        };

        $scope.VerifyCustomerContacts = function()
        {
            if($scope.CustomerDetails[0].email && $scope.CustomerDetails[0].email != '' && $scope.CustomerDetails[0].email != null)
            {
                Customer.VerifyCustomerEmail().save($scope.CustomerDetails[0]).$promise.then(function(response){
                    if(response.result[0].emailexist > 0)
                    {
                        $scope.emailexist = "Email ID already exist in record";
                    }
                    else
                    {
                        $scope.emailexist = undefined;  
                    }
                });
            }

            if($scope.CustomerDetails[0].mobile && $scope.CustomerDetails[0].mobile != '' && $scope.CustomerDetails[0].mobile != 0 && $scope.CustomerDetails[0].mobile != null)
            {
                Customer.VerifyCustomerMobile().save($scope.CustomerDetails[0]).$promise.then(function(response){
                    if(response.result[0].mobileexist > 0)
                    {
                        $scope.mobileexist = "Mobile already exist in record";
                    }
                    else
                    {
                        $scope.mobileexist = undefined;
                    }
                });
            }
        };

        $scope.SaveCustomerDetails = function()
        {
            Customer.SaveCustomerDetails().save($scope.CustomerDetails[0]).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                  }).then(() => {
                    $scope.getCustomerList();
                    if(response.status == 0)
                    {
                        $scope.CustomerDetails = [];
                    }
                  })
            });
        };

    }]);