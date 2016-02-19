require.config({
    waitSeconds: 120,
    baseUrl : 'app/',
    IESelectorLimit: true,
    paths: {
        'angular'                  : 'libs/angular-flex/angular-flex',
        'angular-animate'          : 'libs/angular-animate/angular-animate.min',
        'angular-loading-bar'      : 'libs/angular-loading-bar/src/loading-bar',
        'angular-route'            : 'libs/angular-route/angular-route',
        'angular-storage'          : 'libs/angular-local-storage/dist/angular-local-storage.min',
        'angular-messages'         : 'libs/angular-messages/angular-messages.min',
        'app-css'                  : 'css/main',
        'bootstrap-css'            : 'libs/bootstrap/dist/css/bootstrap.min',
        'bootstrap'                : 'libs/bootstrap/dist/js/bootstrap',
        'css'                      : 'libs/require-css/css.min',
        'flag-icon-css'            : 'libs/flag-icon-css/css/flag-icon.min',
        'font-awsome-css'          : 'libs/font-awesome/css/font-awesome.min',
        'ionsound'                 : 'libs/ionsound/js/ion.sound.min',
        'jquery'                   : 'libs/jquery/dist/jquery',
        'linqjs'                   : 'libs/linqjs/linq.min',
        'lodash'                   : 'libs/lodash/lodash',
        'material-design-icons'    : 'libs/material-design-icons/iconfont/material-icons',
        'moment'                   : 'libs/moment/moment',
        'outdated-browser-css'     : 'libs/outdated-browser/outdatedbrowser/outdatedbrowser.min',
        'ng-breadcrumbs'           : 'libs/ng-breadcrumbs/dist/ng-breadcrumbs',
        'shim'                     : 'libs/require-shim/src/shim',
        'text'                     : 'libs/requirejs-text/text',
//        'URIjs'                    : 'libs/uri.js/src',
    },
    shim: {
        'libs/angular/angular'    : { deps: ['jquery'] },
        'angular'                 : { deps: ['libs/angular/angular'] },
        'angular-route'           : { deps: ['angular'] },
        'bootstrap'               : { deps: ['jquery'] },
        'guid'                    : { exports: 'ui_guid_generator' },
        'ng-breadcrumbs'          : { deps: ['angular'] },
        'ngAria'                  : { 'deps': ['angular']},
        'angular-animate'         : { 'deps': ['angular']},
        'ngMaterial'              : { 'deps': ['angular', 'angular-animate', 'ngAria'] },
        'angular-loading-bar'         : { deps: ['angular'] },
    },
    packages: [
      { name: 'scbd-angularjs-services', location : 'libs/scbd-angularjs-services/services' },
      { name: 'scbd-branding', location : 'libs/scbd-branding/directives' },
      { name: 'scbd-angularjs-filters',  location : 'libs/scbd-angularjs-services/filters' },
      { name: 'scbd-angularjs-controls', location : 'libs/scbd-angularjs-controls/form-control-directives' },
    ]
});

// BOOT

require(['angular', 'app', 'bootstrap','text', 'routes', 'template'], function(ng, app) {

    ng.element(document).ready(function () {
         ng.bootstrap(document, [app.name]);
    });
});

// Fix IE Console
(function(a){a.console||(a.console={});for(var c="log info warn error debug trace dir group groupCollapsed groupEnd time timeEnd profile profileEnd dirxml assert count markTimeline timeStamp clear".split(" "),d=function(){},b=0;b<c.length;b++)a.console[c[b]]||(a.console[c[b]]=d)})(window); //jshint ignore:line
