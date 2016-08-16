/* global angular*/
angular.module('feelback', ['ngRoute', 'pascalprecht.translate'])
    .config(['$translateProvider', function($translateProvider, $location, $routeParams) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/locale-',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('escape');
    }]);
