import { throttle } from 'throttle-debounce';

import EditorStyles from './components/editor-styles';

const { Component, Fragment } = wp.element;

export default class GhostKitGridWidePreview extends Component {
    constructor( ...args ) {
        super( ...args );

        this.state = {
            previewLeft: 0,
            previewRight: 0,
            previewAlign: false,
            previewSelector: (
                'ghostkit/grid' === this.props.name ? (
                    `[data-block="${ this.props.clientId }"] > .ghostkit-grid > .awb-gutenberg-preview-block`
                ) : (
                    `[data-block="${ this.props.clientId }"] > .awb-gutenberg-preview-block`
                )
            ),
        };

        this.updatePosition = throttle( 300, this.updatePosition.bind( this ) );
    }

    componentDidMount() {
        window.addEventListener( 'resize', this.updatePosition );
        this.updatePosition();
    }

    componentWillUnmount() {
        window.removeEventListener( 'resize', this.updatePosition );
    }

    updatePosition() {
        const {
            attributes,
        } = this.props;

        const {
            previewLeft,
            previewRight,
            previewSelector,
        } = this.state;

        const newState = {
            previewLeft: 0,
            previewRight: 0,
            previewAlign: attributes.awb_align,
        };

        if ( 'full' === attributes.awb_align ) {
            const $layout = document.querySelector( '.block-editor-block-list__layout' );
            const $parentBlock = document.querySelector( '.block-editor-block-list__layout .wp-block:not([data-align])' );
            const $preview = document.querySelector( previewSelector );

            if ( $layout && $parentBlock && $preview ) {
                const layoutRect = $layout.getBoundingClientRect();
                const parentRect = $parentBlock.getBoundingClientRect();
                const previewRect = $preview.getBoundingClientRect();

                if ( parentRect.left === previewRect.left - previewLeft ) {
                    newState.previewLeft = layoutRect.left - parentRect.left;
                }
                if ( parentRect.right === previewRect.right + previewRight ) {
                    newState.previewRight = parentRect.right - layoutRect.right;
                }
            }
        }

        this.setState( newState );
    }

    render() {
        const {
            attributes,
        } = this.props;

        const {
            previewLeft,
            previewRight,
            previewAlign,
            previewSelector,
        } = this.state;

        let AWBpreviewStyles = '';

        if ( attributes.awb_align && 'full' === attributes.awb_align ) {
            if ( previewAlign !== attributes.awb_align ) {
                this.updatePosition();
            }

            if ( previewLeft || previewRight ) {
                AWBpreviewStyles = `
                    ${ previewSelector } {
                        margin-left: ${ previewLeft }px;
                        margin-right: ${ previewRight }px;
                    }
                `;
            }
        }

        return (
            <Fragment>
                { AWBpreviewStyles ? (
                    <EditorStyles styles={ [ { css: AWBpreviewStyles } ] } />
                ) : '' }
                { this.props.children }
            </Fragment>
        );
    }
}
