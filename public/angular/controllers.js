/* global angular*/
angular.module('feelback')
  .controller('mainController', ['$scope', '$rootScope', '$routeParams', '$translate', '$location', '$auth', '$localStorage',
    function($scope, $rootScope, $routeParams, $translate, $location, $auth, $localStorage) {
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
                $localStorage.currentUser = null;
            });
        };

        $('#modalSearch').css('height', $(window).height())
        .css('max-height', $(window).height())
        .css('width', '100%');

        $scope.searchModal = function() {
            $('#modalSearch').openModal();
        };
    }])
  .controller('homeController', ['$scope', '$auth', 'Account', '$localStorage', '$location', function($scope, $auth, Account, $localStorage, $location) {
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
                $localStorage.currentUser = response.data;
                $location.path('/' + $scope.lang + '/users/' + $localStorage.currentUser.uuid + '/me');
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
  .controller('userController', ['$scope', '$auth', '$location', '$routeParams', 'User', 'Judgement', function($scope, $auth, $location, $routeParams, User, Judgement) {
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
      User.get($routeParams.id)
      .error(function(data, status) {
          if (status === 404) {
              window.location = window.location.origin + '/not-found';
          } else {
              window.location = window.location.origin + '/error';
          }
      }).success(function(data) {
          $scope.user = data;
          Judgement.get($routeParams.id)
          .error(function(data, status) {
              $scope.judgement = {};
              console.error(data);
          }).success(function(data) {
              $scope.judgement = data.judgement;
              console.log("Judgement: ", $scope.judgement);
          });
          Judgement.direct($routeParams.id)
          .error(function(data, status) {
              $scope.myJudgement = {};
              console.error(data);
          }).success(function(data) {
              $scope.directJudgement = data.judgement;
              $scope.myJudgement = angular.copy($scope.directJudgement);
              console.log("MY Judgement: ", $scope.myJudgement);
          });
      });

      $scope.userLocation = function() {
          try {
              return JSON.parse($scope.user.location).name;
          } catch (e) {
              return '';
          }
      };
      $scope.userWork = function() {
          try {
              return JSON.parse($scope.user.work)[0].position.name;
          } catch (e) {
              return '';
          }
      };

      $scope.vote = function(type) {
          $scope.newType = type;
          $('#modalVote').openModal();
      };

      $scope.judge = function() {
          Judgement.set($routeParams.id, $scope.myJudgement)
          .error(function(data, status) {
              console.error(data);
          }).success(function(data) {
              $scope.directJudgement = data.judgement;
              $('#modalVote').closeModal();
              console.log("New directJudgement: ", $scope.directJudgement);
          });
      };
  }])
  .controller('profileController', ['$scope', '$auth', '$location', '$routeParams', 'User', '$localStorage',
    function($scope, $auth, $location, $routeParams, User, $localStorage) {
        console.log('userController');
        if (!$auth.isAuthenticated() && $localStorage.currentUser.uuid !== $routeParams.id) {
            $location.path('/' + $scope.lang + '/users/' + $routeParams.id);
        }
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
        $scope.user = $localStorage.currentUser;
        User.network()
          .error(function(data, status) {
              console.error(data);
              if (status === 404) {
                  window.location = window.location.origin + '/not-found';
              } else {
                  window.location = window.location.origin + '/error';
              }
          }).success(function(data) {
              $scope.network = data;
              console.log($scope.network);
          });
        $scope.userLocation = function() {
            try {
                return JSON.parse($scope.user.location).name;
            } catch (e) {
                return '';
            }
        };
        $scope.userWork = function() {
            try {
                return JSON.parse($scope.user.work)[0].position.name;
            } catch (e) {
                return '';
            }
        };
    }]);
