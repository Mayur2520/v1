angular.module('MyApp', ['ngResource', 
'ngSanitize', 
'ngAnimate',
 'ngRoute', 
 'ui.bootstrap', 
 'ngFileUpload', 
 'ngCookies']).config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "public/login.html",
		controller:"LoginController"
    })
    .when("/set_new_password", {
      templateUrl : "public/setNewPassword.html",
       controller:"LoginController"
    })
    .when("/dashboard", {
      templateUrl : "public/dashboard.html",
       controller:"DashboardController"
    })
    .when("/products", {
      templateUrl : "public/products.html",
       controller:"EntityController"
    })
	.otherwise({
		  redirectTo: ''
		});
})