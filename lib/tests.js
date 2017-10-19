'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.bindTestSlice = bindTestSlice;
exports.ownPropertiesOnly = ownPropertiesOnly;

var _lodash = require('lodash');

var _reslice = require('./reslice');

/**
 * Function used to bind a slice structure to a set of selectors and actions. Used
 * in unit test code to convert a predefined slice to a slice with the accessor
 * functions.
**/
function bindTestSlice(slice) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$selectors = _ref.selectors,
        selectors = _ref$selectors === undefined ? {} : _ref$selectors,
        _ref$actions = _ref.actions,
        actions = _ref$actions === undefined ? {} : _ref$actions;

    var getSlice = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var prototype = {
        $$tag: 0,
        getRoot: function getRoot() {
            return this;
        },
        action: function action(a) {
            return _extends({}, a, { $$tag: 0 });
        },
        globalAction: _reslice.globalAction
    };
    (0, _lodash.each)(selectors, function (selector, name) {
        if ((0, _lodash.isFunction)(selector)) prototype[name] = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return selector.apply(undefined, [Object.assign({}, this, {})].concat(args));
        };
    });
    (0, _lodash.each)(actions, function (creator, name) {
        if ((0, _lodash.isFunction)(creator)) prototype[name] = function () {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            var action = creator.apply(this, args);
            if ((0, _lodash.isFunction)(action)) return function (dispatch, _) {
                for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                    args[_key3 - 2] = arguments[_key3];
                }

                return action.call.apply(action, [null, dispatch, function () {
                    return getSlice ? getSlice() : slice;
                }].concat(args));
            };
            return action;
        };
    });
    Object.setPrototypeOf(slice, prototype);
    return slice;
}

/**
 * Recursively process an object to that non-own-properties (ie., prototypes)
 * are removed.
**/
function ownPropertiesOnly(thing) {
    if ((0, _lodash.isObject)(thing)) {
        var result = {};
        (0, _lodash.each)((0, _lodash.keys)(thing), function (key) {
            result[key] = ownPropertiesOnly(thing[key]);
        });
        return result;
    }
    if ((0, _lodash.isArray)(thing)) return (0, _lodash.map)(thing, function (item) {
        return ownPropertiesOnly(item);
    });
    return thing;
}