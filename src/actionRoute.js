;(function() {
    'use strict';

    var ActionRouteProvider = function($routeProvider) {
        this.$routeProvider = $routeProvider;

        this.pathPerAction = {};
        this.isAbstractPerAction = {};
    };


    ActionRouteProvider.prototype = (function() {

        var determineRelativeUrl = function(routeOrRelativeUrl) {
            return (typeof routeOrRelativeUrl === 'string') ? routeOrRelativeUrl : routeOrRelativeUrl.url;
        };

        var determineAndStoreActionPath = function(
            pathPerAction, action, relativeUrl) {
            var lastDotIndex = action.lastIndexOf('.');

            var path;

            if (lastDotIndex !== -1) {
                var parentAction = action.substring(0, lastDotIndex);

                var pathOfParentAction = pathPerAction[parentAction];
                if (!pathOfParentAction) {
                    pathOfParentAction = '';
                }

                path = pathOfParentAction + relativeUrl;
            } else {
                path = relativeUrl;
            }

            pathPerAction[action] = path;

            return path;
        };


        return {
            constructor: ActionRouteProvider,

            abstractAction: function(action, relativeUrl) {
                determineAndStoreActionPath(
                    this.pathPerAction, action, relativeUrl);
                return this;
            },

            /**
             * @param {string} action
             * @param {string|Object} routeOrRelativeUrl
             * @returns {ActionRouteConfigurer}
             */
            whenAction: function(action, routeOrRelativeUrl) {
                console.log('<-- ' + angular.toJson(routeOrRelativeUrl));
                var relativeUrl = determineRelativeUrl(routeOrRelativeUrl);

                var path = determineAndStoreActionPath(
                    this.pathPerAction, action, relativeUrl);

                var route = (typeof routeOrRelativeUrl === 'object') ? angular.copy(routeOrRelativeUrl) : {};
                if (typeof routeOrRelativeUrl === 'object') {
                    delete route.url;
                }

                route.action = action;

                route.purgeScopeOnRouteParams = [];

                //TODO: only add relevant routeParams to purgeScopeOnRouteParams
                //  ; this should be the "abstract" parent actions(s) + the
                //  relativeUrl

                angular.forEach(path.split(/\W/), function(param) {
                    if (!(new RegExp("^\\d+$").test(param)) &&
                        param && (new RegExp("(^|[^\\\\]):" + param +
                        "(\\W|$)").test(path))) {
                        route.purgeScopeOnRouteParams.push(param);
                    }
                });


                console.log('' + path + ' -> ' + angular.toJson(route));

                this.$routeProvider.when(path, route);

                return this;
            },

            otherwise: function(params) {
                this.$routeProvider.otherwise(params);
                return this;
            },

            $get: function() {
                return null;
            }
        };
    }());

    angular.module('jdNestedViews.actionRoute', [])
        .provider('$actionRoute', ['$routeProvider', function($routeProvider) {
            return new ActionRouteProvider($routeProvider);
        }]);

}());
