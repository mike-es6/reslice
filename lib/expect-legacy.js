'use strict';

var _expect = require('expect');

var _expect2 = _interopRequireDefault(_expect);

var _tests = require('./tests');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_expect2.default.extend({
    /**
     * Check a value against an expected object, where the value is recursively
     * stripped of all non-own-properties (ie., the prototype is removed).
    **/
    toEqualObject: function toEqualObject(expected) {
        var actual = (0, _tests.ownPropertiesOnly)(this.actual);
        (0, _expect2.default)(actual).toEqual(expected);
        return this;
    },

    /**
     * Check actions. Default the $$tag to zero in both the actual and expected
     * values.
    **/
    toEqualAction: function toEqualAction(_expected) {
        var actual = Object.assign({}, this.actual, { $$tag: this.actual.$$tag || 0 });
        var expected = Object.assign({}, _expected, { $$tag: _expected.$$tag || 0 });
        (0, _expect2.default)(actual).toEqual(expected);
        return this;
    }
});