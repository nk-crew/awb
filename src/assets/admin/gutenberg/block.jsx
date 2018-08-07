import { ChromePicker } from 'react-color';
import VideoWorker from 'video-worker';

/**
 * Gutenberg block
 */
const awbData = window.AWBGutenbergData;
const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const {
    registerBlockType,
} = wp.blocks;

const {
    InspectorControls,
    InnerBlocks,
    MediaUpload,
    BlockControls,
    BlockAlignmentToolbar,
} = wp.editor;

const {
    BaseControl,
    Button,
    ButtonGroup,
    PanelBody,
    SelectControl,
    ToggleControl,
    TextControl,
    RangeControl,
    PanelColor,
    withAPIData,
} = wp.components;

const validAlignments = ['full'];

/**
 * camelCaseToDash('userId') => "user-id"
 * camelCaseToDash('waitAMoment') => "wait-a-moment"
 * camelCaseToDash('TurboPascal') => "turbo-pascal"
 *
 * https://gist.github.com/youssman/745578062609e8acac9f
 */
function camelCaseToDash(str) {
    if (typeof str !== 'string') {
        return str;
    }

    str = str.replace(/[a-z]([A-Z])+/g, m => `${m[0]}-${m.substring(1)}`);

    return str.toLowerCase();
}

/**
 * https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 */
function toTitleCase(str) {
    return str.split(/[.,/ \-_]/).map((word) => {
        return word && word.length ? word.replace(word[0], word[0].toUpperCase()) : word;
    }).join(' ');
}

/**
 * Change attributes to data-attributes.
 * Example:
 * parallaxSpeed --> data-awb-parallax-speed
 */
function getDataAttributes(attributes) {
    const retult = {};
    Object.keys(attributes).forEach((k) => {
        retult[`data-awb-${camelCaseToDash(k)}`] = attributes[k];
    });
    return retult;
}

/**
 * Select image
 */
function onImageSelect(media, setAttributes) {
    setAttributes({
        image: '',
        imageSizes: '',
    });

    wp.media.attachment(media.id).fetch().then((data) => {
        if (data && data.sizes) {
            const url = (data.sizes['post-thumbnail'] || data.sizes.medium || data.sizes.medium_large || data.sizes.full).url;
            if (url) {
                setAttributes({
                    image: media.id,
                    imageSizes: data.sizes,
                });
            }
        }
    });
}

/**
 * Load YouTube / Vimeo poster image
 */
const videoPosterCache = {};
let videoPosterTimeout;
function getVideoPoster(url, cb) {
    if (videoPosterCache[url]) {
        cb(videoPosterCache[url]);
        return;
    }

    clearTimeout(videoPosterTimeout);
    videoPosterTimeout = setTimeout(() => {
        const videoObject = new VideoWorker(url);

        if (videoObject.isValid()) {
            videoObject.getImageURL((videoPosterUrl) => {
                videoPosterCache[url] = videoPosterUrl;
                cb(videoPosterUrl);
            });
        } else {
            cb('');
        }
    }, 500);
}

class BlockSave extends Component {
    constructor() {
        super(...arguments);

        // inside exported xml file almost all symbols are escaped.
        const imageTag = this.props.attributes.imageTag;
        if (imageTag && /^u003c/g.test(imageTag)) {
            this.props.attributes.imageTag = imageTag
                .replace(/u003c/g, '<')
                .replace(/u003e/g, '>')
                .replace(/u0022/g, '"')
                .replace(/u0026/g, '&');
        }
    }

    render() {
        const {
            attributes,
        } = this.props;
        let {
            className,
        } = this.props;

        const resultAtts = {
            type: attributes.type,
        };
        let resultImg = false;
        let video = attributes.video;
        className = `nk-awb${className || ''}${attributes.align ? ` align${attributes.align}` : ''}`;

        switch (attributes.type) {
        case 'color':
            break;
        case 'video':
            video = '';
            if (attributes.videoMp4) {
                video += `mp4:${attributes.videoMp4}`;
            }
            if (attributes.videoOgv) {
                video += `${attributes.video.length ? ',' : ''}ogv:${attributes.videoOgv}`;
            }
            if (attributes.videoWebm) {
                video += `${attributes.video.length ? ',' : ''}webm:${attributes.videoWebm}`;
            }
        // eslint-disable-next-line
        case 'yt_vm_video':
            if (video) {
                resultAtts.video = video;
                if (attributes.videoStartTime) {
                    resultAtts.videoStartTime = attributes.videoStartTime;
                }
                if (attributes.videoEndTime) {
                    resultAtts.videoEndTime = attributes.videoEndTime;
                }
                if (attributes.videoVolume) {
                    resultAtts.videoVolume = attributes.videoVolume;
                }
                if (attributes.videoAlwaysPlay) {
                    resultAtts.videoAlwaysPlay = attributes.videoAlwaysPlay;
                }
                resultAtts.videoMobile = attributes.videoMobile;
            }
        // eslint-disable-next-line
        case 'image':
            if (attributes.imageTag) {
                resultImg = attributes.imageTag;
                if (attributes.imageBackgroundSize) {
                    resultAtts.imageBackgroundSize = attributes.imageBackgroundSize;
                }
                if (attributes.imageBackgroundPosition) {
                    resultAtts.imageBackgroundPosition = attributes.imageBackgroundPosition;
                }
            }
            break;
        default:
            break;
        }

        if (attributes.parallax) {
            resultAtts.parallax = attributes.parallax;
            if (attributes.parallaxSpeed) {
                resultAtts.parallaxSpeed = attributes.parallaxSpeed;
            }
            resultAtts.parallaxMobile = attributes.parallaxMobile;
        }

        if (attributes.mouseParallax) {
            resultAtts.mouseParallax = attributes.mouseParallax;
            if (attributes.mouseParallaxSize) {
                resultAtts.mouseParallaxSize = attributes.mouseParallaxSize;
            }
            if (attributes.mouseParallaxSpeed) {
                resultAtts.mouseParallaxSpeed = attributes.mouseParallaxSpeed;
            }
        }

        // awb wrap inner html
        let wrapHTML = '';
        if (attributes.color) {
            wrapHTML += `<div class="nk-awb-overlay" style="background-color: ${attributes.color};"></div>`;
        }
        if (resultImg || resultAtts.video) {
            wrapHTML += `<div class="nk-awb-inner">${resultImg || ''}</div>`;
        }

        return (
            <div className={className}>
                { wrapHTML ? <div className="nk-awb-wrap" {...getDataAttributes(resultAtts)} dangerouslySetInnerHTML={{ __html: wrapHTML }} /> : '' }
                <InnerBlocks.Content />
            </div>
        );
    }
}

registerBlockType('nk/awb', {
    title: 'Background (AWB)',

    description: 'Advanced Backgrounds',

    // add element with classname to support different icon sets like FontAwesome.
    icon: <img className="dashicon awb-gutenberg-icon" src={awbData.icon} alt="AWB" />,

    category: 'layout',

    keywords: ['awb', 'background', 'parallax'],

    supports: {
        anchor: true,
        className: true,
        html: false,
        ghostkitIndents: true,
        ghostkitDisplay: true,
    },

    attributes: {
        type: {
            type: 'string',
            default: 'color',
        },
        align: {
            type: 'string',
        },

        image: {
            type: 'string',
            default: '',
        },
        imageTag: {
            type: 'string',
            default: '',
        },
        imageSizes: {
            type: 'object',
            default: '',
        },
        imageSize: {
            type: 'string',
            default: 'full',
        },
        imageBackgroundSize: {
            type: 'string',
            default: 'cover',
        },
        imageBackgroundPosition: {
            type: 'string',
            default: '50% 50%',
        },

        video: {
            type: 'string',
            default: '',
        },
        videoPosterPreview: {
            type: 'string',
            default: '',
        },
        videoMp4: {
            type: 'string',
            default: '',
        },
        videoOgv: {
            type: 'string',
            default: '',
        },
        videoWebm: {
            type: 'string',
            default: '',
        },
        videoStartTime: {
            type: 'string',
            default: '',
        },
        videoEndTime: {
            type: 'string',
            default: '',
        },
        videoVolume: {
            type: 'number',
            default: 0,
        },
        videoAlwaysPlay: {
            type: 'boolean',
            default: false,
        },
        videoMobile: {
            type: 'boolean',
            default: false,
        },

        color: {
            type: 'string',
            default: '',
        },

        parallax: {
            type: 'string',
            default: '',
        },
        parallaxSpeed: {
            type: 'number',
            default: 0.5,
        },
        parallaxMobile: {
            type: 'boolean',
            default: false,
        },

        mouseParallax: {
            type: 'boolean',
            default: false,
        },
        mouseParallaxSize: {
            type: 'number',
            default: 30,
        },
        mouseParallaxSpeed: {
            type: 'number',
            default: 10000,
        },
    },

    getEditWrapperProps(attributes) {
        const { align } = attributes;
        if (validAlignments.indexOf(align) !== -1) {
            return { 'data-align': align };
        }
        return {};
    },


    edit: withAPIData(({ attributes }) => {
        const { image } = attributes;
        if (!image) {
            return {};
        }

        let query = `size=${encodeURIComponent(attributes.imageSize)}&attr[class]=jarallax-img`;
        let style = '';

        // <img> tag with object-fit style
        if (attributes.imageBackgroundSize !== 'pattern') {
            if (attributes.imageBackgroundSize) {
                style += `object-fit: ${attributes.imageBackgroundSize};`;
            }
            if (attributes.imageBackgroundPosition) {
                style += `object-position: ${attributes.imageBackgroundPosition};`;
            }

            // ofi polyfill
            if (style) {
                style += `font-family: "${style}";`;
            }

        // background image with pattern size
        } else {
            if (attributes.imageBackgroundSize) {
                style += 'background-repeat: repeat;';
            }
            if (attributes.imageBackgroundPosition) {
                style += `background-position: ${attributes.imageBackgroundPosition};`;
            }
            query += '&div_tag=1';
        }

        // add styles to query
        if (style) {
            query += `&attr[style]=${encodeURIComponent(style)}`;
        }

        return {
            imageTagData: `/awb/v1/get_attachment_image/${image}?${query}`,
        };
    })(({
        imageTagData, attributes, className, setAttributes,
    }) => {
        // set image tag to attribute
        if (imageTagData && !imageTagData.isLoading && imageTagData.data && imageTagData.data.success) {
            setAttributes({ imageTag: imageTagData.data.response });
        }

        const {
            type,
            align,

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
            videoVolume,
            videoAlwaysPlay,
            videoMobile,

            color,

            parallax,
            parallaxSpeed,
            parallaxMobile,

            mouseParallax,
            mouseParallaxSize,
            mouseParallaxSpeed,

            ghostkitClassname,
        } = attributes;

        let colorOverlay = false;
        if (color) {
            colorOverlay = `<div class="nk-awb-overlay" style="background-color: ${color};"></div>`;
        }

        // load YouTube / Vimeo poster
        if (type === 'yt_vm_video' && video && !image) {
            getVideoPoster(video, (url) => {
                if (url !== videoPosterPreview) {
                    setAttributes({ videoPosterPreview: url });
                }
            });
        }

        // add custom classname.
        if ( ghostkitClassname ) {
            className = ( className ? `${className} ` : '' ) + ghostkitClassname;
        }

        return (
            <Fragment>
                <BlockControls>
                    <BlockAlignmentToolbar
                        controls={validAlignments}
                        value={align}
                        onChange={v => setAttributes({ align: v })}
                    />
                </BlockControls>
                <InspectorControls>
                    <ButtonGroup aria-label={__('Background type')} style={{ marginTop: 15, marginBottom: 10 }}>
                        {
                            [
                                {
                                    label: __('Color'),
                                    value: 'color',
                                },
                                {
                                    label: __('Image'),
                                    value: 'image',
                                },
                                {
                                    label: __('Video'),
                                    value: 'yt_vm_video',
                                },
                            ].map((val) => {
                                let selected = type === val.value;

                                // select video
                                if (val.value === 'yt_vm_video') {
                                    if (type === 'video' || type === 'yt_vm_video') {
                                        selected = true;
                                    }
                                }

                                return (
                                    <Button
                                        isLarge
                                        isPrimary={selected}
                                        aria-pressed={selected}
                                        onClick={() => setAttributes({ type: val.value })}
                                        key={`type_${val.label}`}
                                    >
                                        {val.label}
                                    </Button>
                                );
                            })
                        }
                    </ButtonGroup>

                    {(type === 'video' || type === 'yt_vm_video') && (
                        <ButtonGroup aria-label={__('Background video type')} style={{ marginBottom: 10 }}>
                            {
                                [
                                    {
                                        label: __('YouTube / Vimeo'),
                                        value: 'yt_vm_video',
                                    },
                                    {
                                        label: __('Local Hosted'),
                                        value: 'video',
                                    },
                                ].map(val => (
                                    <Button
                                        isLarge
                                        isPrimary={type === val.value}
                                        aria-pressed={type === val.value}
                                        onClick={() => setAttributes({ type: val.value })}
                                        key={`type_${val.label}`}
                                    >
                                        {val.label}
                                    </Button>
                                ))
                            }
                        </ButtonGroup>
                    )}

                    {type && (
                        <Fragment>
                            {(type === 'yt_vm_video' || type === 'video') && (
                                <PanelBody title={__('Video')} initialOpen={type === 'yt_vm_video' || type === 'video'}>
                                    { type === 'yt_vm_video' &&
                                    <TextControl
                                        label={__('Video URL')}
                                        type="url"
                                        value={video}
                                        onChange={v => setAttributes({ video: v })}
                                        help={__('Supported YouTube and Vimeo URLs')}
                                    />
                                    }

                                    {/* Preview Video */}
                                    { type === 'video' && (videoMp4 || videoOgv || videoWebm) && (
                                        <video controls>
                                            { videoMp4 && (
                                                <source src={videoMp4} type="video/mp4" />
                                            ) }
                                            { videoOgv && (
                                                <source src={videoOgv} type="video/ogg" />
                                            ) }
                                            { videoWebm && (
                                                <source src={videoWebm} type="video/webm" />
                                            ) }
                                        </video>
                                    ) }

                                    {/* Select Videos */}
                                    { type === 'video' && !videoMp4 && (
                                        <MediaUpload
                                            onSelect={(media) => {
                                                setAttributes({
                                                    videoMp4: '',
                                                });
                                                wp.media.attachment(media.id).fetch().then((data) => {
                                                    setAttributes({
                                                        videoMp4: data.url,
                                                    });
                                                });
                                            }}
                                            type="video"
                                            value={videoMp4}
                                            render={({ open }) => (
                                                <div style={{ marginBottom: 13 }}>
                                                    <Button onClick={open} isPrimary>
                                                        {__('Select MP4')}
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    ) }
                                    { type === 'video' && videoMp4 && (
                                        <div>
                                            <span>{ videoMp4.substring(videoMp4.lastIndexOf('/') + 1) } </span>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    setAttributes({
                                                        videoMp4: '',
                                                    });
                                                    e.preventDefault();
                                                }}
                                            >
                                                {__('(Remove)')}
                                            </a>
                                            <div style={{ marginBottom: 13 }} />
                                        </div>
                                    ) }
                                    { type === 'video' && !videoOgv && (
                                        <MediaUpload
                                            onSelect={(media) => {
                                                setAttributes({
                                                    videoOgv: '',
                                                });
                                                wp.media.attachment(media.id).fetch().then((data) => {
                                                    setAttributes({
                                                        videoOgv: data.url,
                                                    });
                                                });
                                            }}
                                            type="video"
                                            value={videoOgv}
                                            render={({ open }) => (
                                                <div style={{ marginBottom: 13 }}>
                                                    <Button onClick={open} isPrimary>
                                                        {__('Select OGV')}
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    ) }
                                    { type === 'video' && videoOgv && (
                                        <div>
                                            <span>{ videoOgv.substring(videoOgv.lastIndexOf('/') + 1) } </span>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    setAttributes({
                                                        videoOgv: '',
                                                    });
                                                    e.preventDefault();
                                                }}
                                            >
                                                {__('(Remove)')}
                                            </a>
                                            <div style={{ marginBottom: 13 }} />
                                        </div>
                                    ) }
                                    { type === 'video' && !videoWebm && (
                                        <MediaUpload
                                            onSelect={(media) => {
                                                setAttributes({
                                                    videoWebm: '',
                                                });
                                                wp.media.attachment(media.id).fetch().then((data) => {
                                                    setAttributes({
                                                        videoWebm: data.url,
                                                    });
                                                });
                                            }}
                                            type="video"
                                            value={videoWebm}
                                            render={({ open }) => (
                                                <div style={{ marginBottom: 13 }}>
                                                    <Button onClick={open} isPrimary>
                                                        {__('Select WEBM')}
                                                    </Button>
                                                </div>
                                            )}
                                        />
                                    ) }
                                    { type === 'video' && videoWebm && (
                                        <div>
                                            <span>{ videoWebm.substring(videoWebm.lastIndexOf('/') + 1) } </span>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    setAttributes({
                                                        videoWebm: '',
                                                    });
                                                    e.preventDefault();
                                                }}
                                            >
                                                {__('(Remove)')}
                                            </a>
                                            <div style={{ marginBottom: 13 }} />
                                        </div>
                                    ) }
                                    <ToggleControl
                                        label={__('Enable on mobile devices')}
                                        checked={!!videoMobile}
                                        onChange={v => setAttributes({ videoMobile: v })}
                                    />

                                    <TextControl
                                        label={__('Start time')}
                                        type="number"
                                        value={videoStartTime}
                                        onChange={v => setAttributes({ videoStartTime: v })}
                                        help={__('Start time in seconds when video will be started (this value will be applied also after loop)')}
                                    />
                                    <TextControl
                                        label={__('End time')}
                                        type="number"
                                        value={videoEndTime}
                                        onChange={v => setAttributes({ videoEndTime: v })}
                                        help={__('End time in seconds when video will be ended')}
                                    />
                                    <RangeControl
                                        label={__('Volume')}
                                        value={videoVolume}
                                        min="0"
                                        max="100"
                                        onChange={v => setAttributes({ videoVolume: v })}
                                    />
                                    <ToggleControl
                                        label={__('Always play')}
                                        help={__('Play video also when not in viewport')}
                                        checked={!!videoAlwaysPlay}
                                        onChange={v => setAttributes({ videoAlwaysPlay: v })}
                                    />
                                </PanelBody>
                            )}

                            {(type === 'image' || type === 'yt_vm_video' || type === 'video') && (
                                <PanelBody title={__(type === 'image' ? 'Image' : 'Poster Image')} initialOpen={type === 'image'}>
                                    {/* Select Image */}
                                    { !image && (
                                        <MediaUpload
                                            onSelect={(media) => {
                                                onImageSelect(media, setAttributes);
                                            }}
                                            type="image"
                                            value={image}
                                            render={({ open }) => (
                                                <Button onClick={open} isPrimary>
                                                    {__('Select image')}
                                                </Button>
                                            )}
                                        />
                                    ) }

                                    { image && imageTag && (
                                        <Fragment>
                                            <MediaUpload
                                                onSelect={(media) => {
                                                    onImageSelect(media, setAttributes);
                                                }}
                                                type="image"
                                                value={image}
                                                render={({ open }) => (
                                                    <BaseControl help={__('Click the image to edit or update')}>
                                                        <a
                                                            href="#"
                                                            onClick={open}
                                                            className="awb-gutenberg-media-upload"
                                                            style={{ display: 'block' }}
                                                            dangerouslySetInnerHTML={{ __html: imageTag }}
                                                        />
                                                    </BaseControl>
                                                )}
                                            />
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    setAttributes({
                                                        image: '',
                                                        imageTag: '',
                                                        imageSizes: '',
                                                    });
                                                    e.preventDefault();
                                                }}
                                            >
                                                {__('Remove image')}
                                            </a>
                                            <div style={{ marginBottom: 13 }} />
                                            { imageSizes && (
                                                <SelectControl
                                                    label={__('Size')}
                                                    value={imageSize}
                                                    options={(() => {
                                                        const result = [];
                                                        Object.keys(imageSizes).forEach((k) => {
                                                            result.push({
                                                                value: k,
                                                                label: toTitleCase(k),
                                                            });
                                                        });
                                                        return result;
                                                    })()}
                                                    onChange={v => setAttributes({ imageSize: v })}
                                                />
                                            ) }
                                            <SelectControl
                                                label={__('Background size')}
                                                value={imageBackgroundSize}
                                                options={[
                                                    {
                                                        label: __('Cover'),
                                                        value: 'cover',
                                                    },
                                                    {
                                                        label: __('Contain'),
                                                        value: 'contain',
                                                    },
                                                    {
                                                        label: __('Pattern'),
                                                        value: 'pattern',
                                                    },
                                                ]}
                                                onChange={v => setAttributes({ imageBackgroundSize: v })}
                                            />
                                            <TextControl
                                                label={__('Background position')}
                                                type="text"
                                                value={imageBackgroundPosition}
                                                onChange={v => setAttributes({ imageBackgroundPosition: v })}
                                                help={__('Image position. Example: 50% 50%')}
                                            />
                                        </Fragment>
                                    ) }
                                </PanelBody>
                            )}

                            <PanelColor title={__(type === 'color' ? 'Color' : 'Overlay Color')} colorValue={color} initialOpen={type === 'color'}>
                                <ChromePicker
                                    color={color}
                                    onChangeComplete={(picker) => {
                                        let newColor = picker.hex;

                                        if (picker.rgb && picker.rgb.a < 1) {
                                            newColor = `rgba(${picker.rgb.r}, ${picker.rgb.g}, ${picker.rgb.b}, ${picker.rgb.a})`;
                                        }

                                        setAttributes({ color: newColor });
                                    }}
                                    style={{ width: '100%' }}
                                    disableAlpha={false}
                                />
                            </PanelColor>

                            {(type === 'image' || type === 'yt_vm_video' || type === 'video') && (
                                <Fragment>
                                    <PanelBody title={__('Parallax') + (parallax && parallaxSpeed !== '' ? ` (${parallax} ${parallaxSpeed})` : '')} initialOpen={false}>
                                        <SelectControl
                                            value={parallax}
                                            options={[
                                                {
                                                    label: __('Disabled'),
                                                    value: '',
                                                },
                                                {
                                                    label: __('Scroll'),
                                                    value: 'scroll',
                                                },
                                                {
                                                    label: __('Scale'),
                                                    value: 'scale',
                                                },
                                                {
                                                    label: __('Opacity'),
                                                    value: 'opacity',
                                                },
                                                {
                                                    label: __('Opacity + Scroll'),
                                                    value: 'scroll-opacity',
                                                },
                                                {
                                                    label: __('Opacity + Scale'),
                                                    value: 'scale-opacity',
                                                },
                                            ]}
                                            onChange={v => setAttributes({ parallax: v })}
                                        />
                                        { parallax && (
                                            <Fragment>
                                                <TextControl
                                                    label={__('Speed')}
                                                    type="number"
                                                    value={parallaxSpeed}
                                                    step="0.1"
                                                    min="-1"
                                                    max="2"
                                                    onChange={v => setAttributes({ parallaxSpeed: v })}
                                                    help={__('Provide number from -1.0 to 2.0')}
                                                />
                                                <ToggleControl
                                                    label={__('Enable on mobile devices')}
                                                    checked={!!parallaxMobile}
                                                    onChange={v => setAttributes({ parallaxMobile: v })}
                                                />
                                            </Fragment>
                                        ) }
                                    </PanelBody>
                                    <PanelBody title={__('Mouse parallax')} initialOpen={false}>
                                        <ToggleControl
                                            label={__('Enable')}
                                            checked={!!mouseParallax}
                                            onChange={v => setAttributes({ mouseParallax: v })}
                                        />
                                        { mouseParallax && (
                                            <Fragment>
                                                <RangeControl
                                                    label={__('Size')}
                                                    value={mouseParallaxSize}
                                                    min="0"
                                                    max="200"
                                                    help={` ${__('px')}`}
                                                    onChange={v => setAttributes({ mouseParallaxSize: v })}
                                                />
                                                <RangeControl
                                                    label={__('Speed')}
                                                    value={mouseParallaxSpeed}
                                                    min="0"
                                                    max="20000"
                                                    help={` ${__('ms')}`}
                                                    onChange={v => setAttributes({ mouseParallaxSpeed: v })}
                                                />
                                            </Fragment>
                                        ) }
                                    </PanelBody>
                                </Fragment>
                            )}
                        </Fragment>
                    ) }
                </InspectorControls>
                <div className={className}>
                    <div
                        className="awb-gutenberg-preview-block"
                        dangerouslySetInnerHTML={{
                            __html: (function () {
                                let html = '';

                                if (type === 'image' || type === 'video' || type === 'yt_vm_video') {
                                    if (imageTag) {
                                        html = imageTag;
                                    } else if (type === 'yt_vm_video' && videoPosterPreview) {
                                        html = `<img src="${videoPosterPreview}" class="jarallax-img" alt="" style="object-fit: cover;object-position: 50% 50%;font-family: 'object-fit: cover;object-position: 50% 50%;';">`;
                                    }
                                }

                                html += colorOverlay || '';

                                return html;
                            }()),
                        }}
                    />
                    <InnerBlocks />
                </div>
            </Fragment>
        );
    }),

    save: BlockSave,
});
