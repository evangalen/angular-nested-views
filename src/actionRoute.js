;(function() {
    'use strict';

    var ActionRouteProvider = function($routeProvider) {
        this.$routeProvider = $routeProvider;

        this.pathPerAction = {};
    };


    ActionRouteProvider.prototype = (function() {

        /**
         * @param {string|{url: string}} routeOrRelativeUrl
         * @returns {string}
         */
        var determineRelativeUrl = function(routeOrRelativeUrl) {
            return (typeof routeOrRelativeUrl === 'string') ? routeOrRelativeUrl : routeOrRelativeUrl.url;
        };

        /**
         * @param {Object.<string>} pathPerAction
         * @param {string} action
         * @param {string} relativeUrl
         * @returns {string}
         */
        var determineAndStoreActionPath = function(pathPerAction, action, relativeUrl) {
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

        /**
         * @param {Object.<Array.<string>>} paramsPerAction
         * @param {string} action
         * @param {Object.<string>} pathPerAction
         */
        var initParamsPerAction = function(paramsPerAction, action, pathPerAction) {
            var previousAction = null;

            var subActions = action.split('.');

            angular.forEach(subActions, function(subAction) {
                var currentAction = previousAction ? previousAction + '.' + subAction : subAction;

                var paramsForCurrentAction = [];

                var path = pathPerAction[currentAction];
                if (path) {
                    angular.forEach(path.split(/\W/), function(param) {
                        if (!(new RegExp("^\\d+$").test(param)) &&
                            param && (new RegExp("(^|[^\\\\]):" + param +
                            "(\\W|$)").test(path))) {
                            paramsForCurrentAction.push(param);
                        }
                    });

                    paramsPerAction[currentAction] = paramsForCurrentAction;
                }

                previousAction = currentAction;
            });
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
                var relativeUrl = determineRelativeUrl(routeOrRelativeUrl);

                var path = determineAndStoreActionPath(this.pathPerAction, action, relativeUrl);

                var route = (typeof routeOrRelativeUrl === 'object') ? angular.copy(routeOrRelativeUrl) : {};
                if (typeof routeOrRelativeUrl === 'object') {
                    delete route.url;
                }

                route.action = action;

                route.paramsPerAction = {};
                initParamsPerAction(route.paramsPerAction, action, this.pathPerAction);

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
