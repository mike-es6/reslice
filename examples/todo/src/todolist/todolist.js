import React, { Component } from 'react' ;
import PropTypes from 'prop-types' ;
import Todo from '../todo' ;

class TodoList extends Component {

    render () {
        const { todos, filter } = this.props ;
console.log("FILTER", filter) ;
        return (
            <ul>
                { todos.map((todo, index) => <Todo key={ index } slice={ todo } />) }
            </ul>
            ) ;
        }
    }

export default TodoList ;
