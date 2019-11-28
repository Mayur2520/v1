angular.module('MyApp')
	.controller('EntityController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Entity', function ($scope, $http, $route, $location, $window, $timeout, Upload, Entity) {
        console.log('Entity ctrl works')

        $scope.config = {
            itemsPerPage: 5,
            fillLastPage: true
          }
          $scope.productDetails = [{marathi_name:null}];

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

        $scope.productTypes = function()
        {
               
                Entity.productTypes().query().$promise.then(function (response) {
                    $scope.product_type = response;
                });
               
        };

        $scope.productUnits = function()
        {
               
                Entity.productUnits().query().$promise.then(function (response) {
                    return  response;  
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

        $scope.resetSelection = function()
        {
            angular.element("input[type='file']").val(null);
            $(".custom-file-input").siblings(".custom-file-label").removeClass("selected").html("Choose file");
        }

          // IMPORT PRODUCTS DETAILS

          $scope.SelectedFileForUpload = null;
 
          $scope.UploadFile = function (files) {
              $scope.$apply(function () { //I have used $scope.$apply because I will call this function from File input type control which is not supported 2 way binding
                  $scope.Message = "";
                  $scope.SelectedFileForUpload = files[0];
              })
          }
       
          //Parse Excel Data 
          $scope.ParseExcelDataAndSave = function () {
              var file = $scope.SelectedFileForUpload;
              if (file) {
                  var reader = new FileReader();
                  reader.onload = function (e) {
                      var data = e.target.result;
                      //XLSX from js-xlsx library , which I will add in page view page
                      var workbook = XLSX.read(data, { type: 'binary' });
                      var sheetName = workbook.SheetNames[0];
                      var excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                      if (excelData.length > 0) {
                          //Save data 
                          $scope.ImporProductsDetails(excelData);
                      }
                      else {
                          $scope.Message = "No data found";
                      }
                  }
                  reader.onerror = function (ex) {
                      console.log(ex);
                  }
       
                  reader.readAsBinaryString(file);
              }
              else{
                  $scope.errormsg = "Please select The file first."
              }
          }
       
          // Save excel data to our database
          $scope.ImporProductsDetails = function (excelData) {
            Entity.ImporProductsDetails().save(excelData).$promise.then(function (response) {
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
                      $scope.resetSelection();
                      $('#ModalImportProductsDetails').modal('hide');
                      $scope.getProductList();
                  }
              });
          });
          }
          

          $scope.MarathiCharSet = [
              'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','`',1,2,3,4,5,6,7,8,9,0,'-','=','~','!','@','#','$','%','^','&','*','(',')','_','+','{','}','[',']',';',':','\"','\'','\\',',','<','.','>','/','?'
          ];
          console.log($scope.MarathiCharSet.length)
          $scope.createWordFromLatter = function(char)
          {
            $scope.productDetails[0].marathi_name = $scope.productDetails[0].marathi_name + char
          }

    }]);

