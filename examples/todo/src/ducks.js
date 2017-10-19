import { combineReducers } from 'reslice' ;
import { reducer as todolistReducer } from './todolist/ducks' ;
import { reducer as addtotoReducer } from './addtodo/ducks' ;
import { reducer as footerReducer } from './footer/ducks' ;

const actions = {
    /**
     * Add a new todo. Use a thunk so that we can dispatch two actions.
     * The first is the actual add-a-todo action which is exposed as an
     * action creator on the addtodo slice of the store (using the text
     * also available from that slice); the second clears the todo
     * entry. Assuming that both actions return objects (and not thunks)
     * the we could use a redux action batcher.
    **/
    onAddTodo: function () {
        return function (dispatch, getSlice) {
            let slice = getSlice() ;
            dispatch(slice.todolist.add(slice.addtodo.text)) ;
            dispatch(slice.addtodo.clear()) ;
            } ;
        },
    } ;

/**
 * Create the combined reducer. This is the reslice function, which is
 * also passed selectors and action creators, which will be bound to the
 * object in the state tree. Only actions here, no selectors.
**/
export const reducer = combineReducers ({
    todolist: todolistReducer,
    addtodo: addtotoReducer,
    footer: footerReducer,
    },
    { actions }
    ) ;

