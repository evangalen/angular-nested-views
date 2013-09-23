describe('$rootScope', function() {
    'use strict';

    beforeEach(module('angularNestedViews.rootScopeAdditions'));

    var $rootScope;

    beforeEach(inject(function(_$rootScope_) {
        $rootScope = _$rootScope_;
    }));

    describe('function', function() {
        var childScope1;
        var childScope2;
        var childScope3;
        var childScope4;

        beforeEach(function() {
            childScope1 = $rootScope.$new();
            childScope2 = childScope1.$new();
            childScope3 = childScope2.$new();
            childScope4 = childScope3.$new();
        });


        describe('nextSubAction', function() {
            describe('for a scope with an "own" property $$_subActionIndex', function() {
                it('should return sub action from $rootScope.$$_subActions', function() {
                    $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];
                    childScope1.$$_subActionIndex = 0;
                    childScope2.$$_subActionIndex = 1;

                    expect(childScope2.nextSubAction()).toBe('subAction2');
                });
            });

            describe('for a scope "without" an "own" property $$_subActionIndex', function() {
                it('should set $$_subActionIndex on the scope with 0 when no such value exist on a parent scope and ' +
                        'return sub action from $rootScope.$$_subActions', function() {
                    $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                    expect(childScope2.nextSubAction()).toBe('subAction1');
                    expect(childScope2.hasOwnProperty('$$_subActionIndex')).toBe(true);
                    expect(childScope2.$$_subActionIndex).toBe(0);
                });

                it('should set $$_subActionIndex on the scope with value from parent scope increased by 1 and ' +
                        'return sub action from $rootScope.$$_subActions', function() {
                    $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];
                    childScope1.$$_subActionIndex = 0;

                    expect(childScope2.nextSubAction()).toBe('subAction2');
                    expect(childScope2.hasOwnProperty('$$_subActionIndex')).toBe(true);
                    expect(childScope2.$$_subActionIndex).toBe(1);
                });
            });
        });


        describe('$_currentAction', function() {
            beforeEach(function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2'];
            });

            it('should throw exception when no $$_subActionIndex property exists', function() {
                try {
                    childScope1.$_currentAction();
                } catch (e) {
                    expect(e).toBe('No current action found');
                }
            });

            it('should return first sub action when $scope.$$_subActionIndex == 0', function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                childScope1.$$_subActionIndex = 0;

                expect(childScope1.$_currentAction()).toBe('subAction1');
            });

            it('should return second sub action when $scope.$$_subActionIndex == 1', function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                childScope1.$$_subActionIndex = 0;
                childScope2.$$_subActionIndex = 1;

                expect(childScope2.$_currentAction()).toBe('subAction1.subAction2');
            });

            it('should return second sub action when $scope.$$_subActionIndex == 1 and is inherited', function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                childScope1.$$_subActionIndex = 0;
                childScope2.$$_subActionIndex = 1;

                expect(childScope3.$_currentAction()).toBe('subAction1.subAction2');
            });

            it('should return third sub action when $scope.$$_subActionIndex == 2', function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                childScope1.$$_subActionIndex = 0;
                childScope2.$$_subActionIndex = 1;
                childScope3.$$_subActionIndex = 2;

                expect(childScope3.$_currentAction()).toBe('subAction1.subAction2.subAction3');
            });

            it('should return third sub action when $scope.$$_subActionIndex == 2 and is inherited', function() {
                $rootScope.$$_subActions = ['subAction1', 'subAction2', 'subAction3'];

                childScope1.$$_subActionIndex = 0;
                childScope2.$$_subActionIndex = 1;
                childScope3.$$_subActionIndex = 2;

                expect(childScope4.$_currentAction()).toBe('subAction1.subAction2.subAction3');
            });
        });
    });

    describe('$on', function() {
        describe('"$routeChangeSuccess"', function() {
            var $route = {};
            beforeEach(inject(function(_$route_) {
                $route = _$route_;
            }));

            describe('should do nothing', function() {
                beforeEach(function() {
                    expect($rootScope.$$_subActions).toEqual([]);
                });

                it('when $route.current is falsy', function() {
                    $rootScope.$broadcast('$routeChangeSuccess');
                });

                it('when $route.current.action is falsy', function() {
                    $route.current = {};

                    $rootScope.$broadcast('$routeChangeSuccess');
                });

                afterEach(function() {
                    expect($rootScope.$$_subActions).toEqual([]);
                });
            });

            it('should set $$_subActions with ["subAction1"] when action = "subAction1"', function() {
                $route.current = {action: 'subAction1'};

                $rootScope.$broadcast('$routeChangeSuccess');

                expect($rootScope.$$_subActions).toEqual(['subAction1']);
            });

            it('should set $$_subActions with ["subAction1", "subAction2"] when action = "subAction1.subAction2"',
                    function() {
                $route.current = {action: 'subAction1.subAction2'};

                $rootScope.$broadcast('$routeChangeSuccess');

                expect($rootScope.$$_subActions).toEqual(['subAction1', 'subAction2']);
            });
        });
    });
});