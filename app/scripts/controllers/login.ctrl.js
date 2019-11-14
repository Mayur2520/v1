angular.module('MyApp')
	.controller('LoginController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Authenticate', function ($scope, $http, $route, $location, $window, $timeout, Upload, Authenticate) {

        $scope.fieltype = 'password';
        $scope.AuthenticateUser = function()
        {
            Authenticate.authUser().save($scope.user).$promise.then(function (response) {
                if (response.success === true) {
                    $location.path('/set_new_password');
					/* if(response.firstlogin === 0)
					{
						$location.path('/set_new_password');
					}
					else
					$location.path('/dashboard'); */
				}
				if (response.success === false) {
					$scope.errormsg = response.message
				}
              },
              function (err) {

              });
        };

        $scope.changeFieldType = function()
        {
            if($scope.fieltype == 'password')
            {
                $scope.fieltype = 'text';
                document.getElementById("password-eye").classList.remove('fa-eye');
                document.getElementById("password-eye").classList.add('fa-eye-slash');
            }
            else
            {
                $scope.fieltype = 'password';
                document.getElementById("password-eye").classList.remove('fa-eye-slash');
                document.getElementById("password-eye").classList.add('fa-eye');
            }
        }


        /* PAGINATION */
  
  
		$scope.checkcurrpage=function(myValue){
			
			if(myValue == null || myValue == 0)
				myValue = 1;
			
		if(!myValue){
		 window.document.getElementById("mypagevalue").value = $scope.currentPage+1;
		 var element = window.document.getElementById("mypagevalue");
		 if(element)
			 element.focus();
		$scope.currentPage = $scope.currentPage;
		$scope.myValue = null;
		}
		
		else{
			$scope.dispval = "";
			if(myValue-1 <= 0){
				$scope.currentPage=0;
			}
			else{
				$scope.currentPage=myValue-1;
				
				if(!$scope.currentPage){$scope.currentPage=0;}
			}
		}};
			
			$scope.pagination = function(listdata)
			{
					$scope.recordsdisplay = [{value:10,name:10},{value:25,name:25},{value:50,name:50},{value:100,name:100},{value:listdata.length,name:'All'}]
					$scope.currentPage = 0;
					$scope.pageSize = 10;
					if($scope.myValue > listdata.length)
					{
						$scope.myValue = 1;
					}
								$(".loader").fadeOut("slow");
					$scope.numberOfPages = function () {
						return Math.ceil(listdata.length / $scope.pageSize);
					};
			};
	
  
  /* PAGINATION */


  /* PASSWORD STRAINTH */

  
  function scorePassword(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i=0; i<pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    }

    variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] == true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
}

function checkPassStrength(pass) {
    var score = scorePassword(pass);
		if (score > 80)
		{
			if($scope.confirm_password === $scope.UserDetails[0].password)
			{
				$('#resetpassbtn').prop('disabled', false);
			}
			return "Strong";
		}
		if (score > 60)
		{
			if($scope.confirm_password === $scope.UserDetails[0].password)
			{
				$('#resetpassbtn').prop('disabled', false);
			}
			return "Good";
		}
		if (score >= 30)
		{
			return "Weak";
		}
	
		
    return "";
}

function ColorPassword(pass) {
    var score = scorePassword(pass);
    if (score > 80)
        return "green";
    if (score > 60)
        return "#FFDB00";
    if (score >= 30)
        return "red";

    return "";
}

   $scope.verfiPasswordConf = function(password,confpassword)
  {
		if(confpassword)
		{
			if(confpassword != password)
			{
				$scope.passstrenth = "Password and confirm password does not match";
				$('#resetpassbtn').prop('disabled', true);
			}
			if(confpassword === password)
			{
				$scope.passstrenth = (checkPassStrength(password));
			}
		}
  };
  
  
  $scope.verifyPasswordStrongness = function(passkey)
  {
		if(!passkey || passkey === '')
		$scope.passwordcalc = false;
		else
		$scope.passwordcalc = true;
	
		$scope.passstrenth = (checkPassStrength(passkey));
        $scope.passscore = (scorePassword(passkey));
        $scope.prgcol = (ColorPassword(passkey));
		
		$scope.verfiPasswordConf(passkey,$scope.confirm_password);
		
  };

  /* PASSWORD STRAINTH */


  $scope.SetNewPassword = function () {
    Authenticate.SetNewPassword().save($scope.UserDetails).$promise.then(function (response) {

    });
  };
        


    }]);