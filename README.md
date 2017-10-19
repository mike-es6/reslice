Reslice - React/Redux State Management
======================================


Reslice is a library that wraps a more object-oriented interface around
Redux, without removing the underlying state-as-Javascript-object
approach.

Reslice is not a way to reduce Redux boilerplate, like
[Koa-Redux](https://github.com/agrasley/koa-redux). In its current form
it is specifically implemented to work with
[Redux-Thunk](https://github.com/gaearon/redux-thunk) and
[Reselect](https://github.com/reactjs/reselect); it will
likely not work with [Redux-Sagas](https://github.com/redux-saga/redux-saga).

The motivation for Reslice is a large system where, except at the
lowest level, the unit of reusability is a combination of React
component + action creators/reducers + selectors (that is, where the
React component is not meaningfully reusable without its associated
logic), and where we want to be able to place the data associated with
such a component at any point in the Redux state tree in each SPA. We
prefer not to have to deal with the need to
[normalize](https://github.com/paularmstrong/normalizr/tree/master/examples/redux)
data.

This is not to suggest that techniques like normalisation are
inherently bad, nor to suggest that Reslice is the one true way. It
works for us; YMMV.

- [Overview](#overview)
- [API - Conventions](#conventions)
- [API - Binding Reducers](#binding)
- [API - The Top-Level Component](#toplevel)
- [API - Direct Access to the Slice](#directaccess)
- [API - Creating Selector Functions](#selectors)
- [API - Accessing the Entire Store](#getroot)
- [Connecting Components to the Store](#connect)
- [Testing Reslice Application Code](#testing)
- [The Gotcha](#gotcha)

<a name="overview"></a>
Overview
--------

The main point of Reslice is to wrap Redux reducer functions, so that
the objects that they return are bound to the action creators and
selectors that are directly associated with them; these are referred to as
**slices**. This means that logic (typically in action creators) that
has access to a particular slice can access the action creators and
selectors associated with that slice - or any nested slice - as
methods on each slice.

In a nutshell, the aim is to be able to write something like below to
implement an action creator (assuming use of Redux-Thunk):

```javascript
const actions = {
    addSomethingAction: function (name, length) {
        return function (dispatch, getSlice) {
            const slice = getSlice() ;
            const count = slice.counter.getTotalCount() ;
            const width = slice.sizer.getEstimatedWidth() ;
            const area = count * width * length ;
            dispatch(slice.totaliser.addSomething(name, area)) ;
            } ;
        },
    } ;
```

Indeed, Reslice allows this to be further simplified, as below
(but more of this anon):

```javascript
const actions = {
    addSomethingAction: function (name, length) {
        const count = this.counter.getTotalCount() ;
        const width = this.sizer.getEstimatedWidth() ;
        const area = count * width * length ;
        return this.totaliser.addSomething(name, area) ;
        } ;
    } ;
```

In addition, Reslice has a modified version of the
[React-Redux](https://github.com/reactjs/react-redux) *connect*
function, which allows versions of *mapStateToProps* and
*mapDispatchToProps* that have access to the component's slice, rather
than the state tree as a whole.

Finally, Reslice will automatically handle the situtation where
the same slice appears more than once in the state tree. For example,
in the Todo List example, each of several Todo's can be handled by a
single reducer function without the problem of an action triggering
multiple reducers, and without the reducer code needing to identity
"its" actions.

<a name="conventions"></a>
API - Conventions
-----------------

Although it is not neccessary, the API documentation below assumes that
the actions and the selectors for a given component are collected
together as properties of objects, for instance as below (note that
they should be *function* functions and not *fat-arrow* functions, this is
explained later).

Also, to emphasise that these functions take a slice of the state tree,
the variable name *slice* is used rather than *state*.

```javascript
const actions = {
    initialise: function () {
        return { type: 'SET_TEXT', text: null } ;
        },
    setText: function (text) {
        return { type: 'SET_TEXT', text } ;
        },
    clearText: function () {
        return { type: 'SET_TEXT', text: '' } ;
        },
    } ;
```
```javascript
const selectors = {
    getText: function (slice) {
        return slice.text ;
        },
    getTextIsCleared: function (slice) {
        return (slice.text === undefined) || 
               (slice.text === null) ||
               (slice.text === '') ;
        },
    } ;
```

In the documention, variables *actions* and *selectors* are assumed to
be such objects.

<a name="binding"></a>
API - Binding Reducers
----------------------

Redux reducer functions are bound to the actions and selectors using one of
several Reslice functions. These include an analogue of the Redux
*combineReducers* function, so that reducer trees are assembled in a
very similar way. The one point to bear in mind is that the results of
the Reslice binding functions are not functions, rather they are
objects containing information about the reducers. The real reducer
function tree will be constructed when the store is created.

*bindReducer* takes a normal reducer function, and an optional argument
which itself optionally provides actions and selectors to be bound to
the reducer. The result is a reducer binding which can be passed to
other binding functions - *combineReducers* being the most common case -
or to the Reslice *createStore* function.

```javascript
import { bindReducer } from 'reslice' ;

function reducer (slice = {}, action) {
    /**
     * Reducer code
    **/
    return slice ;
    }

const boundReducer = bindReducer (reducer, { actions, selectors }) ;
```

So in this example, the slice in the state tree corresponding to this reducer
will have methods *initialise*, ..., *getTextIsCleared*. The selectors
will be bound such that they are called with the slice as their first argument.
Reslice will check that any action and selector names are distinct (and
that they do not include one of the predefined methods *action*,
*globalAction* and *getRoot*; see later).

Reducers can be combined in the same manner as in Redux itself, using
the *combineReducers* function. The first argument is an object containing
reducers, either simple reducer functions, or the result of one of the
Reslice binding functions.

```javascript
import { combineReducers } from 'reslice' ;

function firstReducer (slice = {}, action) {
    /**
     * Reducer code
    **/
    return slice ;
    }

function secondReducer (slice = {}, action) {
    /**
     * Reducer code
    **/
    return slice ;
    }

const combinedReducer = combineReducers({
    first: firstReducer,
    second: secondReducer,
    bound: boundReducer,
    },
    { actions, selectors }
    ;
```

Dynamic reducers are ones that can dynamically add (or remove) new
children at run time, and can be constructed using the *mappedReducer*
function. In the code below, *reducer* is the reducer function for a
slice to which you can add new children (and really is a function), and
*boundReducer* is the reducer used for each child. The *reducerForKey*
argument is a function that takes a key (in the example, the index into
an array) and by default returns a reducer function for that key.

As a special case, *reducerForKey* is called with a second argument
when creating a new child. In this case, the second argument is a
function that should take a child slice as an argument, and returns an
action which will initialise the child. When called this way,
*reducerForKey* returns the initialised slice rather than a reducer
function.

```javascript
import { mappedReducer } from 'reslice' ;

function reducer (state = [], action, reducerForKey) {
    if (action.type === 'ADD') {
        const key     = state.length ;
        const datum   = reducerForKey(key, (slice) => slice.initialise(action.text)) ;
        return state.concat(datum) ;
        }
    return state.map((child, index) => reducerForKey(index)(child, action)) ;
    }

const dynamicReducer = mappedReducer (reducer, boundReducer, { selectors, actions }) ;
```

There is one additional binding function, *extendReducer*. This is
rather specific to our use case, but may be of use. The first argument
is a bound reducer; the second argument is a reducer function that may
return null. The effect is to create a reducer that calls the extension
function first; if this returns a non-null value then that value is
returned. Otherwise, the reducer is called in the normal way.

In effect, the reducer function is wrapped with the extension. Note
that this function does not take *selectors* and *actions*; the
extended reducer inherits these from the bound reducer that is passed
as the first argument.

```
import { extendReducer } from 'reslice' ;

function extension (state, action) {
    /**
     * Reducer code
    **/
    return null ;
    }
const extendedReducer = extendReducer(boundReducer, extension) ;
```

API - Creating the Store
------------------------

As noted above, the Reslice binding functions return objects that
describe the reducers, rather than actual reducer functions. It is
therefore neccessary to convert these to a real tree of reducer
functions. This is handled by the Reslice *createStore* function.

The first argument is a bound reducer. The second argument is initial
state for the store, however, this is not yet supported by Reslice and
must be an empty object.

The third argument, which is optional, is a store extender function, in
the example below provided by the
[Redux-Batched-Actions](https://github.com/tshelburne/redux-batched-actions)
extender.

The fourth argument, which is optional, is a store enhancer, in the
example below provided by
[Redux-Devtools](https://github.com/gaearon/redux-devtools).

```javascript
import { createStore } from 'reslice' ;
import { enableBatching } from 'redux-batched-actions' ;
import { createDevTools } from 'redux-devtools' ;

const DevTools = createDevTools(...) ;
const enhancer = DevTools.instrument() ;
const store = createStore(combinedReducer, {}, extender, enhancer) ;
```

<a name="toplevel"></a>
API - The Top-Level Component
-----------------------------

The final piece is to inject the top of the state tree into a top-level
component as its slice. The *createInjector* is a helper function that
creates a wrapper around a component, as in the example below. Within
*MyTopLevelComponent*, the *slice* prop will be the top of the state
tree. Other props passed to the *Injector* component will be passed
through to *MyTopLevelComponent*.

```javascript
import React, { Component } from 'react' ;
import { Provider } from 'react-redux' ;
import { createStore, createInjector } from 'reslice' ;
import MyTopLevelComponent from './path/to/mytolevelcomponent' ;

const store = createStore(...) ;
const Injector = createInjector(MyTopLevelComponent) ;

class App extends Component {
    render () {
        return (
            <Provider store={ store }>
                <Injector some="some" other="other" props="props"/>
            </Provider>
            )

        }
    }
```

API - Creating Redux Actions
----------------------------

As alluded to earlier, Reslice can handle the situation where a
particular Redux reducer implementation can be used at any point in the
state tree, without worrying about adding extra identifiers to prevent
actions triggering changes in more than one slice.

In the Todo example, there is a single Todo reducer. This is used for
each of the Todo's in the Todo List. Stripped down somewhat, the code
is roughly as below:

```javascript
import { bindReducer, mappedReducer } from 'reslice' ;

const todoActions = {
    initialise: function (text) {
        return { type: 'INITIALISE', text } ;
        },
    onChange: function (text) {
        return { type: 'CHANGE', text } ;
        },
    } ;

function _todoReducer(state = {}, action) {
    switch (action.type) {
        case 'INITIALISE' :
        case 'CHANGE' :
            return { ...state, text: action.text } ;
        default :
            break ;
        }
    return state ;
    }

const todoReducer = bindReducer(
    _todoReducer,
    { actions: todoActions }
    ) ;

const todolistActions = {
    add: function (text) {
        return { type: 'ADD', text } ;
        },
    } ;

function _todolistReducer (state = [], action, reducerForKey) {
    if (action.type === 'ADD') {
        const key     = state.length ;
        const datum   = reducerForKey(key, (slice) => slice.initialise(action.text)) ;
        return state.concat(datum) ;
        }
    return state.map((todo, index) => reducerForKey(index)(todo, action)) ;
    }

export const todolistReducer = mappedReducer (
    _todolistReducer,
    todoReducer,
    { actions: todolistActions }
    ) ;
```

So, the *todolistReducer* maintains an array of slices, each of which is
maintained by the *todoReducer*. Now, suppose that elsewhere in the
system, we have an action creator that should change the text of the
n'th Todo in the Todo List. Assuming that this action creator is
associated with a slice that contains the Todo List as *todolist*, and
that Redux-Thunk is being used, This could look like:

```javascript
const otherActions = {
    updateNthTodo: function (nth, text) {
        return function (dispatch, getSlice) {
            return dispatch(getSlice().todolist[nth].onChange(text)) ;
            }
        },
    } ;
```

This code will work, and the *nth* Todo will be updated, without any
other Todo being affected. It works because each slice is given a
unique tag, and when an action object is created using a slice method
(in this case *....onChange(text)*, then that action object is given
the same tag (this is handled by Reslice wrapping the slice methods).
The code that runs when *createStore* is called will wrap
the reducer functions so that they are only called if the tag matches.

In addition, an exception will be thrown if the action object is not
tagged, to prevent action objects being created that cannot match
a tag. The following would throw an exception.

```javascript
const otherActions = {
    dontUpdateNthTodo: function (nth, text) {
        return function (dispatch, getSlice) {
            return dispatch({ type: 'CHANGE', text }) ;
            }
        },
    } ;
```

There are two cases where you might not want this. Firstly, you want
to dispatch an action without having to implement a specific action creator.
To handle this case, the method *action* is exposed on all slices:

```javascript
const otherActions = {
    doSomething: function (value) {
        return function (dispatch, getSlice) {
            return dispatch(getSlice().action({ type: 'SOMETHING', value })) ;
            }
        },
    } ;
```

Secondly, to dispatch an action which will be processed by **all**
reducers (rather as standard Redux would do):

```javascript
const otherActions = {
    doGlobal: function (value) {
        return function (dispatch, getSlice) {
            return dispatch(getSlice().globalAction({ type: 'GLOBAL', value })) ;
            }
        },
    } ;
```

The *globalAction* case can also be written more simply:

```javascript
import { globalAction } from 'reslice' ;

const otherActions = {
    doGlobal: function (value) {
        return globalAction({ type: 'GLOBAL', value }) ;
        },
    } ;
```

<a name="directaccess"></a>
API - Direct Access to the Slice
--------------------------------

In standard Redux, action creators do no more than return actions; the
action creators do not have access to the store. This is one reason for
the existance of Redux-Thunk (the other being to provide a way to handle
asynchronous operations). The examples at the end of the previous
section illustrate this, with the exception that Reslice calls the
thunk with a *getSlice* function rather than *getState*.

In many situations - and certainly many situations in our use case -
the action creators need to access the slice even if they do not
involve asynchronous operators. So, Reslice provides a shortcut for
this; within action creators, *this* is the slice. Hence, the
*updateNthTodo* action above can be written as:

```javascript
const otherActions = {
    updateNthTodo: function (nth, text) {
    	return this.todolist[nth].onChange(text) ;
        },
    } ;
```

As noted earlier, action creations must be *function* functions and not
*fat-arrow* functions, and here lies the reason why. Were they
*fat-arrow* functions, then *this* would not be correctly bound.


<a name="selectors"></a>
API - Creating Selector Functions
---------------------------------

Reslice will work with the standard Reselect *createSelector* function.
However, if you use a Reslice component multiple times (such as the
Todo's in the ToDo List), and those components use selectors, then
naive usage of Reselect will break the memoization. This issue is
covered in the Reselect documentation at
[Sharing Selectors with Props Across Multiple Component
Instances](https://github.com/reactjs/reselect/blob/master/README.md#sharing-selectors-with-props-across-multiple-component-instances).

However, Reslice directly handles this, as below. Here,
*createSelector* is a wrapper around the Reselect function of the same
name, that has the desired effect.

```javascript
import { createSelector } from 'reslice' ;

const selectors = {
    getSomething: createSelector(
        (slice) => slice.data,
        (data) => data.something
        ),
    },
```

Note: if you use the Reslice *createSelector* to directly create a
selector, and call it as such, then it behaves exactly as the Reselect
version.

```javascript
const getSomething = createSelector(
    (slice) => slice.data,
    (data) => data.something
    ) ;
...
const value = getSomething(someData) ;
```

<a name="getroot"></a>
API - Accessing the Entire Store
--------------------------------

If you need to access the entire store, ie., the root of the state
tree, then each slice exposes a method *getRoot*:

```javascript
const otherActions = {
    prefixNthTodo: function (nth, text) {
    	return this.todolist[nth].onChange(
    	    `${ this.getRoot().stuff.prefix }: ${ text }`
    	    ) ;
        },
    } ;
```

<a name="connect"></a>
Connecting Components to the Store
----------------------------------

The *createInjector* function described earlier can be used to wrap a
component so that it can be used inside React-Redux's *<Provider/>*
component, so that the top of the store hierarchy becomes the *slice*
prop to that component.

Suppose the we have a store which looks something like this, where
each of *person*, *job* and *residence* are handled by reducer functions
that have been bound using the Reslice binding functions:

```javascript
{ person: { title: 'Dr', firstname: 'Mike', lastname: 'Richardson' },
  job: { title: 'Programmer', company: 'Very Clever Co.' },
  residence: { address1: 'The House', address2: 'The Road', address3: 'Sometown' },
}
```

Then our top-level component, which receives the top of the store as
its *slice* prop might look as below, where it passes each part of the
store as the *slice* prop to child components that handle those
components:

```javascript
import React, { Component } from 'react' ;
import Person from './person' ;
import Job from './job' ;
import Residence from './residence' ;

class TopLevel extends Component {
    render () {
        const { person, job, residence } = this.props.slice ;
        return (
            <div>
              <Person slice={ person }/>
              <Job slice={ job }/>
              <Residence slice={ residence }/>
            </div>
            ) ;
        }
    }
```

Lets think about the *Person* component. Suppose we need to be
able to render the persons full name, but handling cases where any
of the title, etc., might be empty. A good way to do this is to
create a selecor function that handles this, and bind it to the
slice (this is rather contrived and overly simple, but hopefully
it illustrates the point). We also want actions to update the
values.

```javascript
import { createSelector, bindReducer } from 'reslice' ;

function _reducer (state = {}, action) {
    /**
     * The person reducer
    **/
    }
const actions = {
    setTitle: function (title) {
        return { type: 'SET_TITLE', title },
        },
    /**
     * ... and firstname and lastname ...
    **/
    } ;
const selectors = {
    getFullName: createSelector(
    	(slice) => slice.title,
    	(slice) => slice.firstname,
    	(slice) => slice.lastname,
    	(title, firstname, lastname) => {
    	    /**
    	     * Compute the full name
    	    **/
    	    return fullname ;
    	    })
    } ;

const reducer = bindReducer(_reducer, { actions, selectors }) ;
```

If we are going to implement *Person* to just display the data
statically (ie., not provide the user with any way to update it)
then it can be implemented as below. This has the advantage
that the component can access the *getFullName* selector without
worrying about where in the store its slice is located.

```javascript
import React, { Component } from 'react' ;

class Person extends Component {
    render () {
        const { title, firstname, lastname } = this.props.slice ;
        const fullname = this.props.slice.getFullName() ;
        return (
            <table>
              <tbody>
                <tr><td>Title</td><td>{ title }</td></tr>
                <tr><td>First Name</td><td>{ firstname }</td></tr>
                <tr><td>Last Name</td><td>{ lastname }</td></tr>
                <tr><td>Full Name</td><td>{ fullname }</td></tr>
              </tbody>
            </table>
            ) ;
        }
    }

export default Person ;
```

But, suppose that we'd like to implement this so that
title, etc., are passed as props to the component implementation
so that we don't need to worry about the slice inside it, and
so that the user can update values. Here we can use Reslice's
version of *connect*. Note that, provided that the correct slice
is passed to the component, it again does not matter where in
the store that slice is located.

```javascript
import React, { Component } from 'react' ;
import { connect } from 'reslice' ;

class Person extends Component {
    render () {
        const { title, firstname, lastname, fullname } = this.props ;
        const { setTitle, setFirstName, setLastName } = this.props ;
        return (
            <table>
              <tbody>
                <tr>
                  <td>
                    Title
                  </td>
                  <td>
                    <select onChange={ (e) => setTitle(e.target.value) }/>
                      <option value="Dr">Dr</option>
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Miss">Miss</option>
                    <select>
                  </td>
                </tr>
                <tr>
                  <td>
                    First Name
                  </td>
                  <td>
                    <input
                      value={ firstname }
                      onChange={ (e) => setFirstName(e.target.value) }
                      />
                  </td>
                </tr>
                <tr>
                  <td>
                    Last Name
                  </td>
                  <td>
                    <input
                      value={ lastname }
                      onChange={ (e) => setLastName(e.target.value} }
                      />
                  </td>
                </tr>
                <tr>
                  <td>
                    Full Name
                  </td>
                  <td>
                    { fullname }
                  </td>
                </tr>
              </tbody>
            </table>
            ) ;
        }
    }

function mapStateToProps (slice, props) {
    return {
        title: slice.title,
        firstname: slice.firstname,
        lastname: slice.lastname,
        fullname: slice.getFullName(),
        } ;
    }

function mapDispatchToProps (dispatch, slice, props) {
    return {
       setTitle: (value) => dispatch(slice.setTitle(value)),
       setFirstName: (value) => dispatch(slice.setFirstName(value)),
       setLastName: (value) => dispatch(slice.setLastName(value)),
       } ;
    }

export default connect(mapStateToProps)(Person) ;
```

Notice that when using Reslice's *connect* function, then the
mapping functions are passed the slice rather than the top of
store. If you do need to access the top of the store, use

```javascript
slice.getRoot()
```

<a name="testing"></a>
Testing Reslice Application Code
--------------------------------

Testing application code that uses Reslice is much the same as testing
any other code that uses Redux; you call action creators with whatever
arguments and verify that they behave correctly, and you call reducers
with state and actions and verify that the result is the correctly
altered state. However, with Reslice this is a bit more complicated
since (a) Reslice has wrapped the reducers and actions (and selectors) when
you use the *bindReducer* and other functions and (b) Reslice takes
care that actions aer only applied to "their" slices.

Some support function are included in the package to make this a little
easier. Some examples are shown below. These assume that you use
[Mocha](https://github.com/mochajs/mocha) as your framework and
[legacy Expect](https://github.com/mjackson/expect) or
[Facebook Expect](https://facebook.github.io/jest/docs/en/expect.html)
for assertions. The imports at the top of the test file would look something
like below; for brevity, these are omitted from the following examples.

```javascript
import { expect } ;
// Next import as appropriate
// import 'reslice/lib/expect-legacy' ;
// import 'reslice/lib/expect-facebook' ;
import { bindTestSlice } from 'reslice/lib/tests' ;
import { actions } from './ducks' ;
import * as selectors from './selectors' ;
```

*bindTestSlice* takes a slice data structure (typically an object, but it
could be an array) and binds it to a set of actions and selectors, just
as Reslice does. The example below does this, then calls the *makeWidget*
action creator and verifies the action. The *toEqualAction* assertion is
an extension to *expect*, which compares actions but effectively
ignores the slice tag in the camparison.

```javascript
const sliceData = {
    /**
     * Some data to test on ....
    **/
    } ;

describe ('something', () => {
    it ('should create a make widget action', () => {
        const slice = bindTestSlice(sliceData, { actions, selectors }) ;
        const action = slice.makeWidget(42) ;
        expect(action).toEqualAction({ type: 'MAKE_WIDGET', size: 42 }) ;
        }) ;
    }) ;
```

The underlying reducer functions can be tested exactly as for Redux,
since they are no more than Redux reducer functions. However, if you
want to test an entire store, it is a bit more tricky, since elements
in the contents of the store (returned by *store.getState()*) which
correspond to slices will have prototypes; this confuses *expect*'s
*toEqual* assertion. In this case, *toEqualObject* is other extension
to *expect* that will ignore all prototypes when comparing objects.

```javascript
const sliceData = {
    /**
     * Some data to test on ....
    **/
    } ;

describe ('something', () => {
    it ('should update the store', () => {
        const store = /* code to create the store */ ;
        expect(store.getState()).toEqualObject({ widgets: [] }) ;
        store.dispatch(store.getState().addWidget(42) ;
        expect(store.getState()).toEqualObject({ widgets: [{ size: 42}] }) ;
        }) ;
    }) ;
```

<a name="gotcha"></a>
The Gotcha
----------

There always is one. Not a massive one, but when not running in
production mode (ie., without *process.env.NODE_ENV* set to
*production*) then Redux will warn about the return value from a
reducer not being a plain Javascript object. This will not affect
execution but is anoying. The only way to avoid this is to tweak the
Redux code to change the appropriate checks from *isPlainObject*
to *isObject*.

