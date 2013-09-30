describe('decoratedNgSwitchWhenDirective', function() {
    'use strict';

    beforeEach(module('angularNestedViews.decoratedNgSwitchWhenDirective'));

    var $log;

    var $rootScope;
    var $scope;

    beforeEach(inject(function(_$log_, _$rootScope_) {
        $log = _$log_;

        $rootScope = _$rootScope_;
        $log.log('root scope: {$id: ' + $rootScope.$id + '}');

        $scope = $rootScope.$new();
        $log.log('created scope for testing: ' + scopeInfo($scope));

        var $newOriginal = $rootScope.$new;
        $rootScope.$new = function(isolate) {
            var result = $newOriginal.call(this, isolate);

            $log.log('scope created using $new: ' + scopeInfo(result));
            return result;
        };

        var $onOriginal = $rootScope.$on;
        $rootScope.$on = function() {
            var result = $onOriginal.apply(this, arguments);

            if (arguments[0] === '$routeChangeSuccess') {
                $log.log('Registered $on("$routeChangeSuccess") of scope with $id = ' + this.$id);
            }

            return result;
        };
    }));

    var scopeInfo = function(scope) {
        var result = '$id = ' + scope.$id + ", parentScopes = ";

        result += scope.$parent ? '[' : 'null';

        var currentScope = scope.$parent;
        while (currentScope) {
            if (currentScope !== scope.$parent) {
                result += ', ';
            }

            result += "{$id: '" + currentScope.$id + "'}";

            currentScope = currentScope.$parent;
        }

        if ($scope.$parent) {
            result += ']';
        }

        return result;
    };

    afterEach(function() {
        $scope.$destroy();

        delete $rootScope.$new;
        delete $rootScope.$on;

        expect($rootScope.$$childHead).toBeNull();
    });

    it('ngSwitch still works as it should be', inject(function($compile) {
        $scope.model = true;

        var $element = $compile('' +
            '<div ng-switch="model">' +
            '    <div ng-switch-when="true">true</div>' +
            '    <div ng-switch-when="false">false</div>' +
            '    <div ng-switch-default>default</div>' +
            '</div>')($scope);
        $scope.$digest();

        assertNgSwitchWhen($element, 'true');

        $scope.model = false;
        $scope.$digest();

        assertNgSwitchWhen($element, 'false');

        $scope.model = null;
        $scope.$digest();

        //TODO: determine if we and how to support "ngSwitchDefault";
        //  for now we will assume that it's not being decorated as works as in standard AngularJS
        expect($element.children().length).toBe(1);
        expect($element.children().eq(0).length).toBe(1);
        expect($element.find('span').length).toBe(0);
    }));

    var assertNgSwitchWhen = function($element, expectedText) {
        expect($element.children().length).toBe(1);
        expect($element.children().eq(0).length).toBe(1);
        expect($element.find('span').length).toBe(1);
        expect($element.find('span').text()).toBe(expectedText);
        expect($element.find('span').parent().context).toBe($element.children().eq(0).context);
    };


    describe('scope', function() {
        var $route;

        beforeEach(inject(function(_$route_) {
            $rootScope.$_currentAction = angular.noop;

            $route = _$route_;
        }));

        describe('$on', function() {

            describe('"$routeChangeSuccess"', function() {

                var $element;

                beforeEach(inject(function($compile) {
                    spyOn($rootScope, '$_currentAction').andReturn('currentAction');

                    $route.current = {paramsPerAction: {}};

                    $scope.model = true;

                    $element = $compile('' +
                        '<div ng-switch="model">' +
                        '    <div ng-switch-when="true">true</div>' +
                        '</div>')($scope);
                    $scope.$digest();
                }));

                it('should do nothing when current route has no paramsPerAction property', function() {
                    delete $route.current.paramsPerAction;

                    broadcastRouteChangeSuccessAndAssertNothingChanged();
                });

                it('should do nothing when current route has no route params', function() {
                    broadcastRouteChangeSuccessAndAssertNothingChanged();
                });

                it('should do nothing when route param is not changed', function() {
                    $route.current.params = {aRouteParam: '42'};
                    $route.current.paramsPerAction = {currentAction: 'aRouteParam'};

                    $route.previous = {params: {aRouteParam: '42'}};

                    broadcastRouteChangeSuccessAndAssertNothingChanged();
                });

                var broadcastRouteChangeSuccessAndAssertNothingChanged = function() {
                    var intermediateElement = $element.find('span').eq(0);

                    expect(intermediateElement.children().length).toBe(1);
                    var previousIntermediateChildContext = intermediateElement.children()[0];
                    var previousIntermediateChildScope = intermediateElement.children().eq(0).scope();

                    $scope.$broadcast('$routeChangeSuccess', $route.current, $route.previous);

                    expect(previousIntermediateChildScope.$$destroyed).toBe(false);

                    expect(intermediateElement.children().length).toBe(1);
                    var intermediateChildContext = intermediateElement.children()[0];
                    var intermediateChildScope = intermediateElement.children().eq(0).scope();

                    expect(intermediateChildContext).toBe(previousIntermediateChildContext);
                    expect(intermediateChildScope).toBe(previousIntermediateChildScope);
                };


                it('should delete the intermediate element and its scope when the route param was changed', function() {
                    $route.current.params = {aRouteParam: '1'};
                    $route.current.paramsPerAction = {currentAction: ['aRouteParam']};

                    $route.previous = {params: {aRouteParam: '2'}};

                    var intermediateElement = $element.find('span').eq(0);

                    expect(intermediateElement.children().length).toBe(1);
                    var previousIntermediateChildContext = intermediateElement.children()[0];
                    var previousIntermediateChildScope = intermediateElement.children().eq(0).scope();

                    $scope.$broadcast('$routeChangeSuccess', $route.current, $route.previous);

                    expect(previousIntermediateChildScope.$$destroyed).toBe(true);

                    expect(intermediateElement.children().length).toBe(1);
                    var intermediateChildContext = intermediateElement.children()[0];
                    var intermediateChildScope = intermediateElement.children().eq(0).scope();

                    expect(intermediateChildContext).toBeTruthy();
                    expect(intermediateChildContext).not.toBe(previousIntermediateChildContext);

                    expect(intermediateChildScope).toBeTruthy();
                    expect(intermediateChildScope).not.toBe(previousIntermediateChildScope);
                });
            });
        });
    });
});