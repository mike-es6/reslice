import { bindReducer } from 'reslice' ;

const actions = {

    setVisibilityFilter: function (filter) {
        return {
            type: 'SET_FILTER',
            filter
            } ;
        },

    onUpperCase: function () {
        return this.globalAction({ type: 'UPPERCASE' }) ;
        },
    } ;

function _reducer (state = {}, action) {
    switch (action.type) {
        case 'SET_FILTER' :
            return { ...state, filter: action.filter } ;
        default:
            break ;
        }
    return state ;
    }

const selectors = {
    getFilter: (slice) => slice.filter,
    } ;

export const reducer = bindReducer(
    _reducer,
    { selectors, actions }
    ) ;
