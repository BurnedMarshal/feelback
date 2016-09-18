/* global angular*/
angular.module('feelback')
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        var lang = window.navigator.userLanguage || window.navigator.language;
      // console.log("lang:",lang);
        if (lang.length > 2) {
            lang = lang.substring(0, 2).toLowerCase();
        }
      // console.log(lang);
        if (!(lang === 'it' || lang === 'en')) {
            lang = 'en';
        }

        $routeProvider
            .when('/:lang/', {
                templateUrl: '/home',
                controller: 'homeController'
            })
            .when('/:lang/login', {
                templateUrl: '/login',
                controller: 'loginController'
            })
            .when('/:lang/users/:id', {
                templateUrl: '/users',
                controller: 'userController'
            })
            .when('/:lang/users/:id/me', {
                templateUrl: '/users/profile',
                controller: 'profileController'
            })
            .otherwise({
                redirectTo: lang + '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);
