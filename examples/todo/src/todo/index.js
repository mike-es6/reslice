import { connect } from 'reslice' ;
import { actions } from './ducks' ;
import Todo from './todo' ;


function mapStateToProps (slice) {
    return {
        text: slice.text,
        completed: slice.completed,
        } ;
    }

function mapDispatchToProps (dispatch, slice) {
    return {
        onChange: (text) => dispatch(slice.onChange(text)),
        onSetCompleted: (completed) => dispatch(slice.onSetCompleted(completed)),
        } ;
    }

export default connect(mapStateToProps, mapDispatchToProps)(Todo) ;
