describe('$actionRouteProvider', function() {
    'use strict';

    var $routeProvider;
    var $actionRouteProvider;

    beforeEach(module('jdNestedViews.actionRoute', function(_$routeProvider_, _$actionRouteProvider_) {
        $routeProvider = _$routeProvider_;
        $actionRouteProvider = _$actionRouteProvider_;
    }));

    it('should contain an (internal) "pathPerAction" property', inject(function() {
        expect($actionRouteProvider.pathPerAction).not.toBeNull();
        expect(_.keys($actionRouteProvider.pathPerAction).length).toBe(0);
    }));


    describe('$get', function() {
        it('should return null', inject(function() {
            expect($actionRouteProvider.$get()).toBeNull();
        }));
    });


    describe('abstractAction', function() {

        describe('should store the whole path of action in (internal) "pathPerAction" property', function() {

            it('for a top-level action', function() {
                var action = 'topLevelAction';
                var relativeUrl = '/aRelativeUrl';

                $actionRouteProvider.abstractAction(action, relativeUrl);

                expect($actionRouteProvider.pathPerAction[action]).toBe(relativeUrl);
            });

            it('for a sub action with an existing parent action', inject(function() {
                $actionRouteProvider.pathPerAction['subAction1'] = '/subAction1Url';

                $actionRouteProvider.abstractAction('subAction1.subAction2', '/subAction2Url');

                expect($actionRouteProvider.pathPerAction['subAction1.subAction2'])
                    .toBe('/subAction1Url/subAction2Url');
            }));

            it('for a sub action with an non-existing parent action', inject(function() {
                $actionRouteProvider.abstractAction('subAction1.subAction2', '/subAction2Url');

                expect($actionRouteProvider.pathPerAction['subAction1.subAction2']).toBe('/subAction2Url');
            }));
        });
    });


    describe('otherwise', function() {
        it('should delegate to $routeProvider#otherwise and return itself', inject(function() {
            spyOn($routeProvider, 'otherwise');

            var expectedParams = {};

            var result = $actionRouteProvider.otherwise(expectedParams);

            expect(result).toBe($actionRouteProvider);
            expect($routeProvider.otherwise).toHaveBeenCalledWith(expectedParams);
        }));
    });
});