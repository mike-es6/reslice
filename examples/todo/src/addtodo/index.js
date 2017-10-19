import { connect } from 'reslice' ;
import AddTodo from './addtodo' ;

function mapStateToProps (slice) {
    return {
        text: slice.text,
        } ;
    }

function mapDispatchToProps (dispatch, slice) {
    return {
        onChange: (text) => dispatch(slice.onChange(text)),
        } ;
    }

export default connect(mapStateToProps, mapDispatchToProps)(AddTodo) ;

