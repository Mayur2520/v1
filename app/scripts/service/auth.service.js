angular.module('MyApp')
  .factory('Authenticate', ['$resource', function ($resource) {

    return{

        authUser: function () {
            return $resource('/api/authUser',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        SetNewPassword: function () {
            return $resource('/api/SetNewPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
		getUserDetails: function () {
            return $resource('/api/getUserDetails/:userid', {});
        },
        checkConnection: function()
        {
            return "connected"
        }
    }

  }]);