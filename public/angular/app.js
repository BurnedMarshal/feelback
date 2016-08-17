/* global angular*/
angular.module('feelback', ['ngRoute', 'pascalprecht.translate', 'satellizer'])
    .config(['$translateProvider', '$authProvider', function($translateProvider, $authProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '/languages/locale-',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('escape');

        $authProvider.facebook({
            clientId: '279341862458487',
            responseType: 'token'
        });
    }]);
