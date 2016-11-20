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
          extendedSearch: function(location, work, minAge, maxAge) {
              var apiUrl = '/api/v1/users/ext_search?';
              var args = false;
              if (location) {
                  apiUrl += 'location=' + location;
                  args = true;
              }
              if (work) {
                  if (args) {
                      apiUrl += '&';
                  }
                  apiUrl += 'work=' + work;
                  args = true;
              }
              if (minAge) {
                  if (args) {
                      apiUrl += '&';
                  }
                  apiUrl += 'minAge=' + minAge;
                  args = true;
              }
              if (maxAge) {
                  if (args) {
                      apiUrl += '&';
                  }
                  apiUrl += 'maxAge=' + maxAge;
                  args = true;
              }
              return $http.get(apiUrl);
          },
          recommendedPeople: function(query) {
              return $http.get('/api/v1/users/recommendedPeople?name=' + query);
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
