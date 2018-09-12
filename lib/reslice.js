'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.shallowEqual = shallowEqual;
exports.checkDistinctNames = checkDistinctNames;
exports.connect = connect;
exports.globalAction = globalAction;
exports.buildReducer = buildReducer;
exports.bindReducer = bindReducer;
exports.combineReducers = combineReducers;
exports.extendReducer = extendReducer;
exports.mappedReducer = mappedReducer;
exports.createStore = createStore;
exports.createInjector = createInjector;
exports.createSelector = createSelector;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

var _redux = require('redux');

var _reactRedux = require('react-redux');

var _reselect = require('reselect');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var $$tag = 1;
var seseq = 1;

/**
 * Custom shallow equal, distinguishes between Array and Object.
**/
function shallowEqual(thing, other) {
    if (thing === other) return true;
    if (thing === null || thing === undefined) return false;
    if (other === null || other === undefined) return false;
    if (thing.constructor === Object && other.constructor === Object) {
        var tkeys = Object.keys(thing);
        var okeys = Object.keys(other);
        if (tkeys.length !== okeys.length) return false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = tkeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var key = _step.value;

                if (thing[key] !== other[key]) return false;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return true;
    }
    if (thing.constructor === Array && other.constructor === Array) {
        if (thing.length != other.length) return false;
        for (var idx in thing) {
            if (thing[idx] !== other[idx]) return false;
        }return true;
    }
    return false;
}

/**
 * Conditionally set prototype. Needed to allow reducers that return state
 * that is not object-like, whence Object.setPrototypeOf borks on IE11/Edge.
**/
function setPrototypeOf(state, prototype) {
    if ((0, _lodash.isArray)(state) || (0, _lodash.isObject)(state)) Object.setPrototypeOf(state, prototype);
}

/**
 * Check that the selectors and actions have distinct names, and that
 * none of the predefined names are used,
**/
function checkDistinctNames(selectors, actions) {
    var skeys = (0, _lodash.keys)(selectors);
    var akeys = (0, _lodash.keys)(actions);
    var allkeys = (0, _lodash.union)(skeys, akeys);
    if (allkeys.length != skeys.length + akeys.length) throw new Error("reslice.checkDistinctNames: one or more names are repeated: " + (0, _lodash.keys)((0, _lodash.pickBy)((0, _lodash.groupBy)(skeys.concat(akeys)), function (x) {
        return x.length > 1;
    })));
    (0, _lodash.each)(['action', 'globalAction', 'getRoot', 'reducer'], function (name) {
        if ((0, _lodash.includes)(allkeys, name)) throw new Error('reslice.checkDistinctNames: cannot use ' + name + ' as a selector or action name');
    });
}

/**
 * Custom connect function. Invokes the react-redux connect function,
 * but extends mapStateToProps and mapDispatchToProps.
**/
function connect(mapStateToProps, mapDispatchToProps) {
    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
    }

    return _reactRedux.connect.apply(undefined, [mapStateToProps ? function (state, props) {
        /**
         * If props.slice is set then call the underlying
         * mapStateToProps with the slice as the state argument,
         * extended with the current state as the root. If
         * there is no props.slice (typically the top level)
         * then use state directly.
        **/
        if (props.slice) return mapStateToProps(props.slice, props);
        return mapStateToProps(state, props);
    } : null, mapDispatchToProps ? function (dispatch, props) {
        /**
         * Call the underlying mapDispatchToProps passing the
         * slice as the second argument (with the same check
         * as above).
        **/
        if (props.slice) return mapDispatchToProps(dispatch, props.slice, props);
        return mapDispatchToProps(dispatch, props, props);
    } : null].concat(args));
}

/**
 * Tag an action as global. Checks the the action does not already have
 * a tag.
**/
function globalAction(action) {
    if (action.$$tag !== undefined) throw new Error("reslice.globalAction: action already has a tag: " + action.$$tag);
    return Object.assign({}, action, { $$tag: null });
};

/**
 * The extendReducer/bindReducer/combineReducers/mappedReducer functions below
 * return a tree of objects which describe the reducer structure rather than
 * implement it. The buildReducer function is called on this tree to
 * instantiate the reducers. This is needed since, if the same reducer is
 * used at multiple places in the tree, we need to create a separate function
 * for each place, so that that last state returned from the reducer can be
 * saved, to be accessed from any selectors or action creators that are bound
 * to the reducer.
 *
 * Also, we need to access the store itself, so this is passed in as
 * the second argument. See the createStore function below, which should
 * normally be used.
 *
 * The third argument propogates slice tags down the slice tree, to be used
 * when binding to a simple reducer function, typically resulting from the
 * use of using simple reducer functions in a call to combineReducers.
**/
function buildReducer(reducer, store, useTag) {
    /**
     * Expects an object or a function as the reducer argument. If an
     * object then it should be tagged as $$combine, $$extend, etc. This
     * is checked below.
    **/
    if (!(0, _lodash.isPlainObject)(reducer) && !(0, _lodash.isFunction)(reducer)) throw new Error('reslice.buildReducer: expected object or function, got: ' + (typeof reducer === 'undefined' ? 'undefined' : _typeof(reducer)));
    /**
     * Combining reducers. Recursively build nested reducers and use the
     * redux combineReducers fuction to combine them in the normal way.
     * The result is used to create a new tree object for the combined
     * function. This is then processed below.
    **/
    if (reducer.$$combine) {
        /**
         * If a combined reducer is a simple function then wrap the reducer
         * with a filter function that checks on the action tag. If it
         * is not, then it is not wrapped, so that actions continue to
         * propogate down the state tree.
        **/
        var filterReducer = function filterReducer(reducer) {
            var _reducer = buildReducer(reducer, store, myTag);
            if ((0, _lodash.isFunction)(reducer)) return function (state, action) {
                for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                    args[_key2 - 2] = arguments[_key2];
                }

                if (!action.$$tag || action.$$tag === state.$$tag) return _reducer.apply(undefined, [state, action].concat(args));
                return state;
            };
            return _reducer;
        };

        var myTag = $$tag++;
        reducer = {
            $$reducer: (0, _redux.combineReducers)((0, _lodash.mapValues)(reducer.$$reducers, function (r) {
                return filterReducer(r);
            })),
            $$selectors: reducer.$$selectors,
            $$actions: reducer.$$actions,
            $$tag: myTag
        };
    }
    /**
     * Extending a reducer. Recursively build the reducer that is being
     * extended, then generate a new tree object where the reducer function
     * invokes the extension or the underlying reducer. This is then processed
     * below.
    **/
    else if (reducer.$$extend) {
            var _reducer = buildReducer(reducer.$$reducer, store);
            var _extension = reducer.$$extension;
            reducer = {
                $$reducer: function $$reducer(state, action) {
                    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
                        args[_key3 - 2] = arguments[_key3];
                    }

                    /**
                     * Redux initialise actions do not go through the
                     * extending function.
                    **/
                    if (action.type.startsWith('@@')) return _reducer.apply(undefined, [state, action].concat(args));
                    /**
                     * If the action has the global tag or the matching
                     * tag, then run the action through the extending
                     * function. If this yields a result then make sure
                     * the prototype is set and return that result; also
                     * propogate the new state into the reducer so that
                     * getSlice() behaves correctly.
                    **/
                    if (!action.$$tag || action.$$tag === state.$$tag) {
                        var newState = _extension.apply(undefined, [state, action].concat(args));
                        if (newState) {
                            setPrototypeOf(newState, Object.getPrototypeOf(state));
                            _reducer.setLastState(newState);
                            return newState;
                        }
                    }
                    /**
                     * Otherwise, process through the underlying reducer.
                    **/
                    return _reducer.apply(undefined, [state, action].concat(args));
                },
                $$selectors: reducer.$$reducer.$$selectors,
                $$actions: reducer.$$reducer.$$actions,
                $$tag: _reducer.$$tag
            };
        }
        /**
         * Binding to a reducer function. This is left as-is to be processed
         * below.
        **/
        else if (reducer.$$bind) {
                var _reducer2 = reducer.$$reducer;
                reducer = {
                    $$reducer: function $$reducer(state, action) {
                        for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
                            args[_key4 - 2] = arguments[_key4];
                        }

                        if (!action.$$tag || action.$$tag === state.$$tag) return _reducer2.apply(undefined, [state, action].concat(args));
                        return state;
                    },
                    $$selectors: reducer.$$selectors,
                    $$actions: reducer.$$actions,
                    $$tag: $$tag++
                };
            }
            /**
             * Binding to a mapped reducer. The trick here is to create a factory
             * that creates per-key instances of the underlying reducer, and then
             * wrap that reducer with a function that invokes said reducer with
             * the factory as the third argument.
            **/
            else if (reducer.$$mapped) {
                    var reducerForKey = function reducerForKey(key, initialiser) {
                        var keyReducer = mapped[key];
                        if (!keyReducer) mapped[key] = keyReducer = buildReducer(child, store);
                        if (initialiser) {
                            /**
                             * Check for initialiser case in which case create a
                             * new slice and optionally initialise it.
                            **/
                            var slice = keyReducer(undefined, { type: '@@redux/INIT' });
                            var init = initialiser(slice);
                            return init ? keyReducer(slice, init) : slice;
                        }
                        return keyReducer;
                    };

                    var wrapper = function wrapper(state, action) {
                        var res = inner(state, action, reducerForKey);
                        return shallowEqual(res, state) ? state : res;
                    };

                    var mapped = {};
                    var inner = reducer.$$reducer;
                    var child = reducer.$$child;

                    reducer = {
                        $$reducer: wrapper,
                        $$selectors: reducer.$$selectors,
                        $$actions: reducer.$$actions,
                        $$tag: $$tag++
                    };
                }
                /**
                 * If the reducer is simply a function then treat it as bound to empty
                 * collections of selectors and reducers.
                **/
                else if ((0, _lodash.isFunction)(reducer)) {
                        reducer = {
                            $$reducer: reducer,
                            $$selectors: {},
                            $$actions: {},
                            $$tag: useTag || $$tag++
                        };
                    } else
                        /**
                         * Any other case is an error.
                        **/
                        throw new Error("reslice.buildReducer: unexpected tree object");

    /**
     * Here lies the point whence ReSlice has to have a logically
     * distinct copy of a reducer function for each position in the
     * state tree at which the reducer is used (which may be more
     * than once).
     *
     * We need to be able to keep track of the last state returned
     * by this instance of a reducer in the tree. To this end, use
     * a generator function that returns a closure on a variable
     * used to save this state.
    **/
    function wrapReducer() {
        var lastState = null;
        var prototype = {
            getRoot: function getRoot() {
                return store.getState();
            },
            globalAction: globalAction,
            $$tag: reducer.$$tag
        };
        /**
         * Generate a prototype that contains the selectors and
         * actions (assumes distinct names). Selector functions are
         * wrapped so the slice becomes the first argument to the
         * selector. Action creators are wrapped so that "this" is
         * the slice, and if the action returns a thunk, then the
         * thunk is wrapped so that it will be called with a
         * "getSlice" function that returns the last state (and
         * such that "this" is explicitely null).
        **/
        (0, _lodash.each)(reducer.$$selectors, function (selector, name) {
            if ((0, _lodash.isFunction)(selector)) {
                /**
                 * If the selector has a $$factory property then call
                 * that to create the selector. This allows selector
                 * memoization on a per-slice basis, rather than
                 * globally. Also, since we have a .getRoot() 
                 * methods on slices, which may return different results
                 * even if the particular slice changes, we need to
                 * default the outer level of memoization in reslice.
                **/
                if (selector.$$factory) selector = selector.$$factory();
                prototype[name] = function () {
                    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                        args[_key5] = arguments[_key5];
                    }

                    args.push(seseq++);
                    return selector.apply(undefined, [this].concat(args));
                };
            }
        });
        (0, _lodash.each)(reducer.$$actions, function (creator, name) {
            if ((0, _lodash.isFunction)(creator)) prototype[name] = function () {
                for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                    args[_key6] = arguments[_key6];
                }

                var action = creator.apply(this, args);
                if ((0, _lodash.isFunction)(action)) return function (dispatch, getState) {
                    return action.call(null, dispatch, function () {
                        return lastState;
                    });
                };
                if (action.$$tag === undefined) return Object.assign({}, action, { $$tag: prototype.$$tag });
                return action;
            };
        });
        prototype.action = function (action) {
            if (action.$$tag !== undefined) throw new Error("reslice.action: action already has a tag: " + action.$$tag);
            return Object.assign({}, action, { $$tag: prototype.$$tag });
        };
        /**
         * This is the actual reducer function that will be returned. Before
         * doing so, add a property which is a function that can be called
         * from outside to change the lastState; this is needed by the code
         * in extendReducer.
        **/
        var $$reducer = function $$reducer(state, action) {
            if (action.$$tag === undefined) if (!action.type.startsWith('@@')) throw new Error("reslice.reduce: $$tag is undefined: " + JSON.stringify(action));
            var newState = reducer.$$reducer(state, action);
            /**
             * If the new state does not have a tag then it lacks the prototype,
             * so extend the prototype chain of the new object with the prototypes
             * derived above from the actions and selectors.
            **/
            if (newState.$$tag === undefined) {
                var newproto = Object.assign(Object.create(Object.getPrototypeOf(newState)), prototype);
                setPrototypeOf(newState, newproto);
                lastState = newState;
            }
            return newState;
        };
        prototype.reducer = function (action) {
            return $$reducer(this, action);
        };
        $$reducer.setLastState = function (state) {
            lastState = state;
        };
        return $$reducer;
    }
    wrapReducer.$$tag = reducer.$$tag;
    return wrapReducer();
}

/**
 * Bind a reducer function to a set of selectors and a set of action
 * creators. Usually this is not neccessary, but it parallels the
 * combineReducers function below.
**/
function bindReducer(reducer) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$selectors = _ref.selectors,
        selectors = _ref$selectors === undefined ? {} : _ref$selectors,
        _ref$actions = _ref.actions,
        actions = _ref$actions === undefined ? {} : _ref$actions;

    if (!(0, _lodash.isFunction)(reducer)) throw new Error('reslice.bindReducer: expected reducer function, got: ' + (typeof reducer === 'undefined' ? 'undefined' : _typeof(reducer)));
    checkDistinctNames(selectors, actions);
    return { $$bind: true, $$reducer: reducer, $$selectors: selectors, $$actions: actions };
}

/**
 * Bind a set of reducers to set of selectors and a set of action
 * creators. There is a sanity check that the reducers are defined.
**/
function combineReducers(reducers) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$selectors = _ref2.selectors,
        selectors = _ref2$selectors === undefined ? {} : _ref2$selectors,
        _ref2$actions = _ref2.actions,
        actions = _ref2$actions === undefined ? {} : _ref2$actions;

    if (!(0, _lodash.isPlainObject)(reducers)) throw new Error('reslice.combineReducers: expected reducer object, got: ' + (typeof reducers === 'undefined' ? 'undefined' : _typeof(reducers)));
    checkDistinctNames(selectors, actions);
    (0, _lodash.each)(reducers, function (reducer, name) {
        if (reducer === null || reducer === undefined) throw new Error('reslice.combineReducers: reducer not set, name: ' + name);
    });
    return { $$combine: true, $$reducers: reducers, $$selectors: selectors, $$actions: actions };
}

/**
 * Extend a reducer with an extension function. This will result in a
 * reducer that calls the extension function; if the latter returns
 * null then the original reducer will be called. Any selectors and
 * actions bound to the original reducer will be copied to the
 * new reducer.
**/
function extendReducer(reducer, extension) {
    return { $$extend: true, $$reducer: reducer, $$extension: extension };
}

/**
 * Create a mapped reducer. This allows something rather like combineReducers,
 * except that the combined data could be something like an array, where the
 * same underlying reducer is used for each value in the array. More
 * details needed!!
**/
function mappedReducer(reducer, child) {
    var _ref3 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
        _ref3$selectors = _ref3.selectors,
        selectors = _ref3$selectors === undefined ? {} : _ref3$selectors,
        _ref3$actions = _ref3.actions,
        actions = _ref3$actions === undefined ? {} : _ref3$actions;

    if (!(0, _lodash.isFunction)(reducer)) throw new Error('reslice.mappedReducer: expected reducer function, got: ' + (typeof reducer === 'undefined' ? 'undefined' : _typeof(reducer)));
    checkDistinctNames(selectors, actions);
    return { $$mapped: true, $$reducer: reducer, $$child: child, $$selectors: selectors, $$actions: actions };
}

/**
 * Custom store creation function. This is needed since when building
 * the reducer tree, we need to know about the store. Initially the
 * store is created with a dummy reducer, which is then replaced with
 * the real reducer.
**/
function createStore(reducerTree) {
    var preloadedState = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var extender = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    var enhancer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;

    if (!(0, _lodash.isPlainObject)(preloadedState) || Object.getOwnPropertyNames(preloadedState).length) throw new Error("reslice.createStore: preloaded state not supported, must be {}");
    var store = (0, _redux.createStore)(function () {}, undefined, enhancer);
    var reducer = buildReducer(reducerTree, store);
    if (extender) reducer = extender(reducer);
    store.replaceReducer(reducer);
    return store;
}

/**
 * Helper function to wrap a top-level component so that the slice is
 * injected into the properties.
**/
function createInjector(Klass) {
    var Wrapper = function (_Component) {
        _inherits(Wrapper, _Component);

        function Wrapper() {
            _classCallCheck(this, Wrapper);

            return _possibleConstructorReturn(this, (Wrapper.__proto__ || Object.getPrototypeOf(Wrapper)).apply(this, arguments));
        }

        _createClass(Wrapper, [{
            key: 'render',
            value: function render() {
                return _react2.default.createElement(Klass, _extends({}, this.props, { slice: this.props.slice }));
            }
        }]);

        return Wrapper;
    }(_react.Component);

    return connect(function (slice, props) {
        return { slice: slice };
    })(Wrapper);
}

/**
 * Wrapper for the reselect "createSelector" function. This maintains
 * compatability in that a memoized selector is returned, but adds a
 * $$factory function to the selector that allows further instances
 * to be created. This is used to that, where a selector is used multiple
 * times in the state tree (eg., with arrays of slices) then a separate
 * memoized instance can be created for each slice.
**/
function createSelector() {
    for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
    }

    var selector = _reselect.createSelector.apply(undefined, args);
    selector.$$factory = function () {
        return _reselect.createSelector.apply(undefined, args);
    };
    return selector;
}