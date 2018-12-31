import classnames from 'classnames/dedupe';
import {
    BlockEditWithSelect,
    BlockSave,
    renderEditorPreview,
    settings,
} from './block.jsx';

const AWBData = window.AWBGutenbergData;

const {
    addFilter,
} = wp.hooks;

const {
    PanelBody,
    Toolbar,
    BaseControl,
} = wp.components;

const { hasBlockSupport } = wp.blocks;

const {
    BlockAlignmentToolbar,
} = wp.editor;

const validAlignments = [ 'full' ];

const { __ } = wp.i18n;

/**
 * Filters registered block settings, extending attributes to include `fullheight`.
 *
 * @param  {Object} blockSettings Original block settings
 * @return {Object}               Filtered block settings
 */
export function addAttribute( blockSettings ) {
    if (
        blockSettings.name === 'ghostkit/grid' ||
        blockSettings.name === 'ghostkit/grid-column'
    ) {
        blockSettings.supports.awb = true;
    }

    let allow = false;

    if ( hasBlockSupport( blockSettings, 'awb', false ) ) {
        allow = true;
    }

    if ( allow ) {
        Object.keys( settings.attributes ).forEach( ( name ) => {
            blockSettings.attributes[ 'awb_' + name ] = settings.attributes[ name ];
        } );
        blockSettings.attributes.awb_align = {
            type: 'string',
            default: '',
        };
    }

    return blockSettings;
}

function prepareAWBprops( props ) {
    const awbAttributes = {};
    Object.keys( settings.attributes ).forEach( ( name ) => {
        awbAttributes[ name ] = props.attributes[ 'awb_' + name ];
    } );
    awbAttributes.align = props.attributes[ 'awb_align' ];

    return {
        name: 'nk/awb',
        setAttributes( data ) {
            const newData = {};

            Object.keys( data ).forEach( ( name ) => {
                newData[ 'awb_' + name ] = data[ name ];
            } );

            props.setAttributes( newData );
        },
        attributes: awbAttributes,
        className: '',
        innerBlocks: [],
    };
}

/**
 * Override the default edit UI to include background preview.
 *
 * @param {Object} background background JSX.
 * @param {Object} props additional props.
 *
 * @return {Object} Control.
 */
function addEditorBackground( background, props ) {
    if ( hasBlockSupport( props.name, 'awb', false ) ) {
        const awbProps = prepareAWBprops( props );
        return renderEditorPreview( awbProps );
    }

    return background;
}

/**
 * Override background control to add AWB settings
 *
 * @param {Object} Control JSX control.
 * @param {Object} props additional props.
 *
 * @return {Object} Control.
 */
function addBackgroundControls( Control, props ) {
    if ( 'background' === props.attribute && hasBlockSupport( props.props.name, 'awb', false ) ) {
        const awbProps = prepareAWBprops( props.props );

        return (
            <PanelBody
                title={ __( 'Background' ) }
                initialOpen={ false }
            >
                <BlockEditWithSelect
                    { ...awbProps }
                    inspectorControlsOnly={ true }
                />
                <PanelBody>
                    <BaseControl
                        label={ __( 'Full width background' ) }
                    >
                        { AWBData.full_width_fallback ? (
                            /* Fallback for align full */
                            <Toolbar controls={ [
                                {
                                    icon: 'align-full-width',
                                    title: __( 'Full Width' ),
                                    onClick: () => awbProps.setAttributes( { align: awbProps.attributes.align === 'full' ? '' : 'full' } ),
                                    isActive: awbProps.attributes.align === 'full',
                                },
                            ] }
                            />
                        ) : (
                            <BlockAlignmentToolbar
                                controls={ validAlignments }
                                value={ awbProps.attributes.align }
                                onChange={ v => awbProps.setAttributes( { align: v } ) }
                            />
                        ) }
                    </BaseControl>
                </PanelBody>
            </PanelBody>
        );
    }

    return Control;
}

/**
 * Add SVG gradient for FontAwesome
 *
 * @param {Object} background Background jsx.
 * @param {Object} props  Block properties.
 *
 * @return {Object} Filtered props applied to save element.
 */
function addSaveBackground( background, props ) {
    if ( hasBlockSupport( props.name, 'awb', false ) ) {
        const awbProps = prepareAWBprops( {
            attributes: props.attributes,
            saveAttributes: () => {},
        } );
        let addBackground = false;

        if ( awbProps.attributes.type === 'color' && awbProps.attributes.color ) {
            addBackground = true;
        }

        if (
            awbProps.attributes.type === 'image' &&
            (
                awbProps.attributes.color ||
                awbProps.attributes.imageTag
            )
        ) {
            addBackground = true;
        }

        if (
            awbProps.attributes.type === 'video' &&
            (
                awbProps.attributes.color ||
                awbProps.attributes.videoMp4 ||
                awbProps.attributes.videoOgv ||
                awbProps.attributes.videoWebm ||
                awbProps.attributes.imageTag
            )
        ) {
            addBackground = true;
        }

        if (
            awbProps.attributes.type === 'yt_vm_video' &&
            (
                awbProps.attributes.color ||
                awbProps.attributes.video ||
                awbProps.attributes.imageTag
            )
        ) {
            addBackground = true;
        }

        if ( addBackground ) {
            const className = classnames( 'nk-awb', awbProps.attributes.align ? `align${ awbProps.attributes.align }` : '' );
            return (
                <div className={ className }>
                    <BlockSave
                        { ...awbProps }
                        backgroundHTMLOnly={ true }
                    />
                </div>
            );
        }

        return '';
    }

    return background;
}

addFilter( 'blocks.registerBlockType', 'ghostkit-pro/grid/additional-attributes', addAttribute );
addFilter( 'ghostkit.editor.controls', 'ghostkit-pro/grid/addBackgroundControls', addBackgroundControls );
addFilter( 'ghostkit.editor.grid.background', 'ghostkit-pro/grid/addEditorBackground', addEditorBackground );
addFilter( 'ghostkit.editor.grid-column.background', 'ghostkit-pro/grid-column/addEditorBackground', addEditorBackground );
addFilter( 'ghostkit.blocks.grid.background', 'ghostkit-pro/grid/addSaveBackground', addSaveBackground );
addFilter( 'ghostkit.blocks.grid-column.background', 'ghostkit-pro/grid-column/addSaveBackground', addSaveBackground );
