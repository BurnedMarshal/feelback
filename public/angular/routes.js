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
            .otherwise({
                redirectTo: lang + '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);
