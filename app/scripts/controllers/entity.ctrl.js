angular.module('MyApp')
	.controller('EntityController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Entity', function ($scope, $http, $route, $location, $window, $timeout, Upload, Entity) {
        console.log('Entity ctrl works')

        $scope.config = {
            itemsPerPage: 5,
            fillLastPage: true
          }

          $scope.getProductDetails = function(productDetails)
          {
            $scope.productDetails = [];
            $scope.productDetails.push(productDetails);
          };
        
        $scope.getProductList = function(productid)
        {
               
                Entity.deleteProductDetails().delete({ id: productid}).$promise.then(function (response) {   
                });
               
        };

        $scope.getProductList = function()
        {
               
                Entity.getProductList().query().$promise.then(function (response) {
                    if(!response.status)
                        $scope.ProductsList = response.productsList;     
                });
               
        };

        $scope.SaveProductDetails = function()
        {
            if ($scope.form.file.$valid && $scope.prdImage) {
                var passeddata = {
                  file: $scope.prdImage,
                  productDetails: $scope.productDetails[0]
                }
              } else {
                var passeddata = {
                  productDetails: $scope.productDetails[0]
                }
              }
              Upload.upload({
                url: '/api/saveProductDetails',
                data: passeddata
              }).then(function (resp) {
                Swal({
                  type: resp.data.type,
                  title: resp.data.title,
                  text: resp.data.message,
                }).then(() => {
                  location.reload();
                })
              }, function (resp) {
                Swal({
                  type: resp.data.type,
                  title: resp.data.title,
                  text: resp.data.message,
                }).then(() => {
                  location.reload();
                })
              }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                // console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
              });
        }

    }]);

