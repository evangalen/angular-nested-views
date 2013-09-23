describe('$actionRouteProvider', function() {
    'use strict';

    var $routeProvider;
    var $actionRouteProvider;

    beforeEach(module('angularNestedViews.actionRoute', function(_$routeProvider_, _$actionRouteProvider_) {
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

                spyOn($routeProvider, 'when');

                $actionRouteProvider.abstractAction(action, relativeUrl);

                expect($routeProvider.when).not.toHaveBeenCalled();
                expect($actionRouteProvider.pathPerAction[action]).toBe(relativeUrl);
            });

            it('for a sub action with an existing parent action', inject(function() {
                $actionRouteProvider.pathPerAction.subAction1 = '/subAction1Url';

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


    describe('whenAction', function() {
        describe('for a action', function() {
            beforeEach(function() {
                spyOn($routeProvider, 'when');
            });

            describe('and a relative url', function() {
                describe('should register a route and add entry to this.pathPerAction with complete url', function() {

                    it('when no parent action exists (complete url will be the same a the relative url)', function() {
                        $actionRouteProvider.whenAction('nonExistingParentAction.subAction', '/subActionUrl');

                        assertTestWithNonExistingParent('nonExistingParentAction', 'subAction');
                    });

                    it('when parent action is abstract', function() {
                        $actionRouteProvider.abstractAction('abstractParentAction', '/abstractParentActionUrl');

                        $actionRouteProvider.whenAction('abstractParentAction.subAction', '/subActionUrl');

                        assertTestWithExistingParent('abstractParentAction', 'subAction');
                    });

                    it('when parent action is abstract and has params', function() {
                        $actionRouteProvider.abstractAction(
                                'abstractParentAction', '/abstractParentActionUrl/:parentRouteParam');

                        $actionRouteProvider.whenAction('abstractParentAction.subAction', '/subActionUrl');

                        assertTestWithExistingParentWithParam('abstractParentAction', 'subAction');
                    });

                    it('when parent action is abstract and both sub action and parent have params', function() {
                        $actionRouteProvider.abstractAction(
                                'abstractParentAction', '/abstractParentActionUrl/:parentRouteParam');

                        $actionRouteProvider
                            .whenAction('abstractParentAction.subAction', '/subActionUrl/:subActionRouteParam');

                        assertTestWithExistingParentAndDifferentParamsOnParentAndSubAction(
                                'abstractParentAction', 'subAction');
                    });
                });
            });

            describe('and a route', function() {
                describe('should register a route and add entry to this.pathPerAction with complete url', function() {

                    it('when no parent action exists (complete url will be the same a the relative url)', function() {
                        $actionRouteProvider.whenAction('nonExistingParentAction.subAction', {url: '/subActionUrl'});

                        assertTestWithNonExistingParent('nonExistingParentAction', 'subAction');
                    });

                    it('when parent action is abstract', function() {
                        $actionRouteProvider.abstractAction('abstractParentAction', '/abstractParentActionUrl');

                        $actionRouteProvider.whenAction('abstractParentAction.subAction', {url: '/subActionUrl'});

                        assertTestWithExistingParent('abstractParentAction', 'subAction');
                    });

                    it('when parent action is abstract and has params', function() {
                        $actionRouteProvider.abstractAction(
                                'abstractParentAction', '/abstractParentActionUrl/:parentRouteParam');

                        $actionRouteProvider.whenAction('abstractParentAction.subAction', {url: '/subActionUrl'});

                        assertTestWithExistingParentWithParam('abstractParentAction', 'subAction');
                    });

                    it('when parent action is abstract and both sub action and parent have params', function() {
                        $actionRouteProvider.abstractAction(
                            'abstractParentAction', '/abstractParentActionUrl/:parentRouteParam');

                        $actionRouteProvider
                            .whenAction('abstractParentAction.subAction', {url: '/subActionUrl/:subActionRouteParam'});

                        assertTestWithExistingParentAndDifferentParamsOnParentAndSubAction(
                            'abstractParentAction', 'subAction');
                    });
                });

                it('should not include the url property in the route', function() {
                    $actionRouteProvider.whenAction('subAction', {url: '/subActionUrl'});

                    expect($routeProvider.when)
                        .toHaveBeenCalledWith('/subActionUrl', {action: 'subAction', paramsPerAction: {subAction: []}});
                });
            });


            var assertTestWithNonExistingParent = function(parentAction, subAction) {
                var action = parentAction + '.' + subAction;

                var expectedRoute = {action: action, paramsPerAction: {}};
                expectedRoute.paramsPerAction[action] = [];

                expect($routeProvider.when).toHaveBeenCalledWith('/subActionUrl', expectedRoute);
                expect($actionRouteProvider.pathPerAction[parentAction]).toBeUndefined();
                expect($actionRouteProvider.pathPerAction[action]).toBe('/subActionUrl');
            };

            var assertTestWithExistingParent = function(parentAction, subAction) {
                var action = parentAction + '.' + subAction;

                var expectedRoute = {action: action, paramsPerAction: {}};
                expectedRoute.paramsPerAction[parentAction] = [];
                expectedRoute.paramsPerAction[action] = [];

                expect($routeProvider.when)
                    .toHaveBeenCalledWith('/abstractParentActionUrl/subActionUrl', expectedRoute);
                expect($actionRouteProvider.pathPerAction[parentAction]).toBe('/abstractParentActionUrl');
                expect($actionRouteProvider.pathPerAction[action]).toBe('/abstractParentActionUrl/subActionUrl');
            };

            var assertTestWithExistingParentWithParam = function(parentAction, subAction) {
                var action = parentAction + '.' + subAction;

                var expectedRoute = {action: action, paramsPerAction: {}};
                expectedRoute.paramsPerAction[parentAction] = ['parentRouteParam'];
                expectedRoute.paramsPerAction[action] = ['parentRouteParam'];

                expect($routeProvider.when)
                    .toHaveBeenCalledWith('/abstractParentActionUrl/:parentRouteParam/subActionUrl', expectedRoute);
                expect($actionRouteProvider.pathPerAction[parentAction])
                    .toBe('/abstractParentActionUrl/:parentRouteParam');
                expect($actionRouteProvider.pathPerAction[action])
                    .toBe('/abstractParentActionUrl/:parentRouteParam/subActionUrl');
            };

            var assertTestWithExistingParentAndDifferentParamsOnParentAndSubAction = function(parentAction, subAction) {
                var action = parentAction + '.' + subAction;

                var expectedRoute = {action: action, paramsPerAction: {}};
                expectedRoute.paramsPerAction[parentAction] = ['parentRouteParam'];
                expectedRoute.paramsPerAction[action] = ['parentRouteParam', 'subActionRouteParam'];

                expect($routeProvider.when)
                    .toHaveBeenCalledWith(
                            '/abstractParentActionUrl/:parentRouteParam/subActionUrl/:subActionRouteParam',
                            expectedRoute);
                expect($actionRouteProvider.pathPerAction[parentAction])
                    .toBe('/abstractParentActionUrl/:parentRouteParam');
                expect($actionRouteProvider.pathPerAction[action])
                    .toBe('/abstractParentActionUrl/:parentRouteParam/subActionUrl/:subActionRouteParam');
            };
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