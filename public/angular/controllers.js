/* global angular*/
angular.module('feelback')
  .controller('mainController', ['$scope', '$rootScope', '$routeParams', '$translate', '$location', '$auth', '$sessionStorage',
    function($scope, $rootScope, $routeParams, $translate, $location, $auth, $sessionStorage) {
        $rootScope.fromTeam = false;
        console.log('Main controller loaded!');
        if ($location && $location.path() && $location.path().split('/').length > 1) {
            $scope.lang = $location.path().split('/')[1];
        }
        if ($scope.lang === 'it' || $scope.lang === 'en') {
            $translate.use($scope.lang);
        } else {
            $translate.use('en');
        }

        $rootScope.$on('$locationChangeStart', function() {
            $scope.lang = 'en';
            if ($location && $location.path() && $location.path().split('/').length > 1) {
                $scope.lang = $location.path().split('/')[1];
            }
            if ($scope.lang === 'it' || $scope.lang === 'en') {
                $translate.use($scope.lang);
            } else {
                $translate.use('en');
            }
        });

        $scope.loggedIn = function() {
            return $auth.isAuthenticated();
        };

        $scope.logout = function() {
            console.log('logout process');
            $auth.logout().then(function() {
                $location.path('/' + $scope.lang + '/login');
                $sessionStorage.currentUser = null;
            });
        };
    }])
  .controller('homeController', ['$scope', '$auth', 'Account', '$sessionStorage', '$location', function($scope, $auth, Account, $sessionStorage, $location) {
      console.log('homeController');
      $('body').removeClass('cyan');
      $('body').removeClass('loaded');
      setTimeout(function() {
          $('.dropdown-button').dropdown({
              inDuration: 300,
              outDuration: 225,
              constrain_width: false, // Does not change width of dropdown to that of the activator
              hover: true, // Activate on hover
              gutter: 0, // Spacing from edge
              belowOrigin: true, // Displays dropdown below the button
              alignment: 'left' // Displays dropdown with edge aligned to the left of button
          });
      }, 10);
      $scope.getProfile = function() {
          Account.getProfile()
            .then(function(response) {
                $sessionStorage.currentUser = response.data;
                $location.path('/' + $scope.lang + '/users/' + $sessionStorage.currentUser.uuid + '/me');
                // console.log($scope.user);
            })
            .catch(function(response) {
                console.error(response);
            });
      };

      if ($auth.isAuthenticated()) {
          console.log($auth.getToken());
          $scope.getProfile();
      } else {
          $location.path('/' + $scope.lang + '/login');
      }
  }])
  .controller('loginController', ['$scope', '$auth', '$location', 'Account', function($scope, $auth, $location, Account) {
      // $('body').removeClass('loaded');
      console.log('loginController');
      $('body').addClass('cyan');
      if ($auth.isAuthenticated()) {
          $location.path('/' + $scope.lang);
      }

      $scope.authenticate = function(provider) {
          $auth.authenticate(provider)
            .then(function(response) {
                $auth.setToken(response.data.token);
                $location.path('/' + $scope.lang);
            })
            .catch(function(response) {
                window.location = window.location.origin + '/error';
            });
      };
  }])
  .controller('userController', ['$scope', '$auth', '$location', '$routeParams', 'User', function($scope, $auth, $location, $routeParams, User) {
      console.log('userController');
      $('body').removeClass('loaded');
      $('body').removeClass('cyan');
      setTimeout(function() {
          $('#slide-out').perfectScrollbar();
          $('.dropdown-button').dropdown({
              inDuration: 300,
              outDuration: 225,
              constrain_width: false, // Does not change width of dropdown to that of the activator
              hover: true, // Activate on hover
              gutter: 0, // Spacing from edge
              belowOrigin: true, // Displays dropdown below the button
              alignment: 'left' // Displays dropdown with edge aligned to the left of button
          });
      }, 10);
      $scope.user = User.get($routeParams.id)
      .error(function(data, status) {
          if (status === 404) {
              window.location = window.location.origin + '/not-found';
          } else {
              window.location = window.location.origin + '/error';
          }
      }).success(function(data) {
          $scope.user = data;
          console.log($scope.user);
      });
  }])
  .controller('profileController', ['$scope', '$auth', '$location', '$routeParams', 'User', function($scope, $auth, $location, $routeParams, User) {
      console.log('userController');
      $('body').removeClass('loaded');
      $('body').removeClass('cyan');
      setTimeout(function() {
          $('#slide-out').perfectScrollbar();
          $('.dropdown-button').dropdown({
              inDuration: 300,
              outDuration: 225,
              constrain_width: false, // Does not change width of dropdown to that of the activator
              hover: true, // Activate on hover
              gutter: 0, // Spacing from edge
              belowOrigin: true, // Displays dropdown below the button
              alignment: 'left' // Displays dropdown with edge aligned to the left of button
          });
      }, 10);
      $scope.user = User.get($routeParams.id)
      .error(function(data, status) {
          if (status === 404) {
              window.location = window.location.origin + '/not-found';
          } else {
              window.location = window.location.origin + '/error';
          }
      }).success(function(data) {
          $scope.user = data;
          console.log($scope.user);
      });
  }]);
