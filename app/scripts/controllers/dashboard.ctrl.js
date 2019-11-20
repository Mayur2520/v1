angular.module('MyApp')
	.controller('DashboardController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Dashboard', function ($scope, $http, $route, $location, $window, $timeout, Upload, Dashboard) {
        console.log('Dashboard ctrl works')

        $scope.dataarr = [];

        for(var i = 0 ; i < 30;i++)
        {
            $scope.dataarr.push(i)
        }

        $scope.clickFuntion = function()
        {
            console.log('1111111')
            alert('1');
        }

    }]);

