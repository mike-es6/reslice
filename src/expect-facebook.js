import expect from 'expect' ;
import { ownPropertiesOnly } from './tests' ;

expect.extend({
    /**
     * Check a value against an expected object, where the value is recursively
     * stripped of all non-own-properties (ie., the prototype is removed).
    **/
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
    /**
     * Check actions. Default the $$tag to zero in both the actual and expected
     * values.
    **/
    toEqualAction(received, argument) {
        let actual   = Object.assign({}, received.actual, { $$tag: this.actual.$$tag || 0 }) ;
        let expected = Object.assign({}, argument, { $$tag: _expected.$$tag || 0 }) ;
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
