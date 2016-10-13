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
          },
          search: function(query) {
              return $http.get('/api/v1/users/search?name=' + query);
          },
          stats: function(id) {
              return $http.get('/api/v1/users/' + id + '/stats');
          },
          addView: function(id) {
              return $http.post('/api/v1/users/' + id + '/view');
          }
      };
  }])
  .factory('Judgement', ['$http', function($http) {
      return {
          get: function(id) {
              return $http.get('/api/v1/judgement/users/' + id);
          },
          set: function(id, judgement) {
              return $http.post('/api/v1/judgement/users/' + id, {judgement: judgement});
          },
          delete: function(id) {
              return $http.delete('/api/v1/judgement/users/' + id);
          },
          direct: function(id) {
              return $http.get('/api/v1/judgement/' + id);
          }
      };
  }]);
