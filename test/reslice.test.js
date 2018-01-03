import React, { Component } from 'react' ;
import Enzyme, { mount } from 'enzyme' ;
import Adapter from 'enzyme-adapter-react-16';
import { applyMiddleware, compose } from 'redux' ;
import { Provider } from 'react-redux' ;
import thunk from 'redux-thunk' ;

import expect from 'expect' ;
import _ from 'lodash' ;
import 'jsdom-global/register' ;

import * as reslice from '../src/reslice' ;
import { bindTestSlice } from '../src/tests' ;

Enzyme.configure({ adapter: new Adapter() }) ;


function ownPropertiesOnly(thing) {
    if (_.isArray(thing))
        return _.map(thing, (item) => ownPropertiesOnly(item)) ;
    if (_.isObject(thing)) {
        let result = {} ;
        _.each(_.keys(thing), (key) => {
            result[key] = ownPropertiesOnly(thing[key]) ;
            }) ;
        return result ;
        }
    return thing ;
    }

expect.extend({
    toEqualObject(received, argument) {
        let actual = ownPropertiesOnly(received) ;
        if (this.equals(actual, argument))
            return {
                pass: true,
                message: () => `expected ${ JSON.stringify(actual) } to not equal ${ JSON.stringify(argument) }`,
                } ;
        return {
            pass: false,
            message: () => `expected ${ JSON.stringify(actual) } to equal ${ JSON.stringify(argument) }`,
            } ;
        },
    }) ;

const reducerAB = (state, action) => {
    if (!state)
        return { a: 1, b: 2 } ;
    if (action.type === 'SETA')
        return { ...state, a: action. v } ;
    if (action.type === 'SETB')
        return { ...state, b: action. v } ;
    return state ;
    } ;
const selectorsAB = {
    getA: (slice) => slice.a + 10,
    getB: (slice) => slice.b + 10,
    getX: null,
    } ;
const actionsAB = {
    setA: (v) => ({ type: 'SETA', v }),
    setB: (v) => ({ type: 'SETB', v }),
    setX: null,
    } ;
      
const actionsABThunk = {
    setA: (v) => function (dispatch, getSlice) {
                    dispatch(getSlice().action({ type: 'SETA', v })) ;
                    },
    setB: (v) => function (dispatch, getSlice) {
                    dispatch(getSlice().action({ type: 'SETB', v })) ;
                    },
    setX: null,
    } ;
      
const reducerXY = (state, action) => {
    if (!state)
        return { x: 1, y: 2 } ;
    if (action.type === 'SETX')
        return { ...state, x: action. v } ;
    if (action.type === 'SETY')
        return { ...state, y: action. v } ;
    return state ;
    } ;
const selectorsXY = {
    getX: (slice) => slice.x + 10,
    getY: (slice) => slice.y + 10,
    } ;
const actionsXY = {
    setX: (v) => ({ type: 'SETX', v }),
    setY: (v) => ({ type: 'SETY', v }),
    } ;
      
describe('reslice tests', () => {

    it ('should evaluate shallow equal', () => {
        let v1 = 1 ;
        let v2 = [ 1, 2, 3 ] ;
        let v3 = 'three' ;
        expect(reslice.shallowEqual({}, {})).toBe(true) ;
        expect(reslice.shallowEqual({ a: v1 }, { a: v1 })).toBe(true) ;
        expect(reslice.shallowEqual({ a: v1, b: v2 }, { a: v1, b: v2 })).toBe(true) ;
        expect(reslice.shallowEqual({ a: v2, b: v1 }, { a: v1, b: v2 })).toBe(false) ;
        expect(reslice.shallowEqual({ a: v1, b: v2 }, { a: v1 })).toBe(false) ;
        expect(reslice.shallowEqual({ a: v1 }, { a: v1, b: v2 })).toBe(false) ;
        expect(reslice.shallowEqual({ a: v1 }, { b: v1 })).toBe(false) ;
        expect(reslice.shallowEqual({ a: v1 }, { a: v2 })).toBe(false) ;
        expect(reslice.shallowEqual([], [])).toBe(true) ;
        expect(reslice.shallowEqual([ v1 ], [ v1 ])).toBe(true) ;
        expect(reslice.shallowEqual([ v1, v2 ], [ v1, v2 ])).toBe(true) ;
        expect(reslice.shallowEqual([ v2, v1 ], [ v1, v2 ])).toBe(false) ;
        expect(reslice.shallowEqual([ v1 ], [ v1, v2 ])).toBe(false) ;
        expect(reslice.shallowEqual([ v1, v2 ], [ v1 ])).toBe(false) ;
        expect(reslice.shallowEqual({}, [])).toBe(false) ;
        expect(reslice.shallowEqual(1, 1)).toBe(true) ;
        expect(reslice.shallowEqual(1, 2)).toBe(false) ;
        expect(reslice.shallowEqual(undefined, undefined)).toBe(true) ;
        expect(reslice.shallowEqual(null, null)).toBe(true) ;
        expect(reslice.shallowEqual(undefined, null)).toBe(false) ;
        expect(reslice.shallowEqual(null, undefined)).toBe(false) ;
        expect(reslice.shallowEqual({}, undefined)).toBe(false) ;
        expect(reslice.shallowEqual({}, null)).toBe(false) ;
        expect(reslice.shallowEqual({}, 'XX')).toBe(false) ;
        expect(reslice.shallowEqual('1', '1')).toBe(true) ;
        expect(reslice.shallowEqual(1, '1')).toBe(false) ;
        }) ;

    it ('should throw an exception if bindReducer is not given a function', () => {
        expect(() => reslice.bindReducer(null)).toThrow(/^reslice.*expected reducer/) ;
        }) ;

    it ('should create a bind reducer object', () => {
        let reducer = () => null ;
        let selectors = {} ;
        let actions = {} ;
        let binding = reslice.bindReducer(reducer, { selectors, actions }) ;
        expect(binding.$$bind).toBe(true) ;
        expect(binding.$$reducer).toBe(reducer) ;
        expect(binding.$$selectors).toBe(selectors) ;
        expect(binding.$$actions).toBe(actions) ;
        }) ;

    it ('should create a bind reducer object with empty selectors and actions', () => {
        let reducer = () => null ;
        let binding = reslice.bindReducer(reducer) ;
        expect(binding.$$bind).toBe(true) ;
        expect(binding.$$reducer).toBe(reducer) ;
        expect(binding.$$selectors).toEqual({}) ;
        expect(binding.$$actions).toEqual({}) ;
        }) ;

    it ('should throw an exception if combineReducers is not given a plain object', () => {
        expect(() => reslice.combineReducers(null)).toThrow(/^reslice.*expected reducer/) ;
        }) ;

    it ('should throw an exception if combineReducers is given an undefined reducer', () => {
        expect(() => reslice.combineReducers({ name: undefined })).toThrow(/^reslice.*reducer not set.*name/) ;
        }) ;

    it ('should throw an exception if combineReducers is given an null reducer', () => {
        expect(() => reslice.combineReducers({ name: null })).toThrow(/^reslice.*reducer not set.*name/) ;
        }) ;

    it ('should create a combine reducers object', () => {
        let reducers = {
            r1: () => null,
            r2: () => null,
            } ;
        let selectors = {} ;
        let actions = {} ;
        let binding = reslice.combineReducers(reducers, { selectors, actions }) ;
        expect(binding.$$combine).toBe(true) ;
        expect(binding.$$reducers).toBe(reducers) ;
        expect(binding.$$selectors).toBe(selectors) ;
        expect(binding.$$actions).toBe(actions) ;
        }) ;

    it ('should create a combine reducers object with empty selectors and actions', () => {
        let reducers = {
            r1: () => null,
            r2: () => null,
            } ;
        let binding = reslice.combineReducers(reducers) ;
        expect(binding.$$combine).toBe(true) ;
        expect(binding.$$reducers).toBe(reducers) ;
        expect(binding.$$selectors).toEqual({}) ;
        expect(binding.$$actions).toEqual({}) ;
        }) ;

    it ('should throw an exception if mappedReducer is not given a function', () => {
        expect(() => reslice.mappedReducer(null)).toThrow(/^reslice.*expected reducer/) ;
        }) ;

    it ('should create a mapped reducer object', () => {
        let reducer = () => null ;
        let selectors = {} ;
        let actions = {} ;
        let binding = reslice.mappedReducer(reducer, '_child_', { selectors, actions }) ;
        expect(binding.$$mapped).toBe(true) ;
        expect(binding.$$reducer).toBe(reducer) ;
        expect(binding.$$child).toEqual('_child_') ;
        expect(binding.$$selectors).toEqual({}) ;
        expect(binding.$$actions).toEqual({}) ;
        }) ;

    it ('should create an extend reducer object', () => {
        let reducer = {} ;
        let extension = {} ;
        let binding = reslice.extendReducer(reducer, extension) ;
        expect(binding.$$extend).toBe(true) ;
        expect(binding.$$reducer).toBe(reducer) ;
        expect(binding.$$extension).toBe(extension) ;
        }) ;

    it ('will throw an exception if buildReducer is not passed a reducer object nor function', () => {
        expect(() => reslice.buildReducer(null)).toThrow(/^reslice.*expected object or function/) ;
        expect(() => reslice.buildReducer(undefined)).toThrow(/^reslice.*expected object or function/) ;
        expect(() => reslice.buildReducer(() => null)).not.toThrow() ;
        expect(() => reslice.buildReducer({})).toThrow(/^reslice.*unexpected tree object/) ;
        }) ;

    it ('builds a bindReducer object with selectors and actions', () => {
        let store = {
            } ;
        let binding = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let bound = reslice.buildReducer(binding, store) ;
        let state0 = bound(undefined, { type: '@@INIT' }) ;
        expect(state0.a).toBe(1) ;
        expect(state0.b).toBe(2) ;
        expect(state0.getA()).toBe(11) ;
        expect(state0.getB()).toBe(12) ;
        let state1 = bound(state0, state0.setA(101)) ;
        expect(state1.a).toBe(101) ;
        expect(state1.b).toBe(2) ;
        let state2 = bound(state1, state1.setB(202)) ;
        expect(state2.a).toBe(101) ;
        expect(state2.b).toBe(202) ;
        }) ;

    it ('builds a combineReducers object with selectors and actions', () => {
        let store = {
            } ;
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let bindingXY = reslice.bindReducer(reducerXY, { selectors: selectorsXY, actions: actionsXY }) ;
        let combined  = reslice.combineReducers({ ab: bindingAB, xy: bindingXY }) ;
        let bound     = reslice.buildReducer(combined, store) ;
        let state0 = bound(undefined, { type: '@@INIT' }) ;
        expect(state0.ab.a).toBe(1) ;
        expect(state0.ab.b).toBe(2) ;
        expect(state0.ab.getA()).toBe(11) ;
        expect(state0.ab.getB()).toBe(12) ;
        expect(state0.xy.x).toBe(1) ;
        expect(state0.xy.y).toBe(2) ;
        expect(state0.xy.getX()).toBe(11) ;
        expect(state0.xy.getY()).toBe(12) ;
        let state1 = bound(state0, state0.ab.setA(101)) ;
        expect(state1.ab.a).toBe(101) ;
        expect(state1.ab.b).toBe(2) ;
        let state2 = bound(state1, state1.ab.setB(202)) ;
        expect(state2.ab.a).toBe(101) ;
        expect(state2.ab.b).toBe(202) ;
        let state3 = bound(state2, state2.xy.setX(101)) ;
        expect(state3.xy.x).toBe(101) ;
        expect(state3.xy.y).toBe(2) ;
        let state4 = bound(state3, state3.xy.setY(202)) ;
        expect(state4.xy.x).toBe(101) ;
        expect(state4.xy.y).toBe(202) ;
        }) ;

    it ('builds a mappedReducer object with selectors and actions', () => {
        let mapper = function (state = [], action, reducerForKey) {
            if (action.type === 'ADD') {
                const key     = state.length ;
                const datum   = reducerForKey(key, (slice) => slice.setA(action.a)) ;
                return state.concat(datum) ;
                }
            return state.map((child, index) => reducerForKey(index)(child, action)) ;
            }
        let bound = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let mapped = reslice.mappedReducer(mapper, bound) ;
        let store = reslice.createStore (mapped) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqual([]) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 11 })) ;
        expect(store.getState()).toEqualObject([{ a: 11, b: 2 }]) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 12 })) ;
        expect(store.getState()).toEqualObject([{ a: 11, b: 2 }, { a: 12, b: 2 }]) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('builds a mappedReducer object with selectors and actions and null factory', () => {
        let mapper = function (state = [], action, reducerForKey) {
            if (action.type === 'ADD') {
                const key     = state.length ;
                const datum   = reducerForKey(key, () => null) ;
                return state.concat(datum) ;
                }
            return state.map((child, index) => reducerForKey(index)(child, action)) ;
            }
        let bound = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let mapped = reslice.mappedReducer(mapper, bound) ;
        let store = reslice.createStore (mapped) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqual([]) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 11 })) ;
        expect(store.getState()).toEqualObject([{ a: 1, b: 2 }]) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 12 })) ;
        expect(store.getState()).toEqualObject([{ a: 1, b: 2 }, { a: 1, b: 2 }]) ;
        store.dispatch(store.getState()[0].setA(11)) ;
        store.dispatch(store.getState()[0].setB(12)) ;
        store.dispatch(store.getState()[1].setA(21)) ;
        store.dispatch(store.getState()[1].setB(22)) ;
        expect(store.getState()).toEqualObject([{ a: 11, b: 12 }, { a: 21, b: 22 }]) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('should return same state if mappedReducer makes no changes', () => {
        let mapper = function (state = [], action, reducerForKey) {
            if (action.type === 'ADD') {
                const key     = state.length ;
                const datum   = reducerForKey(key, (slice) => slice.setA(action.a)) ;
                return state.concat(datum) ;
                }
            return state.map((child, index) => reducerForKey(index)(child, action)) ;
            }
        let bound = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let mapped = reslice.mappedReducer(mapper, bound) ;
        let store = reslice.createStore (mapped) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqual([]) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 11 })) ;
        store.dispatch(reslice.globalAction({ type: 'ADD', a: 12 })) ;
        let state = store.getState() ;
        expect(state).toEqualObject([{ a: 11, b: 2 }, { a: 12, b: 2 }]) ;
        store.dispatch(reslice.globalAction({ type: 'NUL' })) ;
        expect(store.getState()).toBe(state) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('reduces combined duplicate reducers', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let store     = reslice.createStore (combined) ;
        let $$tag     = store.getState().$$tag ;
        let $$tag_ab1 = store.getState().ab1.$$tag ;
        let $$tag_ab2 = store.getState().ab2.$$tag ;
        expect($$tag     != $$tag_ab1).toBe(true) ;
        expect($$tag     != $$tag_ab2).toBe(true) ;
        expect($$tag_ab1 != $$tag_ab2).toBe(true) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2},
            ab2: { a: 1, b: 2},
            }) ;
        store.dispatch(store.getState().ab1.setA(11)) ;
        store.dispatch(store.getState().ab2.setB(22)) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 11, b: 2 },
            ab2: { a: 1,  b: 22},
            }) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        expect(store.getState().ab1.$$tag).toBe($$tag_ab1) ;
        expect(store.getState().ab2.$$tag).toBe($$tag_ab2) ;
        }) ;

    it ('reduces nested combined duplicate reducers', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let topmost   = reslice.combineReducers({ tl1: combined,  tl2: combined  }) ;
        let store     = reslice.createStore (topmost) ;
        let $$tag     = store.getState().$$tag ;
        let $$tag_ab1 = store.getState().tl1.ab1.$$tag ;
        let $$tag_ab2 = store.getState().tl2.ab2.$$tag ;
        expect($$tag     != $$tag_ab1).toBe(true) ;
        expect($$tag     != $$tag_ab2).toBe(true) ;
        expect($$tag_ab1 != $$tag_ab2).toBe(true) ;
        expect(store.getState()).toEqualObject({
            tl1: {
                ab1: { a: 1, b: 2},
                ab2: { a: 1, b: 2},
                },
            tl2: {
                ab1: { a: 1, b: 2},
                ab2: { a: 1, b: 2},
                },
            }) ;
        store.dispatch(store.getState().tl1.ab1.setA(11)) ;
        store.dispatch(store.getState().tl1.ab2.setB(22)) ;
        store.dispatch(store.getState().tl2.ab1.setB(33)) ;
        store.dispatch(store.getState().tl2.ab2.setA(44)) ;
        expect(store.getState()).toEqualObject({
            tl1: {
                ab1: { a: 11, b: 2 },
                ab2: { a: 1,  b: 22},
                },
            tl2: {
                ab1: { a: 1,  b: 33},
                ab2: { a: 44, b: 2 },
                },
            }) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        expect(store.getState().tl1.ab1.$$tag).toBe($$tag_ab1) ;
        expect(store.getState().tl2.ab2.$$tag).toBe($$tag_ab2) ;
        }) ;

    it ('reduces a reducer extended with a null function', () => {
        let bindingAB = reslice.bindReducer  (reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let extended  = reslice.extendReducer(bindingAB, (state, action) => {
            return null
            }) ;
        let store    = reslice.createStore (extended) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqualObject({ a: 1, b: 2 }) ;
        expect(store.getState().getA()).toBe(11) ;
        expect(store.getState().getB()).toBe(12) ;
        store.dispatch(store.getState().setA(111)) ;
        expect(store.getState()).toEqualObject({ a: 111, b: 2 }) ;
        expect(store.getState().getA()).toBe(121) ;
        expect(store.getState().getB()).toBe(12) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('reduces a reducer extended with an overriding function handling', () => {
        let bindingAB = reslice.bindReducer  (reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let extended  = reslice.extendReducer(bindingAB, (state, action) => {
            if (action.type === 'SETA')
                return { ...state, a: action.v * 10 }
            return null
            }) ;
        let store    = reslice.createStore (extended) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqualObject({ a: 1, b: 2 }) ;
        expect(store.getState().getA()).toBe(11) ;
        expect(store.getState().getB()).toBe(12) ;
        store.dispatch(store.getState().setA(111)) ;
        expect(store.getState()).toEqualObject({ a: 1110, b: 2 }) ;
        expect(store.getState().getA()).toBe(1120) ;
        expect(store.getState().getB()).toBe(12) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('reduces a reducer extended with an overriding function not handling', () => {
        let bindingAB = reslice.bindReducer  (reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let extended  = reslice.extendReducer(bindingAB, (state, action) => {
            if (action.type === 'SETA')
                return { ...state, a: action.v * 10 }
            return null
            }) ;
        let store    = reslice.createStore (extended) ;
        let $$tag    = store.getState().$$tag ;
        expect(store.getState()).toEqualObject({ a: 1, b: 2 }) ;
        expect(store.getState().getA()).toBe(11) ;
        expect(store.getState().getB()).toBe(12) ;
        store.dispatch(store.getState().setB(222)) ;
        expect(store.getState()).toEqualObject({ a: 1, b: 222 }) ;
        expect(store.getState().getA()).toBe(11) ;
        expect(store.getState().getB()).toBe(232) ;
        expect(store.getState().$$tag).toBe($$tag) ;
        }) ;

    it ('reduces combined duplicate reducers extended with an overriding function', () => {
        let bindingAB = reslice.bindReducer  (reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let extended  = reslice.extendReducer(bindingAB, (state, action) => {
            if (action.type === 'SETA')
                return { ...state, a: action.v * 10 }
            return null
            }) ;
        let combined  = reslice.combineReducers({ ex1: extended, ex2: extended }) ;
        let store     = reslice.createStore (combined) ;
        expect(store.getState()).toEqualObject({
            ex1: { a: 1, b: 2 },
            ex2: { a: 1, b: 2 },
            }) ;
        expect(store.getState().ex1.getA()).toBe(11) ;
        expect(store.getState().ex1.getB()).toBe(12) ;
        store.dispatch(store.getState().ex1.setA(111)) ;
        store.dispatch(store.getState().ex2.setA(222)) ;
        expect(store.getState()).toEqualObject({
            ex1: { a: 1110, b: 2 },
            ex2: { a: 2220, b: 2 },
            }) ;
        expect(store.getState().ex1.getA()).toBe(1120) ;
        expect(store.getState().ex1.getB()).toBe(12) ;
        expect(store.getState().ex2.getA()).toBe(2230) ;
        expect(store.getState().ex2.getB()).toBe(12) ;
        }) ;

    it ('should build a bind reducer object ignoring non-function selectors and actions', () => {
        let reducer = () => null ;
        let selectors = { a: 1 } ;
        let actions = { b: 2 } ;
        let binding = reslice.bindReducer(reducer, { selectors: selectors, actions: actions }) ;
        expect(binding.$$bind).toBe(true) ;
        expect(binding.$$reducer).toBe(reducer) ;
        expect(binding.$$selectors).toBe(selectors) ;
        expect(binding.$$actions).toBe(actions) ;
        reslice.buildReducer(binding, {}) ;
        }) ;

    it ('should create separate memoized selectors', () => {
        let getA_calls = 0 ;
        let getB_calls = 0 ;
        const selectorsAB = {
            getA: reslice.createSelector((slice) => slice, (slice) => {
                getA_calls += 1 ;
                return slice.a + 10 ;
                }),
            getB: reslice.createSelector((slice) => slice, (slice) => {
                getB_calls += 1 ;
                return slice.b + 10 ;
                }),
            } ;
        let store = {
            } ;
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let bound     = reslice.buildReducer(combined, store) ;
        let state0 = bound(undefined, { type: '@@INIT' }) ;
        expect(state0.ab1.getA()).toBe(11) ;
        expect(state0.ab2.getA()).toBe(11) ;
        expect(state0.ab1.getB()).toBe(12) ;
        expect(state0.ab2.getB()).toBe(12) ;
        let state1 = bound(state0, state0.ab1.setA(101)) ;
        expect(state1.ab1.getA()).toBe(111) ;
        expect(state1.ab2.getA()).toBe(11) ;
        expect(state0.ab1.getB()).toBe(12) ;
        expect(state0.ab2.getB()).toBe(12) ;
        expect(getA_calls).toBe(3) ;
        expect(getB_calls).toBe(2) ;
        }) ;

    it ('throws an exception on untagged actions', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let store     = reslice.createStore(bindingAB) ;
        expect(store.getState()).toEqualObject({ a: 1, b: 2 }) ;
        expect(() => store.dispatch({ type: 'SETA'})).toThrow(/tag is undefined.*SETA/) ;
        }) ;

    it ('executes an action with a null tag', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let store     = reslice.createStore(bindingAB) ;
        expect(store.getState()).toEqualObject({ a: 1, b: 2 }) ;
        store.dispatch({ type: 'SETA', v: 11, $$tag: null }) ;
        expect(store.getState()).toEqualObject({ a: 11, b: 2 }) ;
        }) ;

    it ('executes an action with a null tag on multiple slices', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let store     = reslice.createStore (combined) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2},
            ab2: { a: 1, b: 2},
            }) ;
        store.dispatch({ type: 'SETA', v: 11, $$tag: null }) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 11, b: 2},
            ab2: { a: 11, b: 2},
            }) ;
        }) ;

    it ('executes an directly created action', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let store     = reslice.createStore (combined) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2},
            ab2: { a: 1, b: 2},
            }) ;
        store.dispatch(store.getState().ab1.action({ type: 'SETA', v: 11 })) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 11, b: 2},
            ab2: { a:  1, b: 2},
            }) ;
        }) ;

    it ('throws an error creating an already tagged action', () => {
        let binding = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let store   = reslice.createStore (binding) ;
        expect(() => store.getState().action({ type: 'SETA', $$tag: 11 })).toThrow(/al/) ;
        }) ;

    it ('should implemenet getRoot at all levels', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let store     = reslice.createStore (combined) ;
        let state     = store.getState() ;
        expect(state.getRoot()).toBe(state) ;
        expect(state.ab1.getRoot()).toBe(state) ;
        expect(state.ab2.getRoot()).toBe(state) ;
        }) ;

    it ('throws an exception if action and selector names are not distinct', () => {
        expect(() => reslice.bindReducer(reducerAB, {
            selectors: {
                name1 : () => null,
                name2 : () => null,
                },
            actions: {
                name1 : () => null,
                name3 : () => null,
                },
            })).toThrow(/name1/) ;
        }) ;

    it ('throws an exception if an action or selector name is action', () => {
        expect(() => reslice.bindReducer(reducerAB, {
            selectors: {
                name1 : () => null,
                name2 : () => null,
                },
            actions: {
                action: () => null,
                name3 : () => null,
                },
            })).toThrow(/action.*selector or action name/) ;
        expect(() => reslice.bindReducer(reducerAB, {
            selectors: {
                name1 : () => null,
                action: () => null,
                },
            actions: {
                name2 : () => null,
                name3 : () => null,
                },
            })).toThrow(/action.*selector or action name/) ;
        }) ;

    it ('throws an exception if an action or selector name is globalAction', () => {
        expect(() => reslice.bindReducer(reducerAB, {
            selectors: {
                name1 : () => null,
                globalAction: () => null,
                }
            })).toThrow(/globalAction.*selector or action name/) ;
        expect(() => reslice.bindReducer(reducerAB, {
            actions: {
                name1 : () => null,
                globalAction: () => null,
                }
            })).toThrow(/globalAction.*selector or action name/) ;
        }) ;

    it ('throws an exception if an action or selector name is getRoot', () => {
        expect(() => reslice.bindReducer(reducerAB, {
            selectors: {
                name1 : () => null,
                getRoot: () => null,
                }
            })).toThrow(/getRoot.*selector or action name/) ;
        expect(() => reslice.bindReducer(reducerAB, {
            actions: {
                name1 : () => null,
                getRoot: () => null,
                }
            })).toThrow(/getRoot.*selector or action name/) ;
        }) ;

    it ('should create a global action', () => {
        expect(reslice.globalAction({ type: 'TYPE'})).toEqual({
            type: 'TYPE',
            $$tag: null,
            }) ;
        }) ;

    it ('throws an expection if global action is already tagged', () => {
        expect(() => reslice.globalAction({ type: 'TYPE', $$tag: 42})).toThrow(/already has a tag: 42/) ;
        }) ;

    it ('throws an exception if create store given invalid preloaded state', () => {
        expect(() => reslice.createStore(null, null)).toThrow(/preloaded state not supported/) ;
        expect(() => reslice.createStore(null, { a: 1 })).toThrow(/preloaded state not supported/) ;
        }) ;


    it ('should create a store', () => {
        let reducer = (state = {}, action) => state ;
        let selectors = {} ;
        let actions = {} ;
        let binding = reslice.bindReducer(reducer, { selectors, actions }) ;
        let store = reslice.createStore(binding, {}) ;
        expect(typeof store.dispatch).toBe("function") ;
        expect(typeof store.getState).toBe("function") ;
        }) ;

    it ('should create a store with an extender', () => {
        let reducer = (state = {}, action) => state ;
        let selectors = {} ;
        let actions = {} ;
        let binding = reslice.bindReducer(reducer, { selectors, actions }) ;
        let store = reslice.createStore(binding, {}, (r) => r) ;
        expect(typeof store.dispatch).toBe("function") ;
        expect(typeof store.getState).toBe("function") ;
        }) ;

    it ('should bind a test slice', () => {
        let slice = bindTestSlice(
            { a: 1, b: 2 },
            { selectors: selectorsAB, actions: actionsAB }
            ) ;
        expect(slice.getA()).toBe(11) ;
        expect(slice.getB()).toBe(12) ;
        expect(slice.setA(2)).toEqual({ type: 'SETA', v: 2 }) ;
        expect(slice.setB(3)).toEqual({ type: 'SETB', v: 3 }) ;
        expect(slice.getRoot()).toBe(slice) ;
        expect(slice.action({ type: 'A' })).toEqual({ type: 'A', $$tag: 0 }) ;
        expect(slice.getX).toBe(undefined) ;
        expect(slice.setX).toBe(undefined) ;
        }) ;

    it ('should create an injector', () => {
        let reducer = (state = {}, action) => state ;
        let store = reslice.createStore(reslice.bindReducer(reducer)) ;
        const Klass = class extends Component {
            render () {
                return <span>{ this.props.aprop }</span> ;
                } ;
            } ;
        const Injector = reslice.createInjector(Klass) ;
        const wrapper = mount(<Provider store={ store }><Injector aprop='avalue'/></Provider>) ;
        expect(wrapper.find(Injector).length).toBe(1) ;
        expect(wrapper.find(Klass).length).toBe(1) ;
        expect(wrapper.find(Klass).props().aprop).toBe('avalue') ;
        expect(wrapper.find(Klass).props().slice).toBe(store.getState()) ;
        expect(wrapper.find('span').length).toBe(1) ;
        expect(wrapper.find('span').text()).toBe('avalue') ;
        }) ;

    it ('should convert thunks to getSlice', () => {
        let bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsABThunk }) ;
        let combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        let store     = reslice.createStore (combined, {}, null, applyMiddleware(thunk)) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2},
            ab2: { a: 1, b: 2},
            }) ;
        store.dispatch(store.getState().ab1.setA(11)) ;
        store.dispatch(store.getState().ab2.setB(22)) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 11, b: 2 },
            ab2: { a: 1,  b: 22},
            }) ;
        }) ;

    it ('handles connect on nested components', () => {
        const bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        const combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        const store     = reslice.createStore (combined) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2 },
            ab2: { a: 1, b: 2 },
            }) ;
        store.dispatch(store.getState().ab1.setA(10)) ;
        store.dispatch(store.getState().ab2.setB(20)) ;
        class _AB extends Component {
            render () {
                return (
                    <span>
                      <span id={ this.props.id + "-aa" }>{ this.props.aa }</span>
                      <span id={ this.props.id + "-bb" }>{ this.props.bb }</span>
                    </span>
                    ) ;
                }
            } ;
        const AB = reslice.connect(
            function (slice) {
                return {
                    aa: slice.getA(),
                    bb: slice.getB(),
                    } ;
                },
            function (dispatch, slice) {
                return {
                    } ;
                },
            )(_AB) ;
        class Top extends Component {
            render () {
                return (
                    <span>
                      <AB slice={ this.props.slice.ab1 } id="ab1"/>
                      <AB slice={ this.props.slice.ab2 } id="ab2"/>
                    </span>
                    ) ;
                }
            } ;
        const Injector = reslice.createInjector(Top) ;
        const wrapper = mount(<Provider store={ store }><Injector/></Provider>) ;
        expect(wrapper.find('#ab1-aa').text()).toBe('20') ;
        expect(wrapper.find('#ab1-bb').text()).toBe('12') ;
        expect(wrapper.find('#ab2-aa').text()).toBe('11') ;
        expect(wrapper.find('#ab2-bb').text()).toBe('30') ;
        }) ;

    it ('handles connect on nested components with no mappers', () => {
        const bindingAB = reslice.bindReducer(reducerAB, { selectors: selectorsAB, actions: actionsAB }) ;
        const combined  = reslice.combineReducers({ ab1: bindingAB, ab2: bindingAB }) ;
        const store     = reslice.createStore (combined) ;
        expect(store.getState()).toEqualObject({
            ab1: { a: 1, b: 2 },
            ab2: { a: 1, b: 2 },
            }) ;
        store.dispatch(store.getState().ab1.setA(10)) ;
        store.dispatch(store.getState().ab2.setB(20)) ;
        class _AB extends Component {
            render () {
                return (
                    <span>
                      <span id={ this.props.id + "-aa" }>{ this.props.aa }</span>
                      <span id={ this.props.id + "-bb" }>{ this.props.bb }</span>
                    </span>
                    ) ;
                }
            } ;
        const AB = reslice.connect()(_AB) ;
        class Top extends Component {
            render () {
                return (
                    <span>
                      <AB aa={ this.props.slice.ab1.a } bb={ this.props.slice.ab1.b } id="ab1"/>
                      <AB aa={ this.props.slice.ab2.a } bb={ this.props.slice.ab2.b } id="ab2"/>
                    </span>
                    ) ;
                }
            } ;
        const Injector = reslice.createInjector(Top) ;
        const wrapper = mount(<Provider store={ store }><Injector/></Provider>) ;
        expect(wrapper.find('#ab1-aa').text()).toBe('10') ;
        expect(wrapper.find('#ab1-bb').text()).toBe('2' ) ;
        expect(wrapper.find('#ab2-aa').text()).toBe('1' ) ;
        expect(wrapper.find('#ab2-bb').text()).toBe('20') ;
        }) ;

    it ('should correctly handle updated state from an extender', () => {
        let gotSlice = null ;
        const reducerInner = (state = { tag: 'inner0' }, action) => {
            return action.type === 'inner' ? { tag: 'inner1' } : state ;
            } ;
        const reducerBound = reslice.bindReducer(reducerInner, {
            actions: {
                getter: function () {
                            return function (dispatch, getSlice) {
                                gotSlice = getSlice() ;
                            }
                    }
                }
            }) ;
        const extendFunc = (state = { tag: 'extend0' }, action) => {
            return action.type === 'extend' ? { tag: 'extend1' } : null ;
            } ;
        const reducer = reslice.extendReducer(reducerBound, extendFunc) ;
        let store = reslice.createStore (reducer, {}, null, applyMiddleware(thunk)) ;

        store.dispatch(store.getState().getter()) ;
        expect(gotSlice).toEqual({ tag: 'inner0' }) ;

        store.dispatch({ $$tag: null, type: 'none' }) ;
        store.dispatch(store.getState().getter()) ;
        expect(gotSlice).toEqual({ tag: 'inner0' }) ;

        store.dispatch({ $$tag: null, type: 'inner' }) ;
        store.dispatch(store.getState().getter()) ;
        expect(gotSlice).toEqual({ tag: 'inner1' }) ;

        store.dispatch({ $$tag: null, type: 'extend' }) ;
        store.dispatch(store.getState().getter()) ;
        expect(gotSlice).toEqual({ tag: 'extend1' }) ;
        }) ;
    }) ;
