import VideoWorker from 'video-worker';
import classnames from 'classnames/dedupe';

import metadata from './block.json';
import { maybeEncode, maybeDecode } from './utils/encode-decode';
import ColorPicker from './components/color-picker';
import FocalPointPicker from './components/focal-point-picker';
import EditorStyles from './components/editor-styles';
import Jarallax from './components/jarallax';
import iconAWB from './icons/awb.svg';
import iconFullHeight from './icons/fullheight.svg';
import iconVerticalCenter from './icons/vertical-center.svg';
import iconVerticalTop from './icons/vertical-top.svg';
import iconVerticalBottom from './icons/vertical-bottom.svg';
import iconFullHeightWhite from './icons/fullheight-white.svg';
import iconVerticalCenterWhite from './icons/vertical-center-white.svg';
import iconVerticalTopWhite from './icons/vertical-top-white.svg';
import iconVerticalBottomWhite from './icons/vertical-bottom-white.svg';

// eslint-disable-next-line no-underscore-dangle
if ( ! global._babelPolyfill ) {
    // eslint-disable-next-line global-require
    require( 'babel-polyfill' );
}

/**
 * Gutenberg block
 */
const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;

const AWBData = window.AWBGutenbergData;

const {
    InspectorControls,
    InnerBlocks,
    MediaUpload,
    BlockControls,
    BlockAlignmentToolbar,
} = wp.blockEditor;

const {
    Button,
    ButtonGroup,
    PanelBody,
    SelectControl,
    ToggleControl,
    TextControl,
    RangeControl,
    ToolbarGroup,
    ToolbarButton,
    ToolbarItem,
    ColorIndicator,
} = wp.components;

const { apiFetch } = wp;
const {
    registerStore,
    withSelect,
} = wp.data;

const validAlignments = [ 'full', 'wide' ];

/**
 * Get icon for toolbar.
 *
 * @param {Function} Svg - icon.
 * @return {Object} - result svg.
 */
function getToolbarIcon( Svg ) {
    return <Svg viewBox="0 0 24 24" />;
}

/**
 * camelCaseToDash('userId') => "user-id"
 * camelCaseToDash('waitAMoment') => "wait-a-moment"
 * camelCaseToDash('TurboPascal') => "turbo-pascal"
 *
 * https://gist.github.com/youssman/745578062609e8acac9f
 *
 * @param {String} str - camel case string
 * @return {String} - dash string.
 */
function camelCaseToDash( str ) {
    if ( 'string' !== typeof str ) {
        return str;
    }

    str = str.replace( /[a-z]([A-Z])+/g, ( m ) => `${ m[ 0 ] }-${ m.substring( 1 ) }` );

    return str.toLowerCase();
}

/**
 * Convert string to title case
 * https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 *
 * @param {String} str - string to convert
 * @return {String} - title case string.
 */
function toTitleCase( str ) {
    return str.split( /[.,/ \-_]/ ).map( ( word ) => (
        word && word.length ? word.replace( word[ 0 ], word[ 0 ].toUpperCase() ) : word
    ) ).join( ' ' );
}

/**
 * Change attributes to data-attributes.
 * Example:
 * parallaxSpeed --> data-awb-parallax-speed
 *
 * @param {Object} attributes - block attributes.
 * @return {Object} - data attributes.
 */
function getDataAttributes( attributes ) {
    const retult = {};
    Object.keys( attributes ).forEach( ( k ) => {
        retult[ `data-awb-${ camelCaseToDash( k ) }` ] = attributes[ k ];
    } );
    return retult;
}

/**
 * Select image
 *
 * @param {Object} media - media data.
 * @param {Function} setAttributes - function to set attributes on the block.
 */
function onImageSelect( media, setAttributes ) {
    setAttributes( {
        image: '',
        imageSizes: '',
    } );

    wp.media.attachment( media.id ).fetch().then( ( data ) => {
        if ( data && data.sizes ) {
            const { url } = data.sizes[ 'post-thumbnail' ] || data.sizes.medium || data.sizes.medium_large || data.sizes.full;
            if ( url ) {
                setAttributes( {
                    image: media.id,
                    imageSizes: data.sizes,
                } );
            }
        }
    } );
}

const videoPosterCache = {};
let videoPosterTimeout;

/**
 * Load YouTube / Vimeo poster image
 *
 * @param {String} url - video URL.
 * @param {Function} cb - load callback with result.
 */
function getVideoPoster( url, cb ) {
    if ( videoPosterCache[ url ] ) {
        cb( videoPosterCache[ url ] );
        return;
    }

    clearTimeout( videoPosterTimeout );
    videoPosterTimeout = setTimeout( () => {
        const videoObject = new VideoWorker( url );

        if ( videoObject.isValid() ) {
            videoObject.getImageURL( ( videoPosterUrl ) => {
                videoPosterCache[ url ] = videoPosterUrl;
                cb( videoPosterUrl );
            } );
        } else {
            cb( '' );
        }
    }, 500 );
}

export class BlockSave extends Component {
    constructor( ...args ) {
        super( ...args );

        // inside exported xml file almost all symbols are escaped.
        const { imageTag } = this.props.attributes;
        if ( imageTag && /^u003c/g.test( imageTag ) ) {
            this.props.attributes.imageTag = imageTag
                .replace( /u003c/g, '<' )
                .replace( /u003e/g, '>' )
                .replace( /u0022/g, '"' )
                .replace( /u0026/g, '&' );
        }
    }

    render() {
        const {
            attributes,
            backgroundHTMLOnly,
        } = this.props;
        let {
            className,
        } = this.props;

        const resultAtts = {
            type: attributes.type,
        };
        let resultImg = false;
        let { video } = attributes;

        className = classnames( 'nk-awb', className, attributes.align ? ` align${ attributes.align }` : '' );

        // add full height classname.
        if ( attributes.fullHeight ) {
            className = classnames( className, 'nk-awb-fullheight', attributes.fullHeightAlign ? `nk-awb-content-valign-${ attributes.fullHeightAlign }` : '' );
        }

        switch ( attributes.type ) {
        case 'color':
            break;
        case 'video':
            video = '';
            if ( attributes.videoMp4 ) {
                video += `mp4:${ attributes.videoMp4 }`;
            }
            if ( attributes.videoOgv ) {
                video += `${ video ? ',' : '' }ogv:${ attributes.videoOgv }`;
            }
            if ( attributes.videoWebm ) {
                video += `${ video ? ',' : '' }webm:${ attributes.videoWebm }`;
            }
        // eslint-disable-next-line
        case 'yt_vm_video':
            if ( video ) {
                resultAtts.video = video;
                if ( attributes.videoStartTime ) {
                    resultAtts.videoStartTime = attributes.videoStartTime;
                }
                if ( attributes.videoEndTime ) {
                    resultAtts.videoEndTime = attributes.videoEndTime;
                }
                if ( attributes.videoVolume ) {
                    resultAtts.videoVolume = attributes.videoVolume;
                }
                if ( ! attributes.videoLoop ) {
                    resultAtts.videoLoop = attributes.videoLoop;
                }
                if ( attributes.videoAlwaysPlay ) {
                    resultAtts.videoAlwaysPlay = attributes.videoAlwaysPlay;
                }
                resultAtts.videoMobile = attributes.videoMobile;
            }
        // eslint-disable-next-line
        case 'image':
            if ( attributes.imageTag ) {
                resultImg = attributes.imageTag;
                if ( attributes.imageBackgroundSize ) {
                    resultAtts.imageBackgroundSize = attributes.imageBackgroundSize;
                }
                if ( attributes.imageBackgroundPosition ) {
                    resultAtts.imageBackgroundPosition = attributes.imageBackgroundPosition;
                }
            }
            break;
        default:
            break;
        }

        if ( attributes.parallax ) {
            resultAtts.parallax = attributes.parallax;
            if ( attributes.parallaxSpeed ) {
                resultAtts.parallaxSpeed = attributes.parallaxSpeed;
            }
            resultAtts.parallaxMobile = attributes.parallaxMobile;
        }

        if ( attributes.mouseParallax ) {
            resultAtts.mouseParallax = attributes.mouseParallax;
            if ( attributes.mouseParallaxSize ) {
                resultAtts.mouseParallaxSize = attributes.mouseParallaxSize;
            }
            if ( attributes.mouseParallaxSpeed ) {
                resultAtts.mouseParallaxSpeed = attributes.mouseParallaxSpeed;
            }
        }

        // Fix style tag background.
        if ( resultImg ) {
            resultImg = maybeDecode( resultImg );

            resultImg = resultImg.replace( 'url(&quot;', 'url(\'' );
            resultImg = resultImg.replace( '&quot;);', '\');' );
        }

        // awb wrap inner html
        let wrapHTML = '';
        if ( attributes.color ) {
            wrapHTML += `<div class="nk-awb-overlay" style="background-color: ${ attributes.color };"></div>`;
        }
        if ( resultImg || resultAtts.video ) {
            wrapHTML += `<div class="nk-awb-inner">${ resultImg || '' }</div>`;
        }
        // eslint-disable-next-line react/no-danger
        wrapHTML = wrapHTML ? <div className="nk-awb-wrap" { ...getDataAttributes( resultAtts ) } dangerouslySetInnerHTML={ { __html: wrapHTML } } /> : '';

        // return background block only
        // used in GhostKit extension
        if ( backgroundHTMLOnly ) {
            return wrapHTML;
        }

        return (
            <div className={ className }>
                { wrapHTML }
                <InnerBlocks.Content />
            </div>
        );
    }
}

const actions = {
    apiFetch( request ) {
        return {
            type: 'API_FETCH',
            request,
        };
    },
    setImageTagData( query, image ) {
        return {
            type: 'SET_IMAGE_TAG_DATA',
            query,
            image,
        };
    },
};

registerStore( 'nk/awb', {
    reducer( state = { images: {} }, action ) {
        switch ( action.type ) {
        case 'SET_IMAGE_TAG_DATA':
            if ( ! state.images[ action.query ] && action.image ) {
                state.images[ action.query ] = action.image;
            }
            return state;
        // no default
        }

        return state;
    },
    actions,
    selectors: {
        getImageTagData( state, query ) {
            return state.images[ query ];
        },
    },
    controls: {
        API_FETCH( { request } ) {
            return apiFetch( request )
                .then( ( fetchedData ) => {
                    if ( fetchedData && fetchedData.success && fetchedData.response ) {
                        return fetchedData.response;
                    }
                    return false;
                } );
        },
    },
    resolvers: {
        * getImageTagData( query ) {
            const image = yield actions.apiFetch( { path: query } );
            return actions.setImageTagData( query, image );
        },
    },
} );

export function renderInspectorControls( props ) {
    const {
        attributes,
        setAttributes,
    } = props;

    const {
        type,

        image,
        imageTag,
        imageSizes,
        imageSize,
        imageBackgroundSize,
        imageBackgroundPosition,

        video,
        videoPosterPreview,
        videoMp4,
        videoOgv,
        videoWebm,
        videoStartTime,
        videoEndTime,
        videoLoop,
        videoAlwaysPlay,
        videoMobile,

        color,

        parallax,
        parallaxSpeed,
        parallaxMobile,

        mouseParallax,
        mouseParallaxSize,
        mouseParallaxSpeed,
    } = attributes;

    // load YouTube / Vimeo poster
    if ( 'yt_vm_video' === type && video && ! image ) {
        getVideoPoster( video, ( url ) => {
            if ( url !== videoPosterPreview ) {
                setAttributes( { videoPosterPreview: url } );
            }
        } );
    }

    return (
        <Fragment>
            <PanelBody>
                <ButtonGroup aria-label={ __( 'Background type' ) } style={ { marginTop: 15, marginBottom: 10 } }>
                    {
                        [
                            {
                                label: __( 'Color' ),
                                value: 'color',
                            },
                            {
                                label: __( 'Image' ),
                                value: 'image',
                            },
                            {
                                label: __( 'Video' ),
                                value: 'yt_vm_video',
                            },
                        ].map( ( val ) => {
                            let selected = type === val.value;

                            // select video
                            if ( 'yt_vm_video' === val.value ) {
                                if ( 'video' === type || 'yt_vm_video' === type ) {
                                    selected = true;
                                }
                            }

                            return (
                                <Button
                                    isSmall
                                    isPrimary={ selected }
                                    isPressed={ selected }
                                    onClick={ () => setAttributes( { type: val.value } ) }
                                    key={ `type_${ val.label }` }
                                >
                                    { val.label }
                                </Button>
                            );
                        } )
                    }
                </ButtonGroup>

                { ( 'video' === type || 'yt_vm_video' === type ) ? (
                    <ButtonGroup aria-label={ __( 'Background video type' ) } style={ { marginBottom: 10 } }>
                        {
                            [
                                {
                                    label: __( 'YouTube / Vimeo' ),
                                    value: 'yt_vm_video',
                                },
                                {
                                    label: __( 'Self Hosted' ),
                                    value: 'video',
                                },
                            ].map( ( val ) => (
                                <Button
                                    isSmall
                                    isPrimary={ type === val.value }
                                    isPressed={ type === val.value }
                                    onClick={ () => setAttributes( { type: val.value } ) }
                                    key={ `type_${ val.label }` }
                                >
                                    { val.label }
                                </Button>
                            ) )
                        }
                    </ButtonGroup>
                ) : '' }
            </PanelBody>

            { type ? (
                <Fragment>
                    { ( 'yt_vm_video' === type || 'video' === type ) ? (
                        <PanelBody title={ __( 'Video' ) } initialOpen={ 'yt_vm_video' === type || 'video' === type }>
                            { 'yt_vm_video' === type ? (
                                <TextControl
                                    label={ __( 'Video URL' ) }
                                    type="url"
                                    value={ video }
                                    onChange={ ( v ) => setAttributes( { video: v } ) }
                                    help={ __( 'Supported YouTube and Vimeo URLs' ) }
                                />
                            ) : '' }

                            { /* Preview Video */ }
                            { 'video' === type && ( videoMp4 || videoOgv || videoWebm ) ? (
                                // eslint-disable-next-line jsx-a11y/media-has-caption
                                <video controls>
                                    { videoMp4 ? (
                                        <source src={ videoMp4 } type="video/mp4" />
                                    ) : '' }
                                    { videoOgv ? (
                                        <source src={ videoOgv } type="video/ogg" />
                                    ) : '' }
                                    { videoWebm ? (
                                        <source src={ videoWebm } type="video/webm" />
                                    ) : '' }
                                </video>
                            ) : '' }

                            { /* Select Videos */ }
                            { 'video' === type && ! videoMp4 ? (
                                <MediaUpload
                                    onSelect={ ( media ) => {
                                        setAttributes( {
                                            videoMp4: '',
                                        } );
                                        wp.media.attachment( media.id ).fetch().then( ( data ) => {
                                            setAttributes( {
                                                videoMp4: data.url,
                                            } );
                                        } );
                                    } }
                                    allowedTypes={ [ 'video/mp4', 'video/m4v' ] }
                                    value={ videoMp4 }
                                    render={ ( { open } ) => (
                                        <div style={ { marginBottom: 13 } }>
                                            <Button onClick={ open } isPrimary>
                                                { __( 'Select MP4' ) }
                                            </Button>
                                        </div>
                                    ) }
                                />
                            ) : '' }
                            { 'video' === type && videoMp4 ? (
                                <div>
                                    <span>
                                        { videoMp4.substring( videoMp4.lastIndexOf( '/' ) + 1 ) }
                                        { ' ' }
                                    </span>
                                    <Button
                                        isLink
                                        onClick={ () => {
                                            setAttributes( {
                                                videoMp4: '',
                                            } );
                                        } }
                                    >
                                        { __( '(Remove)' ) }
                                    </Button>
                                    <div style={ { marginBottom: 13 } } />
                                </div>
                            ) : '' }
                            { 'video' === type && ! videoOgv ? (
                                <MediaUpload
                                    onSelect={ ( media ) => {
                                        setAttributes( {
                                            videoOgv: '',
                                        } );
                                        wp.media.attachment( media.id ).fetch().then( ( data ) => {
                                            setAttributes( {
                                                videoOgv: data.url,
                                            } );
                                        } );
                                    } }
                                    allowedTypes={ [ 'video/ogv', 'video/ogg' ] }
                                    value={ videoOgv }
                                    render={ ( { open } ) => (
                                        <div style={ { marginBottom: 13 } }>
                                            <Button onClick={ open } isPrimary>
                                                { __( 'Select OGV' ) }
                                            </Button>
                                        </div>
                                    ) }
                                />
                            ) : '' }
                            { 'video' === type && videoOgv ? (
                                <div>
                                    <span>
                                        { videoOgv.substring( videoOgv.lastIndexOf( '/' ) + 1 ) }
                                        { ' ' }
                                    </span>
                                    <Button
                                        isLink
                                        onClick={ () => {
                                            setAttributes( {
                                                videoOgv: '',
                                            } );
                                        } }
                                    >
                                        { __( '(Remove)' ) }
                                    </Button>
                                    <div style={ { marginBottom: 13 } } />
                                </div>
                            ) : '' }
                            { 'video' === type && ! videoWebm ? (
                                <MediaUpload
                                    onSelect={ ( media ) => {
                                        setAttributes( {
                                            videoWebm: '',
                                        } );
                                        wp.media.attachment( media.id ).fetch().then( ( data ) => {
                                            setAttributes( {
                                                videoWebm: data.url,
                                            } );
                                        } );
                                    } }
                                    allowedTypes={ [ 'video/webm' ] }
                                    value={ videoWebm }
                                    render={ ( { open } ) => (
                                        <div style={ { marginBottom: 13 } }>
                                            <Button onClick={ open } isPrimary>
                                                { __( 'Select WEBM' ) }
                                            </Button>
                                        </div>
                                    ) }
                                />
                            ) : '' }
                            { 'video' === type && videoWebm ? (
                                <div>
                                    <span>
                                        { videoWebm.substring( videoWebm.lastIndexOf( '/' ) + 1 ) }
                                        { ' ' }
                                    </span>
                                    <Button
                                        isLink
                                        onClick={ () => {
                                            setAttributes( {
                                                videoWebm: '',
                                            } );
                                        } }
                                    >
                                        { __( '(Remove)' ) }
                                    </Button>
                                    <div style={ { marginBottom: 13 } } />
                                </div>
                            ) : '' }
                            <ToggleControl
                                label={ __( 'Enable on mobile devices' ) }
                                checked={ !! videoMobile }
                                onChange={ ( v ) => setAttributes( { videoMobile: v } ) }
                            />

                            <TextControl
                                label={ __( 'Start time' ) }
                                type="number"
                                value={ videoStartTime }
                                onChange={ ( v ) => setAttributes( { videoStartTime: parseFloat( v ) } ) }
                                help={ __( 'Start time in seconds when video will be started (this value will be applied also after loop)' ) }
                            />
                            <TextControl
                                label={ __( 'End time' ) }
                                type="number"
                                value={ videoEndTime }
                                onChange={ ( v ) => setAttributes( { videoEndTime: parseFloat( v ) } ) }
                                help={ __( 'End time in seconds when video will be ended' ) }
                            />
                            <ToggleControl
                                label={ __( 'Loop' ) }
                                checked={ !! videoLoop }
                                onChange={ ( v ) => setAttributes( { videoLoop: v } ) }
                            />
                            <ToggleControl
                                label={ __( 'Always play' ) }
                                help={ __( 'Play video also when not in viewport' ) }
                                checked={ !! videoAlwaysPlay }
                                onChange={ ( v ) => setAttributes( { videoAlwaysPlay: v } ) }
                            />
                        </PanelBody>
                    ) : '' }

                    { ( 'image' === type || 'yt_vm_video' === type || 'video' === type ) ? (
                        <PanelBody title={ 'image' === type ? __( 'Image' ) : __( 'Poster Image' ) } initialOpen={ 'image' === type }>
                            { /* Select Image */ }
                            { ! image || ! imageTag ? (
                                <MediaUpload
                                    onSelect={ ( media ) => {
                                        onImageSelect( media, setAttributes );
                                    } }
                                    allowedTypes={ [ 'image' ] }
                                    value={ image }
                                    render={ ( { open } ) => (
                                        <Button onClick={ open } isPrimary>
                                            { __( 'Select image' ) }
                                        </Button>
                                    ) }
                                />
                            ) : '' }

                            { image && imageTag ? (
                                <Fragment>
                                    <FocalPointPicker
                                        value={ imageBackgroundPosition }
                                        image={ maybeDecode( imageTag ) }
                                        onChange={ ( v ) => setAttributes( { imageBackgroundPosition: v } ) }
                                    />
                                    { imageSizes ? (
                                        <SelectControl
                                            label={ __( 'Size' ) }
                                            value={ imageSize }
                                            options={ ( () => {
                                                const result = [];
                                                Object.keys( imageSizes ).forEach( ( k ) => {
                                                    result.push( {
                                                        value: k,
                                                        label: toTitleCase( k ),
                                                    } );
                                                } );
                                                return result;
                                            } )() }
                                            onChange={ ( v ) => setAttributes( { imageSize: v } ) }
                                        />
                                    ) : '' }
                                    <SelectControl
                                        label={ __( 'Background size' ) }
                                        value={ imageBackgroundSize }
                                        options={ [
                                            {
                                                label: __( 'Cover' ),
                                                value: 'cover',
                                            },
                                            {
                                                label: __( 'Contain' ),
                                                value: 'contain',
                                            },
                                            {
                                                label: __( 'Pattern' ),
                                                value: 'pattern',
                                            },
                                        ] }
                                        onChange={ ( v ) => setAttributes( { imageBackgroundSize: v } ) }
                                    />
                                    <Button
                                        isLink
                                        onClick={ () => {
                                            setAttributes( {
                                                image: '',
                                                imageTag: '',
                                                imageSizes: '',
                                            } );
                                        } }
                                    >
                                        { __( 'Remove image' ) }
                                    </Button>
                                </Fragment>
                            ) : '' }
                        </PanelBody>
                    ) : '' }

                    <PanelBody
                        title={ (
                            <Fragment>
                                { 'color' === type ? __( 'Color' ) : __( 'Overlay' ) }
                                <ColorIndicator colorValue={ color } />
                            </Fragment>
                        ) }
                        initialOpen={ 'color' === type }
                    >
                        <ColorPicker
                            label={ __( 'Background Color' ) }
                            value={ color }
                            onChange={ ( val ) => setAttributes( { color: val } ) }
                            alpha
                        />
                    </PanelBody>

                    { ( 'image' === type || 'yt_vm_video' === type || 'video' === type ) ? (
                        <Fragment>
                            <PanelBody title={ __( 'Parallax' ) + ( parallax && '' !== parallaxSpeed ? ` (${ parallax } ${ parallaxSpeed })` : '' ) } initialOpen={ false }>
                                <SelectControl
                                    value={ parallax }
                                    options={ [
                                        {
                                            label: __( 'Disabled' ),
                                            value: '',
                                        },
                                        {
                                            label: __( 'Scroll' ),
                                            value: 'scroll',
                                        },
                                        {
                                            label: __( 'Scale' ),
                                            value: 'scale',
                                        },
                                        {
                                            label: __( 'Opacity' ),
                                            value: 'opacity',
                                        },
                                        {
                                            label: __( 'Opacity + Scroll' ),
                                            value: 'scroll-opacity',
                                        },
                                        {
                                            label: __( 'Opacity + Scale' ),
                                            value: 'scale-opacity',
                                        },
                                    ] }
                                    onChange={ ( v ) => setAttributes( { parallax: v } ) }
                                />
                                { parallax ? (
                                    <Fragment>
                                        <TextControl
                                            label={ __( 'Speed' ) }
                                            type="number"
                                            value={ parallaxSpeed }
                                            step="0.1"
                                            min="-1"
                                            max="2"
                                            onChange={ ( v ) => setAttributes( { parallaxSpeed: parseFloat( v ) } ) }
                                            help={ __( 'Provide number from -1.0 to 2.0' ) }
                                        />
                                        <ToggleControl
                                            label={ __( 'Enable on mobile devices' ) }
                                            checked={ !! parallaxMobile }
                                            onChange={ ( v ) => setAttributes( { parallaxMobile: v } ) }
                                        />
                                    </Fragment>
                                ) : '' }
                            </PanelBody>
                            <PanelBody title={ __( 'Mouse parallax' ) } initialOpen={ false }>
                                <ToggleControl
                                    label={ __( 'Enable' ) }
                                    checked={ !! mouseParallax }
                                    onChange={ ( v ) => setAttributes( { mouseParallax: v } ) }
                                />
                                { mouseParallax ? (
                                    <Fragment>
                                        <RangeControl
                                            label={ __( 'Size' ) }
                                            value={ mouseParallaxSize }
                                            min="0"
                                            max="200"
                                            help={ ` ${ __( 'px' ) }` }
                                            onChange={ ( v ) => setAttributes( { mouseParallaxSize: v } ) }
                                        />
                                        <RangeControl
                                            label={ __( 'Speed' ) }
                                            value={ mouseParallaxSpeed }
                                            min="0"
                                            max="20000"
                                            help={ ` ${ __( 'ms' ) }` }
                                            onChange={ ( v ) => setAttributes( { mouseParallaxSpeed: v } ) }
                                        />
                                    </Fragment>
                                ) : '' }
                            </PanelBody>
                        </Fragment>
                    ) : '' }
                </Fragment>
            ) : '' }
        </Fragment>
    );
}

export function renderEditorPreview( props ) {
    const {
        attributes,
        setAttributes,
        clientId,
    } = props;

    const {
        type,

        image,
        imageTag,
        imageSize = 'full',
        imageSizes,
        imageBackgroundSize,
        imageBackgroundPosition,

        video,
        videoPosterPreview,
        videoStartTime,
        videoEndTime,
        videoVolume,
        videoLoop,
        videoAlwaysPlay,

        parallax,
        parallaxSpeed,

        color,
    } = attributes;

    // load YouTube / Vimeo poster
    if ( 'yt_vm_video' === type && video && ! image ) {
        getVideoPoster( video, ( url ) => {
            if ( url !== videoPosterPreview ) {
                setAttributes( { videoPosterPreview: url } );
            }
        } );
    }

    let previewHTML = '';
    let jarallaxSrc = '';
    if ( 'image' === type || 'video' === type || 'yt_vm_video' === type ) {
        if ( imageSizes && imageSize && imageSizes[ imageSize ] && imageSizes[ imageSize ].url ) {
            jarallaxSrc = imageSizes[ imageSize ].url;
        }

        if ( imageTag ) {
            previewHTML = maybeDecode( imageTag );
        } else if ( 'yt_vm_video' === type && videoPosterPreview ) {
            jarallaxSrc = videoPosterPreview;
            previewHTML = `<img src="${ videoPosterPreview }" class="jarallax-img" alt="" style="object-fit: cover;object-position: 50% 50%;">`;
        }
    }

    const useJarallax = ( parallax && 'image' === type ) || ( 'video' === type || 'yt_vm_video' === type );
    const jarallaxParams = {
        type: parallax,
        speed: parallaxSpeed,
        imgSize: imageBackgroundSize || 'cover',
        imgPosition: imageBackgroundPosition || '50% 50%',
    };

    if ( 'pattern' === imageBackgroundSize ) {
        jarallaxParams.imgSize = 'auto';
        jarallaxParams.imgRepeat = 'repeat';
    }

    if ( video && ( 'video' === type || 'yt_vm_video' === type ) ) {
        jarallaxParams.speed = parallax ? parallaxSpeed : 1;
        jarallaxParams.videoSrc = video;
        jarallaxParams.videoStartTime = videoStartTime;
        jarallaxParams.videoEndTime = videoEndTime;
        jarallaxParams.videoVolume = videoVolume;
        jarallaxParams.videoLoop = videoLoop;
        jarallaxParams.videoPlayOnlyVisible = ! videoAlwaysPlay;
    }

    if ( jarallaxSrc ) {
        jarallaxParams.imgSrc = jarallaxSrc;
    }

    return (
        <Fragment>
            <div className="awb-gutenberg-preview-block">
                { useJarallax ? (
                    <Jarallax
                        key={ `${ jarallaxParams.videoSrc || '' } ${ jarallaxParams.imgSrc || '' } ${ jarallaxParams.imgSize || '' } ${ jarallaxParams.imgRepeat || '' }` }
                        options={ jarallaxParams }
                    />
                ) : (
                    <Fragment>
                        <div
                            className="awb-gutenberg-preview-block-inner"
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={ {
                                __html: previewHTML,
                            } }
                        />
                        <EditorStyles
                            styles={ `
                                #block-${ clientId } > .wp-block > .wp-block-nk-awb > .awb-gutenberg-preview-block img {
                                    object-fit: ${ imageBackgroundSize || 'cover' };
                                    object-position: ${ imageBackgroundPosition || '50% 50%' };
                                }
                            ` }
                        />
                    </Fragment>
                ) }
                { color ? (
                    <div
                        className="nk-awb-overlay"
                        style={ { backgroundColor: color } }
                    />
                ) : '' }
            </div>
        </Fragment>
    );
}

export class BlockEdit extends Component {
    constructor( ...args ) {
        super( ...args );

        this.onUpdate = this.onUpdate.bind( this );
    }

    componentDidMount() {
        this.onUpdate();
    }

    componentDidUpdate() {
        this.onUpdate();
    }

    onUpdate() {
        const {
            fetchImageTag,
            setAttributes,
            attributes,
        } = this.props;

        const {
            imageTag,
        } = attributes;

        // set image tag to attribute
        if ( fetchImageTag && maybeEncode( fetchImageTag ) !== imageTag ) {
            setAttributes( { imageTag: maybeEncode( fetchImageTag ) } );
        }
    }

    render() {
        const {
            attributes,
            setAttributes,
            inspectorControlsOnly,
            hasChildBlocks,
        } = this.props;

        let {
            className,
        } = this.props;

        const {
            type,
            align,
            fullHeight,
            fullHeightAlign,

            image,

            video,
            videoPosterPreview,

            ghostkitClassname,
        } = attributes;

        // load YouTube / Vimeo poster
        if ( 'yt_vm_video' === type && video && ! image ) {
            getVideoPoster( video, ( url ) => {
                if ( url !== videoPosterPreview ) {
                    setAttributes( { videoPosterPreview: url } );
                }
            } );
        }

        // add full height classname.
        if ( fullHeight ) {
            className = classnames( className, 'nk-awb-fullheight', fullHeightAlign ? `nk-awb-content-valign-${ fullHeightAlign }` : '' );
        }

        // add custom classname.
        if ( ghostkitClassname ) {
            className = classnames( className, ghostkitClassname );
        }

        // return controls only
        // used in GhostKit extension
        if ( inspectorControlsOnly ) {
            return renderInspectorControls( this.props );
        }

        return (
            <Fragment>
                <BlockControls>
                    <ToolbarGroup>
                        { AWBData.full_width_fallback ? (
                            /* Fallback for align full */
                            <ToolbarButton
                                icon="align-full-width"
                                label={ __( 'Full Width' ) }
                                isActive={ 'full' === align }
                                onClick={ () => setAttributes( { align: 'full' === align ? '' : 'full' } ) }
                            />
                        ) : (
                            <BlockAlignmentToolbar
                                controls={ validAlignments }
                                value={ align }
                                onChange={ ( v ) => setAttributes( { align: v } ) }
                            />
                        ) }

                        <ToolbarButton
                            icon={ getToolbarIcon( fullHeight ? iconFullHeightWhite : iconFullHeight ) }
                            label={ __( 'Full Height' ) }
                            isActive={ fullHeight }
                            onClick={ () => setAttributes( { fullHeight: ! fullHeight } ) }
                        />
                        { fullHeight ? (
                            <Fragment>
                                <ToolbarButton
                                    icon={ getToolbarIcon( 'top' === fullHeightAlign ? iconVerticalTopWhite : iconVerticalTop ) }
                                    label={ __( 'Content Vertical Top' ) }
                                    isActive={ 'top' === fullHeightAlign }
                                    onClick={ () => setAttributes( { fullHeightAlign: 'top' } ) }
                                />
                                <ToolbarButton
                                    icon={ getToolbarIcon( 'center' === fullHeightAlign ? iconVerticalCenterWhite : iconVerticalCenter ) }
                                    label={ __( 'Content Vertical Center' ) }
                                    isActive={ 'center' === fullHeightAlign }
                                    onClick={ () => setAttributes( { fullHeightAlign: 'center' } ) }
                                />
                                <ToolbarButton
                                    icon={ getToolbarIcon( 'bottom' === fullHeightAlign ? iconVerticalBottomWhite : iconVerticalBottom ) }
                                    label={ __( 'Content Vertical Bottom' ) }
                                    isActive={ 'bottom' === fullHeightAlign }
                                    onClick={ () => setAttributes( { fullHeightAlign: 'bottom' } ) }
                                />
                            </Fragment>
                        ) : '' }
                    </ToolbarGroup>

                    { 'image' === type ? (
                        <ToolbarGroup>
                            <MediaUpload
                                onSelect={ ( media ) => {
                                    onImageSelect( media, setAttributes );
                                } }
                                allowedTypes={ [ 'image' ] }
                                value={ image }
                                render={ ( { open } ) => (
                                    <ToolbarButton
                                        className="components-toolbar__control"
                                        label={ __( 'Edit image' ) }
                                        icon="edit"
                                        onClick={ open }
                                    />
                                ) }
                            />
                        </ToolbarGroup>
                    ) : '' }

                    { 'yt_vm_video' === type ? (
                        <ToolbarGroup>
                            <ToolbarItem>
                                { () => (
                                    <input
                                        aria-label={ __( 'YouTube / Vimeo URL' ) }
                                        type="url"
                                        value={ video }
                                        onChange={ ( event ) => setAttributes( { video: event.target.value } ) }
                                        placeholder={ __( 'YouTube / Vimeo URL' ) }
                                    />
                                ) }
                            </ToolbarItem>
                        </ToolbarGroup>
                    ) : '' }
                </BlockControls>
                <InspectorControls>
                    { renderInspectorControls( this.props ) }
                </InspectorControls>

                <div className={ className }>
                    { renderEditorPreview( this.props ) }
                    <InnerBlocks
                        templateLock={ false }
                        renderAppender={ (
                            hasChildBlocks ? undefined : () => <InnerBlocks.ButtonBlockAppender />
                        ) }
                    />
                </div>
            </Fragment>
        );
    }
}

export const BlockEditWithSelect = withSelect( ( select, props ) => {
    const {
        clientId,
        attributes,
    } = props;

    const { image } = attributes;

    const blockEditor = select( 'core/block-editor' );

    let imageQuery = '';

    if ( image ) {
        imageQuery = `size=${ encodeURIComponent( attributes.imageSize ) }&attr[class]=jarallax-img`;

        // background image with pattern size
        if ( 'pattern' === attributes.imageBackgroundSize ) {
            imageQuery += '&div_tag=1';
        }
    }

    return {
        hasChildBlocks: blockEditor ? 0 < blockEditor.getBlockOrder( clientId ).length : false,
        fetchImageTag: imageQuery ? select( 'nk/awb' ).getImageTagData( `/awb/v1/get_attachment_image/${ image }?${ imageQuery }` ) : false,
    };
} )( BlockEdit );

export const { name } = metadata;

export const settings = {
    ...metadata,
    icon: iconAWB,
    ghostkit: {
        supports: {
            spacings: true,
            display: true,
            customCSS: true,
        },
    },
    getEditWrapperProps( attributes ) {
        const { align } = attributes;
        if ( -1 !== validAlignments.indexOf( align ) ) {
            return { 'data-align': align };
        }
        return {};
    },
    edit: BlockEditWithSelect,
    save: BlockSave,
};
