/* global angular*/
/* global $*/
angular.module('feelback')
  .controller('mainController', ['$scope', '$rootScope', '$routeParams', '$translate', '$location', '$auth',
    function($scope, $rootScope, $routeParams, $translate, $location, $auth) {
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
                $location.path('/' + $scope.lang);
            });
        };
    }])
    .controller('homeController', ['$scope', '$auth', function($scope, $auth) {
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
    }])
    .controller('loginController', ['$scope', '$auth', '$location', function($scope, $auth, $location) {
        // $('body').removeClass('loaded');
        console.log('loginController');
        $('body').addClass('cyan');
        if ($auth.isAuthenticated()) {
            $location.path('/' + $scope.lang);
        }
        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
              .then(function(response) {
                  $location.path('/' + $scope.lang);
              })
              .catch(function(response) {
                  window.location = window.location.origin + '/error';
              });
        };
    }]);
