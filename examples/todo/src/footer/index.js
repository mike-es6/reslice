import { connect } from 'reslice' ;
import Footer from './footer' ;

function mapStateToProps (slice) {
    return {
        } ;
    }

function mapDispatchToProps (dispatch, slice) {
    return {
        setVisibilityFilter: (filter) => dispatch(slice.setVisibilityFilter(filter)),
        onUpperCase: () => dispatch(slice.onUpperCase()),
        } ;
    }

export default connect(mapStateToProps, mapDispatchToProps)(Footer) ;

