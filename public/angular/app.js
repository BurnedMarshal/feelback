/* global angular*/
angular.module('feelback', ['ngRoute', 'pascalprecht.translate', 'satellizer', 'ngStorage'])
    .config(['$translateProvider', '$authProvider', function($translateProvider, $authProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '/languages/locale-',
            suffix: '.json'
        });
        $translateProvider.useSanitizeValueStrategy('escape');

        $authProvider.facebook({
            clientId: '280806872311986',
            // responseType: 'token',
            requiredUrlParams: ['display', 'scope'],
            scope: ['email', 'user_friends', 'user_hometown', 'user_location', 'user_birthday', 'user_work_history'],
            scopeDelimiter: ','
            // url: '/auth/facebook',
            /* authorizationEndpoint: 'https://www.facebook.com/v2.7/dialog/oauth',
            redirectUri: window.location.origin + '/',
            requiredUrlParams: ['display', 'scope'],
            scope: ['email'],
            scopeDelimiter: ',',
            display: 'popup',
            oauthType: '2.0'// ,
            // popupOptions: {width: 580, height: 400}*/
        });
    }]);
