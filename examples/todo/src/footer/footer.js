import React, { Component } from 'react' ;
import Filter from '../components/filter' ;

class Footer extends Component {

    onClick = (filter) => {
        this.props.setVisibilityFilter(filter) ;
        }

    onUpperCase = () => {
        this.props.onUpperCase() ;
        }

    render () {
        return (
            <p>
                Show:
                {' '}
                <Filter onClick={ this.onClick } filter="SHOW_ALL" >
                    All
                </Filter>
                {', '}
                <Filter onClick={ this.onClick } filter="SHOW_ACTIVE" >
                    Active
                </Filter>
                {', '}
                <Filter onClick={ this.onClick } filter="SHOW_COMPLETED" >
                    Completed
                </Filter>
                &nbsp;
                <button onClick={ this.onUpperCase }>
                    Upper Case All
                </button>
            </p>
            ) ;
        }
    }

export default Footer ;
