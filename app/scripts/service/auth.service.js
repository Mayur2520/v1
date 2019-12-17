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
        ForgotPassword: function () {
            return $resource('/api/ForgotPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        verifyOTP: function () {
            return $resource('/api/verifyOTP/:otp',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
		getUserDetails: function () {
            return $resource('/api/getUserDetails/:userid', {});
        },

		SignOut: function () {
            return $resource('/api/SignOut/',
            {}, { 'query': { method: 'GET',isArray:false } });
        },
        checkConnection: function()
        {
            return "connected"
        }
    }

  }]);