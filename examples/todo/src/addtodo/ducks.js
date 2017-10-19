import { bindReducer } from 'reslice' ;

const actions = {
    /**
     * Action used when the text being entered for the todo to be
     * added is changed. Note that we don't need to worry about the
     * action type being unique over all reducers, reslice will tag
     * the action so that it is only applied to the reducer.
    **/
    onChange: function (text) {
        return {
            type: 'CHANGE',
            text: text,
            }
        },
    /**
     * Simular action to clear the text, used after a todo has been
     * added.
    **/
    clear: function (text) {
        return {
            type: 'CHANGE',
            text: '',
            }
        },
    } ;

/**
 * AddTodo reducer. The reducer will only be invoked for actions
 * that are bound to this reducer.
**/
function _reducer (state = { text: '' }, action) {
    switch (action.type) {
        case 'CHANGE' :
            return { ...state, text: action.text } ;
        default:
            break ;
        }
    return state ;
    }

/**
 * Bind the actions and selectors (none in this case) to the reducer
 * function, so that they are exposed on the slice in the state tree.
**/
export const reducer = bindReducer(
    _reducer,
    { actions }
    ) ;
