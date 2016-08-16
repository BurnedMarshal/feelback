/* global angular*/
angular.module('feelback')
  .controller('mainController', ['$scope', '$rootScope', '$routeParams', '$translate', '$location',
    function($scope, $rootScope, $routeParams, $translate, $location) {
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
    }])
    .controller('homeController', ['$scope', function($scope) {
        console.log('homeController');
    }]);
