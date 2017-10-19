import { each, isArray, isFunction, isObject, keys, map } from 'lodash' ;
import { globalAction } from './reslice' ;

/**
 * Function used to bind a slice structure to a set of selectors and actions. Used
 * in unit test code to convert a predefined slice to a slice with the accessor
 * functions.
**/
export function bindTestSlice (slice, { selectors = {}, actions = {} } = {}, getSlice = null) {
    let prototype = {
        $$tag: 0,
        getRoot: function () { return this ; },
        action: function (a) { return { ...a, $$tag: 0 } },
        globalAction: globalAction,
        } ;
    each(selectors, (selector, name) => {
        if (isFunction(selector))
            prototype[name] = function (...args) {
                return selector(Object.assign({}, this, {}), ...args) ;
                } ;
        }) ;
    each(actions, (creator, name) => {
        if (isFunction(creator))
            prototype[name] = function (...args) {
                let action = creator.apply(this, args) ;
                if (isFunction(action))
                    return function (dispatch, _, ...args) {
                        return action.call(
                            null,
                            dispatch,
                            () => getSlice ? getSlice() : slice,
                            ...args
                            ) ;
                        }
                return action ;
                } ;
        }) ;
    Object.setPrototypeOf(slice, prototype) ;
    return slice ;
    }

/**
 * Recursively process an object to that non-own-properties (ie., prototypes)
 * are removed.
**/
export function ownPropertiesOnly(thing) {
    if (isObject(thing)) {
        let result = {} ;
        each(keys(thing), (key) => {
            result[key] = ownPropertiesOnly(thing[key]) ;
            }) ;
        return result ;
        }
    if (isArray(thing))
        return map(thing, (item) => ownPropertiesOnly(item)) ;
    return thing ;
    }
