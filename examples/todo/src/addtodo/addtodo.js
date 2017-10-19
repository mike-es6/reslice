import React, { Component } from 'react' ;

class AddTodo extends Component {

    onChange = (e) => {
        this.props.onChange (e.target.value) ;
        }

    onAddTodo = (e) => {
        this.props.onAddTodo () ;
        }

    render () {
        let { onAddTodo, text } = this.props ;
        return (
            <div>
                <input onChange={ this.onChange } value={ text } />
                <button onClick={ this.onAddTodo } >
                    Add Todo
                </button>
            </div>
            ) ;
        }
    }

export default AddTodo ;
