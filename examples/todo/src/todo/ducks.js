import { bindReducer } from 'reslice' ;

const actions = {
    /**
     * Action to initialise a new toto with the specified text, and
     * initially marked as not completed.
    **/
    initialise: function (text) {
        return {
            type: 'INIT',
            text,
            completed: false,
            } ;
        },
    /**
     * Action to change the text. Note that the type value is just the
     * same as in the AddTodo actions, however reslice will ensure that
     * the action only applies to the correct reducer. Indeed, reslice
     * will also ensure that it only applies to the correct slice in
     * the state tree, so that multiple Todo slices can appear in the
     * state tree without risk of confusion.
    **/
    onChange: function (text) {
        return {
            type: 'CHANGE',
            text,
            } ;
        },
    /**
     * Action to set the completed state. Same points about reslice
     * distinguishing between multiple Todo slices as above.
    **/
    onSetCompleted: function (completed) {
        return {
            type: 'COMPLETED',
            completed
            } ;
        },
    } ;

/**
 * Todo slice reducer. As noted above, reslice will ensure that only
 * actions which are applicable to the particular slice in the state
 * tree are passed to the reducer.
**/
function _reducer (state = {}, action) {
    switch (action.type) {
        case 'INIT' :
            return { ...state, text: action.text, completed: action.completed } ;
        case 'CHANGE' :
            return { ...state, text: action.text } ;
        case 'COMPLETED' :
            return { ...state, completed: action.completed } ;
        case 'UPPERCASE' :
            return { ...state, text: state.text && state.text.toUpperCase() } ;
        default:
            break ;
        }
    return state ;
    }

export const reducer = bindReducer(
    _reducer,
    { actions }
    ) ;
