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
    .when("/customers", {
      templateUrl : "public/customers.html",
       controller:"CustomerController"
    })
    .when("/users", {
      templateUrl : "public/users.html",
       controller:"CustomerController"
    })
    .when("/orders", {
      templateUrl : "public/orderes.html",
       controller:"OrderController"
    })

    .when("/place_order", {
      templateUrl : "public/place_order.html",
       controller:"OrderController"
    })
    .when("/cart_filling", {
      templateUrl : "public/cart_filling.html",
       controller:"OrderController"
    })
    .when("/view_order", {
      templateUrl : "public/view_order.html",
       controller:"OrderController"
    })
    .when("/invoice_generate", {
      templateUrl : "public/invoice_generate.html",
       controller:"OrderController"
    })
    .when("/invoice", {
      templateUrl : "public/invoice.html",
       controller:"OrderController"
    })
    .when("/payment", {
      templateUrl : "public/payment.html",
       controller:"OrderController"
    })
	.otherwise({
		  redirectTo: ''
		});
})