import React, { Component } from 'react' ;
import PropTypes from 'prop-types' ;

class Todo extends Component {

    onChange = (e) => {
        this.props.onChange (e.target.value) ;
        }

    onSetCompleted = (e) => {
        this.props.onSetCompleted (e.target.checked) ;
        }

    render () {
        const { text, completed } = this.props ;
        return (
            <li>
                <input value={ text } onChange={ this.onChange } disabled={ completed }/>
                <input type='checkbox' checked={ completed } onChange={ this.onSetCompleted }/>
            </li>
            ) ;
        }
    }

export default Todo ;
