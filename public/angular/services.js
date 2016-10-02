/* global angular*/
angular.module('feelback')
  .factory('Account', ['$http', function($http) {
      return {
          getProfile: function() {
              return $http.get('/api/v1/users/me');
          }
      };
  }])
  .factory('User', ['$http', function($http) {
      return {
          get: function(id) {
              return $http.get('/api/v1/users/' + id);
          },
          network: function() {
              return $http.get('/api/v1/users/network');
          }
      };
  }])
  .factory('Judgement', ['$http', function($http) {
      return {
          get: function(id) {
              return $http.get('/api/v1/judgement/users/' + id);
          }
      };
  }]);
