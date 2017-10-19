import { mappedReducer, createSelector } from 'reslice' ;
import { reducer as todoReducer } from '../todo/ducks' ;

export const actions = {
    /**
     * Action to add a new Todo to the list, given the specified
     * text.
    **/
    add: function (text) {
        return {
            type: 'ADD',
            text
            } ;
        },
    } ;

/**
 * This is the actual reducer for the TodoList. This manages a dynamic
 * set of child slices, each of which is handled by the same reducer
 * function; in this case the set is stored as an array. The third
 * argument is a function "reducerForKey" which is called to get the
 * particular instance of the child reducer for a given key, in this case
 * the array index. See the "mappedReducer" call below for more details.
**/
function _todos (state = [], action, reducerForKey) {
    /**
     * If the action is ADD then create and append a new slice to the
     * current state. "reducerForKey" is here called with two arguments,
     * the key and a function that should return an action to initialise
     * the new slice; this is a special case used to create the new slice.
    **/
    if (action.type === 'ADD') {
        const key     = state.length ;
        const datum   = reducerForKey(key, (slice) => slice.initialise(action.text)) ;
        return state.concat(datum) ;
        }

    /**
     * Normal case is to reduce each child through its corresponding
     * reducer, as returned by "reducerForKey" called with just the key.
    **/
    return state.map((todo, index) => reducerForKey(index)(todo, action)) ;
    }


const selectors = {
    getFiltered: createSelector (
        (slice, props) => slice,
        (slice, props) => props.filter,
        (todos, filter) => {
            switch (filter) {
                case 'SHOW_ACTIVE' :
                    return todos.filter((t) => !t.completed) ;
                case 'SHOW_COMPLETED' :
                    return todos.filter((t) =>  t.completed) ;
                default :
                    break ;
                }
            return todos ;
            }
        ),
    } ;

/**
 * Bind the reducer. The "mappedReducer" is called with the reducer function
 * as the first argument, and the reducer function for the children as the
 * second argument. The selectors and actions are then added.
**/
export const reducer = mappedReducer (_todos, todoReducer, { selectors, actions }) ;
