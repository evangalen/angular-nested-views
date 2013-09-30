describe('decoratedNgSwitchWhenDirective', function() {
    'use strict';

    var $delegateOfDecoratedNgSwitchWhenDirective;

    beforeEach(module(function($provide) {
        $provide.decorator('ngSwitchWhenDirective', function($delegate) {
            $delegateOfDecoratedNgSwitchWhenDirective = $delegate;
        });
    }));

    // trigger the execution of "function($delegate) { ... }" by injecting the "ngSwitchWhen" directive
    beforeEach(inject(function(ngSwitchWhenDirective) {
        // Do nothing
    }));

    describe('when decorating the ngSwitchWhenDirective', function() {

        describe('the $delegate', function() {

            it('should be an array with length === 1', function() {
                expect(angular.isArray($delegateOfDecoratedNgSwitchWhenDirective)).toBe(true);
                expect($delegateOfDecoratedNgSwitchWhenDirective.length).toBe(1);
            });
        });
    });
});
