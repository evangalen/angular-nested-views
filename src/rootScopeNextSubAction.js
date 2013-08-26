;(function() {
    'use strict';

    angular.module('jdNestedViews.rootScopeNextSubAction', [])
        .run(['$rootScope', '$route', function($rootScope, $route) {
            $rootScope.nextSubAction = function() {
                var $scope = this;
                var scopeProperty = '$$_subActionIndex';

                var index;

                if ($scope.hasOwnProperty(scopeProperty)) {
                    index = $scope[scopeProperty];
                } else {
                    index = $scope.$parent &&
                        angular.isDefined($scope.$parent[scopeProperty]) ? $scope.$parent[scopeProperty] + 1 : 0;

                    $scope[scopeProperty] = index;
                }

                return $rootScope.$$_subActions[index];
            };

            $rootScope.$$_subActions = [];


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
