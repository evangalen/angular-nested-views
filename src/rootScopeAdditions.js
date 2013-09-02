;(function() {
    'use strict';

    /** const */
    var subActionIndexProperty = '$$_subActionIndex';

    angular.module('jdNestedViews.rootScopeAdditions', [])
        .run(['$rootScope', '$route', function($rootScope, $route) {

            $rootScope.$$_subActions = [];

            $rootScope.nextSubAction = function() {
                var $scope = this;

                var index;

                if ($scope.hasOwnProperty(subActionIndexProperty)) {
                    index = $scope[subActionIndexProperty];
                } else {
                    index = $scope.$parent &&
                        angular.isDefined($scope.$parent[subActionIndexProperty])
                                ? $scope.$parent[subActionIndexProperty] + 1 : 0;

                    $scope[subActionIndexProperty] = index;
                }

                return $rootScope.$$_subActions[index];
            };

            $rootScope.$_currentAction = function() {
                var $scope = this;

                var subActionIndex = $scope[subActionIndexProperty];

                if (typeof subActionIndex !== 'number') {
                    throw 'No current sub action found';
                }

                return $rootScope.$$_subActions
                    .slice(0, subActionIndex + 1)
                    .join('.');
            };


            $rootScope.$on('$routeChangeSuccess', function(event) {
                if (!$route.current) {
                    return;
                }

                var action = $route.current.action;
                if (!action) {
                    return;
                }

                $rootScope.$$_subActions = action.split('.');
            });
        }]);

}());
