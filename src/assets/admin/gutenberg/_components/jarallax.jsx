import classnames from 'classnames/dedupe';

/**
 * WordPress Dependencies
 */
const {
    Component,
    createRef,
} = wp.element;

/**
 * Local Dependencies
 */
const {
    jarallax,
} = window;

/**
 * Component
 */
class Jarallax extends Component {
    constructor( props ) {
        super( props );

        this.$el = createRef();
    }

    // init on mount.
    componentDidMount() {
        jarallax( this.$el.current, this.props.options );
    }

    // reinit when props changed.
    componentDidUpdate( prevProps ) {
        if ( ! this.isDestroyed && this.$el.current && JSON.stringify( prevProps ) !== JSON.stringify( this.props ) ) {
            jarallax( this.$el.current, 'destroy' );
            jarallax( this.$el.current, this.props.options );
        }
    }

    // destroy on unmount.
    componentWillUnmount() {
        this.isDestroyed = true;
        if ( this.$el.current ) {
            jarallax( this.$el.current, 'destroy' );
        }
    }

    render() {
        const {
            previewHTML,
            className = '',
        } = this.props;

        return (
            <div
                className={ classnames( 'jarallax', className ) }
                ref={ this.$el }
                dangerouslySetInnerHTML={ {
                    __html: previewHTML,
                } }
            />
        );
    }
}

export default Jarallax;
