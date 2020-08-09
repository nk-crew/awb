// External Dependencies.
import deepAssign from 'deep-assign';
import shorthash from 'shorthash';
import classnames from 'classnames/dedupe';
import deepEqual from 'deep-equal';

const AWBData = window.AWBGutenbergData;

const { __ } = wp.i18n;

const {
    addFilter,
} = wp.hooks;

const {
    Component,
    Fragment,
} = wp.element;

const {
    createHigherOrderComponent,
} = wp.compose;

const { InspectorControls } = wp.blockEditor;

const {
    BaseControl,
    PanelBody,
    TextControl,
} = wp.components;

/**
 * Add support for core blocks.
 *
 * @param {String} name - block name.
 *
 * @return {Boolean} block supported.
 */
function isFallbackEnabled( name ) {
    return ! window.GHOSTKIT && name && /^nk\/awb/.test( name );
}

const cssPropsWithPixels = [ 'margin-left', 'margin-right', 'margin-top', 'margin-bottom', 'margin', 'padding-left', 'padding-right', 'padding-top', 'padding-bottom', 'padding' ];

/**
 * camelCaseToDash('userId') => "user-id"
 * camelCaseToDash('waitAMoment') => "wait-a-moment"
 * camelCaseToDash('TurboPascal') => "turbo-pascal"
 *
 * https://gist.github.com/youssman/745578062609e8acac9f
 *
 * @param {string} str - camel-cased string.
 * @return {string} - new dashed string.
 */
function camelCaseToDash( str ) {
    if ( 'string' !== typeof str ) {
        return str;
    }

    str = str.replace( /[a-z]([A-Z])+/g, ( m ) => `${ m[ 0 ] }-${ m.substring( 1 ) }` );

    return str && str.toLowerCase ? str.toLowerCase() : str;
}

/**
 * Get styles from object.
 *
 * @param {object} data - styles data.
 * @param {string} selector - current styles selector (useful for nested styles).
 * @return {string} - ready to use styles string.
 */
function getStyles( data = {}, selector = '' ) {
    const result = {};
    let resultCSS = '';

    // add styles.
    Object.keys( data ).forEach( ( key ) => {
        // object values.
        if ( null !== data[ key ] && 'object' === typeof data[ key ] ) {
            let nestedSelector = selector;
            if ( nestedSelector ) {
                nestedSelector = `${ nestedSelector } ${ key }`;
            } else {
                nestedSelector = key;
            }
            resultCSS += ( resultCSS ? ' ' : '' ) + getStyles( data[ key ], nestedSelector );

        // style properties and values.
        } else if ( 'undefined' !== typeof data[ key ] && false !== data[ key ] ) {
            if ( ! result[ selector ] ) {
                result[ selector ] = '';
            }
            const propName = camelCaseToDash( key );
            let propValue = data[ key ];

            // add pixels.
            if (
                ( 'number' === typeof propValue && 0 !== propValue && cssPropsWithPixels.includes( propName ) )
                || (typeof propValue === 'string' && /^[0-9.\-]*$/.test(propValue)) // eslint-disable-line
            ) {
                propValue += 'px';
            }

            result[ selector ] += ` ${ propName }: ${ propValue };`;
        }
    } );

    // add styles to selectors.
    Object.keys( result ).forEach( ( key ) => {
        resultCSS = `${ key } {${ result[ key ] } }${ resultCSS ? ` ${ resultCSS }` : '' }`;
    } );

    return resultCSS;
}

/**
 * Get styles attribute.
 *
 * @param {object} data - styles data.
 * @return {string} - data attribute with styles.
 */
function getCustomStylesAttr( data = {} ) {
    return {
        'data-ghostkit-styles': getStyles( data ),
    };
}

/**
 * Extend ghostkit block attributes with spacings.
 *
 * @param {Object} settings Original block settings.
 * @param {String} name Original block name.
 *
 * @return {Object} Filtered block settings.
 */
function addAttribute( settings, name ) {
    const allow = isFallbackEnabled( name );

    if ( allow ) {
        if ( ! settings.attributes.ghostkitStyles ) {
            settings.attributes.ghostkitStyles = {
                type: 'object',
                default: '',
            };
        }
        if ( ! settings.attributes.ghostkitClassname ) {
            settings.attributes.ghostkitClassname = {
                type: 'string',
                default: '',
            };
        }
        if ( ! settings.attributes.ghostkitId ) {
            settings.attributes.ghostkitId = {
                type: 'string',
                default: '',
            };
        }
        if ( ! settings.attributes.ghostkitSpacings ) {
            settings.attributes.ghostkitSpacings = {
                type: 'object',
                default: {},
            };
        }
    }
    return settings;
}

/**
 * List of used IDs to prevent duplicates.
 *
 * @type {Object}
 */
const usedIds = {};

/**
 * Override the default edit UI to include a new block inspector control for
 * assigning the custom spacings if needed.
 *
 * @param {function|Component} BlockEdit Original component.
 *
 * @return {string} Wrapped component.
 */
const withInspectorControl = createHigherOrderComponent( ( OriginalComponent ) => {
    class GhostkitSpacingsFallback extends Component {
        constructor( ...args ) {
            super( ...args );

            this.onUpdate = this.onUpdate.bind( this );
            this.updateSpacings = this.updateSpacings.bind( this );
            this.getCurrentSpacing = this.getCurrentSpacing.bind( this );

            if ( ! isFallbackEnabled( this.props.name ) ) {
                return;
            }

            // add new ghostkit props.
            if ( this.props.clientId && 'undefined' !== typeof this.props.attributes.ghostkitId ) {
                let ID = this.props.attributes.ghostkitId || '';

                // check if ID already exist.
                let tryCount = 10;
                while ( ! ID || ( 'undefined' !== typeof usedIds[ ID ] && usedIds[ ID ] !== this.props.clientId && 0 < tryCount ) ) {
                    ID = shorthash.unique( this.props.clientId );
                    tryCount -= 1;
                }

                if ( ID && 'undefined' === typeof usedIds[ ID ] ) {
                    usedIds[ ID ] = this.props.clientId;
                }

                if ( ID !== this.props.attributes.ghostkitId ) {
                    this.props.attributes.ghostkitId = ID;
                    this.props.attributes.ghostkitClassname = `${ this.props.name.replace( '/', '-' ) }-${ ID }`;
                }

                // force update when new ID.
                if ( 10 > tryCount ) {
                    this.onUpdate( false );
                }
            }
        }

        componentDidMount() {
            this.onUpdate();
        }

        componentDidUpdate() {
            this.onUpdate();
        }

        onUpdate( useSetAttributes = true ) {
            const {
                setAttributes,
                attributes,
            } = this.props;

            if ( ! isFallbackEnabled( this.props.name ) ) {
                return;
            }

            const {
                ghostkitSpacings = {},
                ghostkitClassname,
            } = attributes;

            if ( ghostkitClassname ) {
                const customStyles = {};

                if ( ghostkitSpacings && Object.keys( ghostkitSpacings ).length ) {
                    customStyles[ `.${ ghostkitClassname }` ] = ghostkitSpacings;
                }

                if ( ! deepEqual( attributes.ghostkitStyles, customStyles ) ) {
                    if ( useSetAttributes ) {
                        setAttributes( { ghostkitStyles: customStyles } );
                    } else {
                        this.props.attributes.ghostkitStyles = customStyles;
                    }
                }
            }
        }

        /**
         * Get current spacing for selected device type.
         *
         * @param {String} name - name of spacing.
         *
         * @returns {String} spacing value.
         */
        getCurrentSpacing( name ) {
            const { ghostkitSpacings = {} } = this.props.attributes;

            if ( ghostkitSpacings[ name ] ) {
                return ghostkitSpacings[ name ];
            }

            return '';
        }

        /**
         * Update spacings object.
         *
         * @param {String} name - name of new spacing.
         * @param {String} val - value for new spacing.
         */
        updateSpacings( name, val ) {
            const { setAttributes } = this.props;
            let { ghostkitSpacings = {} } = this.props.attributes;
            const result = {};
            const newSpacings = {};

            newSpacings[ name ] = val;

            // add default properties to keep sorting.
            ghostkitSpacings = deepAssign( {}, ghostkitSpacings, newSpacings );

            // validate values.
            Object.keys( ghostkitSpacings ).forEach( ( key ) => {
                if ( ghostkitSpacings[ key ] ) {
                    // device object supported bu GhostKit plugin only.
                    if ( 'object' !== typeof ghostkitSpacings[ key ] ) {
                        result[ key ] = ghostkitSpacings[ key ];
                    }
                }
            } );

            setAttributes( {
                ghostkitSpacings: result,
            } );
        }

        render() {
            const { props } = this;
            const {
                attributes,
            } = this.props;

            const allow = isFallbackEnabled( props.name );

            if ( ! allow ) {
                return <OriginalComponent { ...props } />;
            }

            // add new spacings controls.
            return (
                <Fragment>
                    <OriginalComponent
                        { ...props }
                        { ...this.state }
                        setState={ this.setState }
                    />
                    { attributes.ghostkitClassname && attributes.ghostkitStyles && Object.keys( attributes.ghostkitStyles ).length ? (
                        <style>{ getStyles( attributes.ghostkitStyles ) }</style>
                    ) : '' }
                    <InspectorControls>
                        <PanelBody
                            title={ __( 'Spacings' ) }
                            initialOpen={ false }
                        >
                            <BaseControl className="awb-ghostkit-control-spacing">
                                <div className="awb-ghostkit-control-spacing-margin">
                                    <span>{ __( 'Margin' ) }</span>
                                    <div className="awb-ghostkit-control-spacing-margin-left">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'marginLeft' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'marginLeft', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-margin-top">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'marginTop' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'marginTop', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-margin-right">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'marginRight' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'marginRight', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-margin-bottom">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'marginBottom' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'marginBottom', val ) }
                                        />
                                    </div>
                                </div>
                                <div className="awb-ghostkit-control-spacing-padding">
                                    <span>{ __( 'Padding' ) }</span>
                                    <div className="awb-ghostkit-control-spacing-padding-left">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'paddingLeft' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'paddingLeft', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-padding-top">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'paddingTop' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'paddingTop', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-padding-right">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'paddingRight' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'paddingRight', val ) }
                                        />
                                    </div>
                                    <div className="awb-ghostkit-control-spacing-padding-bottom">
                                        <TextControl
                                            value={ this.getCurrentSpacing( 'paddingBottom' ) }
                                            placeholder="-"
                                            onChange={ ( val ) => this.updateSpacings( 'paddingBottom', val ) }
                                        />
                                    </div>
                                </div>
                            </BaseControl>
                            <p>
                                <em>
                                    { __( 'More spacing options available in GhostKit plugin ' ) }
                                    <a href="https://wordpress.org/plugins/ghostkit/" target="_blank" rel="noopener noreferrer">https://wordpress.org/plugins/ghostkit/</a>
                                </em>
                            </p>
                        </PanelBody>
                    </InspectorControls>
                </Fragment>
            );
        }
    }

    return GhostkitSpacingsFallback;
}, 'withInspectorControl' );

/**
 * Override props assigned to save component to inject custom styles.
 * This is only applied if the block's save result is an
 * element and not a markup string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
function addSaveProps( extraProps, blockType, attributes ) {
    if ( ! isFallbackEnabled( blockType.name ) ) {
        return extraProps;
    }

    const customStyles = attributes.ghostkitStyles ? ( { ...attributes.ghostkitStyles } ) : false;

    if ( customStyles && 0 !== Object.keys( customStyles ).length ) {
        extraProps = Object.assign( extraProps || {}, getCustomStylesAttr( customStyles ) );

        if ( attributes.ghostkitClassname ) {
            extraProps.className = classnames( extraProps.className, attributes.ghostkitClassname );
        }
    }

    return extraProps;
}

// enable only if GhostKit is not installed.
if ( ! AWBData.is_ghostkit_active ) {
    // Init filters.
    addFilter( 'blocks.registerBlockType', 'awb/ghostkit/spacings/additional-attributes', addAttribute );
    addFilter( 'editor.BlockEdit', 'awb/ghostkit/spacings/additional-attributes', withInspectorControl );
    addFilter( 'blocks.getSaveContent.extraProps', 'awb/ghostkit/styles/save-props', addSaveProps );
}
