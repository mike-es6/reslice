import { connect } from 'reslice' ;
import TodoList from './todolist' ;


function mapStateToProps (slice, props) {
    return {
        todos: slice.getFiltered (props),
        } ;
    }


export default connect(mapStateToProps, null)(TodoList) ;
