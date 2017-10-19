import expect from 'expect' ;
import { ownPropertiesOnly } from './tests' ;

expect.extend({
    /**
     * Check a value against an expected object, where the value is recursively
     * stripped of all non-own-properties (ie., the prototype is removed).
    **/
    toEqualObject(expected) {
        let actual = ownPropertiesOnly(this.actual) ;
        expect(actual).toEqual(expected) ;
        return this ;
        },
    /**
     * Check actions. Default the $$tag to zero in both the actual and expected
     * values.
    **/
    toEqualAction(_expected) {
        let actual   = Object.assign({}, this.actual, { $$tag: this.actual.$$tag || 0 }) ;
        let expected = Object.assign({}, _expected, { $$tag: _expected.$$tag || 0 }) ;
        expect(actual).toEqual(expected) ;
        return this ;
        },
    }) ;