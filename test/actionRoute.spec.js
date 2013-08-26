describe('$actionRouteProvider', function() {
    'use strict';

    var $routeProvider;
    var $actionRouteProvider;

    beforeEach(module('jdNestedViews.actionRoute', function(_$routeProvider_, _$actionRouteProvider_) {
        $routeProvider = _$routeProvider_;
        $actionRouteProvider = _$actionRouteProvider_;
    }));

    describe('$get', function() {
        it('should return null', inject(function() {
            expect($actionRouteProvider.$get()).toBeNull();
        }));
    });

    describe('otherwise', function() {
        it('should delegate to $routeProvider#otherwise', inject(function() {
            spyOn($routeProvider, 'otherwise');

            var expectedParams = {};

            var result = $actionRouteProvider.otherwise(expectedParams);

            expect(result).toBe($actionRouteProvider);
            expect($routeProvider.otherwise).toHaveBeenCalledWith(expectedParams);
        }));
    });
});