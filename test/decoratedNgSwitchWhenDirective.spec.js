describe('decoratedNgSwitchWhenDirective', function() {
    'use strict';

    beforeEach(module('angularNestedViews.decoratedNgSwitchWhenDirective'));

    var $scope;

    it('ngSwitch still works as it should be', inject(function($rootScope, $compile) {
        $scope = $rootScope.$new();

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
        var $rootScope;
        var scope;
        var $route;

        beforeEach(inject(function(_$rootScope_, _$route_) {
            $rootScope = _$rootScope_;
            $rootScope.$_currentAction = angular.noop;

            scope = $rootScope.$new();

            $route = _$route_;
        }));

        describe('$on', function() {

            describe('"$routeChangeSuccess"', function() {

                var $element;

                beforeEach(inject(function($compile) {
                    spyOn($rootScope, '$_currentAction').andReturn('currentAction');

                    $route.current = {paramsPerAction: {}};

                    scope.model = true;

                    $element = $compile('' +
                        '<div ng-switch="model">' +
                        '    <div ng-switch-when="true">true</div>' +
                        '</div>')(scope);
                    scope.$digest();
                }));

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
                    var selectedElement = $element.find('span').eq(0);
                    var selectedElementScope = selectedElement.scope();
                    var selectedElementContext = selectedElement.context;

                    scope.$broadcast('$routeChangeSuccess', $route.current, $route.previous);

                    //TODO: add expectations
                };


                it('should delete the intermediate element and its scope when the route param was changed', function() {
                    $route.current.params = {aRouteParam: '1'};
                    $route.current.paramsPerAction = {currentAction: ['aRouteParam']};

                    $route.previous = {params: {aRouteParam: '2'}};

                    var selectedElement = $element.find('span').eq(0);
                    var selectedElementScope = selectedElement.scope();
                    var selectedElementContext = selectedElement.context;

                    scope.$broadcast('$routeChangeSuccess', $route.current, $route.previous);

                    //TODO: add expectations
                });
            });
        });
    });
});