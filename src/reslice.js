import React, { Component } from 'react' ;
import PropTypes from 'prop-types' ;
import { each, groupBy, includes, isArray, isFunction, isObject, isPlainObject, keys, mapValues, pickBy, union } from 'lodash' ;
import { combineReducers as __combineReducers,  createStore as __createStore } from 'redux' ;
import { connect as __connect } from 'react-redux' ;
import { createSelector as __createSelector } from 'reselect' ;

let $$tag = 1 ;
let seseq = 1 ;

/**
 * Custom shallow equal, distinguishes between Array and Object.
**/
export function shallowEqual (thing, other) {
    if (thing === other)
        return true ;
    if (thing === null || thing === undefined)
        return false ;
    if (other === null || other === undefined)
        return false ;
    if ((thing.constructor === Object) && (other.constructor === Object)) {
        let tkeys = Object.keys(thing) ;
        let okeys = Object.keys(other) ;
        if (tkeys.length !== okeys.length)
            return false ;
        for (let key of tkeys)
            if (thing[key] !== other[key])
                return false ;
        return true ;
        }
    if ((thing.constructor === Array) && (other.constructor === Array)) {
        if (thing.length != other.length)
            return false ;
        for (let idx in thing)
            if (thing[idx] !== other[idx])
                return false ;
        return true ;
        }
    return false ;
    }

/**
 * Conditionally set prototype. Needed to allow reducers that return state
 * that is not object-like, whence Object.setPrototypeOf borks on IE11/Edge.
**/
function setPrototypeOf(state, prototype) {
    if (isArray(state) || isObject(state))
        Object.setPrototypeOf(state, prototype) ;
    }

/**
 * Check that the selectors and actions have distinct names, and that
 * none of the predefined names are used,
**/
export function checkDistinctNames (selectors, actions) {
    const skeys = keys(selectors) ;
    const akeys = keys(actions) ;
    const allkeys = union(skeys, akeys) ;
    if (allkeys.length != skeys.length + akeys.length)
        throw new Error("reslice.checkDistinctNames: one or more names are repeated: " +
            keys(pickBy(groupBy(skeys.concat(akeys)), (x) => x.length > 1))) ;
    each(['action', 'globalAction', 'getRoot', 'reducer'], (name) => {
        if (includes(allkeys, name))
            throw new Error(`reslice.checkDistinctNames: cannot use ${ name } as a selector or action name`) ;
        }) ;
    }

/**
 * Custom connect function. Invokes the react-redux connect function,
 * but extends mapStateToProps and mapDispatchToProps.
**/
export function connect (mapStateToProps, mapDispatchToProps, ...args) {
    return __connect (
        mapStateToProps ?
            function (state, props) {
                /**
                 * If props.slice is set then call the underlying
                 * mapStateToProps with the slice as the state argument,
                 * extended with the current state as the root. If
                 * there is no props.slice (typically the top level)
                 * then use state directly.
                **/
                if (props.slice)
                    return mapStateToProps(props.slice, props) ;
                return mapStateToProps(state, props) ;
                }
            :
            null,
        mapDispatchToProps ?
            function (dispatch, props) {
                /**
                 * Call the underlying mapDispatchToProps passing the
                 * slice as the second argument (with the same check
                 * as above).
                **/
                if (props.slice)
                    return mapDispatchToProps (dispatch, props.slice, props)
                return mapDispatchToProps (dispatch, props, props)
                }
            :
            null,
        ...args
        ) ;
   }

/**
 * Tag an action as global. Checks the the action does not already have
 * a tag.
**/
export function globalAction (action) {
    if (action.$$tag !== undefined)
        throw new Error("reslice.globalAction: action already has a tag: " + action.$$tag) ;
    return Object.assign({}, action, { $$tag: null }) ;
    } ;

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
export function buildReducer (reducer, store, useTag) {
    /**
     * Expects an object or a function as the reducer argument. If an
     * object then it should be tagged as $$combine, $$extend, etc. This
     * is checked below.
    **/
    if (!isPlainObject(reducer) && !isFunction(reducer))
        throw new Error('reslice.buildReducer: expected object or function, got: ' + typeof(reducer)) ;
    /**
     * Combining reducers. Recursively build nested reducers and use the
     * redux combineReducers fuction to combine them in the normal way.
     * The result is used to create a new tree object for the combined
     * function. This is then processed below.
    **/
    if (reducer.$$combine) {
        let myTag = $$tag++ ;
        /**
         * If a combined reducer is a simple function then wrap the reducer
         * with a filter function that checks on the action tag. If it
         * is not, then it is not wrapped, so that actions continue to
         * propogate down the state tree.
        **/
        function filterReducer(reducer) {
            const _reducer = buildReducer(reducer, store, myTag) ;
            if (isFunction(reducer))
                return function (state, action, ...args) {
                    if (!action.$$tag || (action.$$tag === state.$$tag))
                        return _reducer(state, action, ...args) ;
                    return state ;
                    } ;
            return _reducer ;
            }
        reducer = {
            $$reducer: __combineReducers(mapValues(
                            reducer.$$reducers, (r) => filterReducer(r)
                            )),
            $$selectors: reducer.$$selectors,
            $$actions: reducer.$$actions,
            $$tag: myTag
            } ;
        }
    /**
     * Extending a reducer. Recursively build the reducer that is being
     * extended, then generate a new tree object where the reducer function
     * invokes the extension or the underlying reducer. This is then processed
     * below.
    **/
    else if (reducer.$$extend) {
        let _reducer = buildReducer(reducer.$$reducer, store) ;
        let _extension = reducer.$$extension ;
        reducer = {
            $$reducer: function (state, action, ...args) {
                /**
                 * Redux initialise actions do not go through the
                 * extending function.
                **/
                if (action.type.startsWith('@@'))
                    return _reducer(state, action, ...args) ;
                /**
                 * If the action has the global tag or the matching
                 * tag, then run the action through the extending
                 * function. If this yields a result then make sure
                 * the prototype is set and return that result; also
                 * propogate the new state into the reducer so that
                 * getSlice() behaves correctly.
                **/
                if (!action.$$tag || (action.$$tag === state.$$tag)) {
                    let newState = _extension(state, action, ...args) ;
                    if (newState) {
                        setPrototypeOf(newState, Object.getPrototypeOf(state)) ;
                        _reducer.setLastState(newState) ;
                        return newState ;
                        }
                    }
                /**
                 * Otherwise, process through the underlying reducer.
                **/
                return _reducer(state, action, ...args) ;
                },
            $$selectors: reducer.$$reducer.$$selectors,
            $$actions: reducer.$$reducer.$$actions,
            $$tag: _reducer.$$tag,
            } ;
        }
    /**
     * Binding to a reducer function. This is left as-is to be processed
     * below.
    **/
    else if (reducer.$$bind) {
        let _reducer = reducer.$$reducer ;
        reducer = {
            $$reducer: function (state, action, ...args) {
                if (!action.$$tag || (action.$$tag === state.$$tag))
                    return _reducer(state, action, ...args) ;
                return state ;
                },
            $$selectors: reducer.$$selectors,
            $$actions: reducer.$$actions,
            $$tag: $$tag++,
            }
        }
    /**
     * Binding to a mapped reducer. The trick here is to create a factory
     * that creates per-key instances of the underlying reducer, and then
     * wrap that reducer with a function that invokes said reducer with
     * the factory as the third argument.
    **/
    else if (reducer.$$mapped) {
        let mapped = {} ;
        let inner = reducer.$$reducer ;
        let child = reducer.$$child ;
        function reducerForKey (key, initialiser) {
            let keyReducer = mapped[key] ;
            if (!keyReducer)
                mapped[key] = keyReducer = buildReducer(child, store) ;
            if (initialiser) {
                /**
                 * Check for initialiser case in which case create a
                 * new slice and optionally initialise it.
                **/
                let slice = keyReducer(undefined, { type: '@@redux/INIT' }) ;
                let init = initialiser(slice) ;
                return init ? keyReducer(slice, init) : slice ;
                }
            return keyReducer ;
            }
        function wrapper (state, action) {
            let res = inner (state, action, reducerForKey) ;
            return shallowEqual (res, state) ? state : res ;
            }
        reducer = {
            $$reducer: wrapper,
            $$selectors: reducer.$$selectors,
            $$actions: reducer.$$actions,
            $$tag: $$tag++,
            } ;
        }
    /**
     * If the reducer is simply a function then treat it as bound to empty
     * collections of selectors and reducers.
    **/
    else if (isFunction(reducer)) {
        reducer = {
            $$reducer: reducer,
            $$selectors: {},
            $$actions: {},
            $$tag: useTag || $$tag++,
            } ;
        }
    else
    /**
     * Any other case is an error.
    **/
        throw new Error("reslice.buildReducer: unexpected tree object") ;

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
        let lastState = null ;
        let prototype = {
            getRoot: () => store.getState(),
            globalAction: globalAction,
            $$tag: reducer.$$tag,
            } ;
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
        each(reducer.$$selectors, (selector, name) => {
            if (isFunction(selector)) {
                /**
                 * If the selector has a $$factory property then call
                 * that to create the selector. This allows selector
                 * memoization on a per-slice basis, rather than
                 * globally. Also, since we have a .getRoot() 
                 * methods on slices, which may return different results
                 * even if the particular slice changes, we need to
                 * default the outer level of memoization in reslice.
                **/
                if (selector.$$factory)
                    selector = selector.$$factory() ;
                prototype[name] = function (...args) {
                    args.push(seseq++) ;
                    return selector(this, ...args) ;
                    } ;
                }
            }) ;
        each(reducer.$$actions, (creator, name) => {
            if (isFunction(creator))
                prototype[name] = function (...args) {
                    let action = creator.apply(this, args) ;
                    if (isFunction(action))
                        return function (dispatch, getState) {
                            return action.call(
                                null,
                                dispatch,
                                () => lastState
                                ) ;
                            }
                    if (action.$$tag === undefined)
                        return Object.assign({}, action, { $$tag: prototype.$$tag }) ;
                    return action ;
                    } ;
            }) ;
        prototype.action = function (action) {
            if (action.$$tag !== undefined)
                throw new Error("reslice.action: action already has a tag: " + action.$$tag) ;
            return Object.assign({}, action, { $$tag: prototype.$$tag }) ;
            } ;
        /**
         * This is the actual reducer function that will be returned. Before
         * doing so, add a property which is a function that can be called
         * from outside to change the lastState; this is needed by the code
         * in extendReducer.
        **/
        const $$reducer = function (state, action) {
            if (action.$$tag === undefined)
                if (!action.type.startsWith('@@'))
                    throw new Error("reslice.reduce: $$tag is undefined: " + JSON.stringify(action)) ;
            let newState = reducer.$$reducer(state, action) ;
            /**
             * If the new state does not have a tag then it lacks the prototype,
             * so extend the prototype chain of the new object with the prototypes
             * derived above from the actions and selectors.
            **/
            if (newState.$$tag === undefined) {
                let newproto = Object.assign(Object.create(Object.getPrototypeOf(newState)), prototype) ;
                setPrototypeOf(newState, newproto) ;
                lastState = newState ;
                }
            return newState ;
            }
        prototype.reducer = function(action) {
            return $$reducer(this, action) ;
            }
        $$reducer.setLastState = function (state) {
            lastState = state ;
            }
        return $$reducer ;
        }
    wrapReducer.$$tag = reducer.$$tag ;
    return wrapReducer () ;
    }

/**
 * Bind a reducer function to a set of selectors and a set of action
 * creators. Usually this is not neccessary, but it parallels the
 * combineReducers function below.
**/
export function bindReducer (reducer, { selectors = {}, actions = {} } = {}) {
    if (!isFunction(reducer))
        throw new Error('reslice.bindReducer: expected reducer function, got: ' + typeof(reducer)) ;
    checkDistinctNames (selectors, actions) ;
    return { $$bind: true, $$reducer: reducer, $$selectors: selectors, $$actions: actions } ;
    }

/**
 * Bind a set of reducers to set of selectors and a set of action
 * creators. There is a sanity check that the reducers are defined.
**/
export function combineReducers (reducers, { selectors = {}, actions = {} } = {}) {
    if (!isPlainObject(reducers))
        throw new Error('reslice.combineReducers: expected reducer object, got: ' + typeof(reducers)) ;
    checkDistinctNames (selectors, actions) ;
    each(reducers, (reducer, name) => {
        if ((reducer === null) || (reducer === undefined))
            throw new Error('reslice.combineReducers: reducer not set, name: ' + name) ;
        }) ;
    return { $$combine: true, $$reducers: reducers, $$selectors: selectors, $$actions: actions } ;
    }

/**
 * Extend a reducer with an extension function. This will result in a
 * reducer that calls the extension function; if the latter returns
 * null then the original reducer will be called. Any selectors and
 * actions bound to the original reducer will be copied to the
 * new reducer.
**/
export function extendReducer (reducer, extension) {
    return { $$extend: true, $$reducer: reducer, $$extension: extension } ;
    }

/**
 * Create a mapped reducer. This allows something rather like combineReducers,
 * except that the combined data could be something like an array, where the
 * same underlying reducer is used for each value in the array. More
 * details needed!!
**/
export function mappedReducer (reducer, child, { selectors = {}, actions = {} } = {}) {
    if (!isFunction(reducer))
        throw new Error('reslice.mappedReducer: expected reducer function, got: ' + typeof(reducer)) ;
    checkDistinctNames (selectors, actions) ;
    return { $$mapped: true, $$reducer: reducer, $$child: child, $$selectors: selectors, $$actions: actions } ;
    }

/**
 * Custom store creation function. This is needed since when building
 * the reducer tree, we need to know about the store. Initially the
 * store is created with a dummy reducer, which is then replaced with
 * the real reducer.
**/
export function createStore (reducerTree, preloadedState = {}, extender = undefined, enhancer = undefined) {
    if (!isPlainObject(preloadedState) || Object.getOwnPropertyNames(preloadedState).length)
        throw new Error("reslice.createStore: preloaded state not supported, must be {}") ;
    const store   = __createStore (() => {}, undefined, enhancer) ;
    let   reducer = buildReducer(reducerTree, store) ;
    if (extender)
        reducer = extender(reducer) ;
    store.replaceReducer(reducer) ;
    return store ;
    }

/**
 * Helper function to wrap a top-level component so that the slice is
 * injected into the properties.
**/
export function createInjector (Klass) {

    class Wrapper extends Component {
        render () {
            return <Klass { ...this.props } slice={ this.props.slice }/> ;
            }
        }

    return connect(
        (slice, props) => {
            return { slice: slice } ;
            }
        )
        (Wrapper) ;
    }

/**
 * Wrapper for the reselect "createSelector" function. This maintains
 * compatability in that a memoized selector is returned, but adds a
 * $$factory function to the selector that allows further instances
 * to be created. This is used to that, where a selector is used multiple
 * times in the state tree (eg., with arrays of slices) then a separate
 * memoized instance can be created for each slice.
**/
export function createSelector(...args) {
    let selector = __createSelector(...args) ;
    selector.$$factory = function() {
        return __createSelector(...args) ;
        } ;
    return selector ;
    }
