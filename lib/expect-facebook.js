'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _lodash = require('lodash');

var _tests = require('./tests');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend({
    /**
     * Check a value against an expected object, where the value is recursively
     * stripped of all non-own-properties (ie., the prototype is removed).
    **/
    toEqualObject: function toEqualObject(received, argument) {
        var actual = (0, _tests.ownPropertiesOnly)(received);
        if ((0, _lodash.isEqual)(actual, argument)) return {
            pass: true,
            message: function message() {
                return 'expected ' + JSON.stringify(actual) + ' to not equal ' + JSON.stringify(argument);
            }
        };
        return {
            pass: false,
            message: function message() {
                return 'expected ' + JSON.stringify(actual) + ' to equal ' + JSON.stringify(argument);
            }
        };
    },

    /**
     * Check actions. Default the $$tag to zero in both the actual and expected
     * values.
    **/
    toEqualAction: function toEqualAction(received, argument) {
        var actual = Object.assign({}, received, { $$tag: received.$$tag || 0 });
        var expected = Object.assign({}, argument, { $$tag: argument.$$tag || 0 });
        if ((0, _lodash.isEqual)(actual, expected)) return {
            pass: true,
            message: function message() {
                return 'expected ' + JSON.stringify(actual) + ' to not equal ' + JSON.stringify(argument);
            }
        };
        return {
            pass: false,
            message: function message() {
                return 'expected ' + JSON.stringify(actual) + ' to equal ' + JSON.stringify(argument);
            }
        };
    }
});