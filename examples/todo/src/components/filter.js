import React, { Component } from 'react' ;
import PropTypes from 'prop-types' ;

class Link extends Component {

    onClick = () => {
        this.props.onClick(this.props.filter) ;
        }

    render () {
        const { active, children } = this.props ;

//        if (active)
//            return <span>{ children }</span> ;

        return (
            <a href="#" onClick={ this.onClick }>
                { children }
            </a>
            ) ;
        }
    }

Link.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    filter: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
    } ;

export default Link ;
