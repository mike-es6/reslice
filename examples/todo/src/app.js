import React, { Component } from 'react' ;
import { connect } from 'reslice' ;

import Footer from './footer' ;
import AddTodo from './addtodo' ;
import TodoList from './todolist' ;

/**
 * Top-level component. Embeds the AddTodo, TodoList and Footer
 * (application) components. These are each passed their slice of
 * the tree. Note that this requires the top-level of the store
 * to have been correctly constructed (in ducks.js).
**/
class App extends Component {

    onAddTodo = () => {
        this.props.onAddTodo () ;
        }

    render () {
        let { slice, filter } = this.props ;
        return (
            <div>
                <AddTodo slice={ slice.addtodo } onAddTodo={ this.onAddTodo }/>
                <TodoList slice={ slice.todolist } filter={ filter }/>
                <Footer slice={ slice.footer } />
            </div>
            ) ;
        }
    }

/**
 * Map in state props. This being reslice, the slice is the argument,
 * rather than the entire state tree. The currently selected filter is
 * required, which is exposed via a selector function on the footer
 * slice of the state tree.
**/
function mapStateToProps (slice) {
    return {
        filter: slice.footer.getFilter(),
        } ;
    }

/**
 * Map in dispatcher props, here for the onAddTodo action. This is
 * mapped to an action which is exposed as a method on the Apps
 * slice (which is the slice argument to the function).
**/
function mapDispatchToProps (dispatch, slice) {
    return {
        onAddTodo: () => dispatch(slice.onAddTodo()),
        } ;
    }

export default connect(mapStateToProps, mapDispatchToProps)(App) ;
