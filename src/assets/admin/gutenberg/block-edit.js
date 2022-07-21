/**
 * External Dependencies
 */
import VideoWorker from 'video-worker';
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import toTitleCase from './utils/str-to-title-case';
import { maybeEncode, maybeDecode } from './utils/encode-decode';
import ColorIndicator from './components/color-indicator';
import ColorPicker from './components/color-picker';
import FocalPointPicker from './components/focal-point-picker';
import ToggleGroup from './components/toggle-group';
import EditorStyles from './components/editor-styles';
import Jarallax from './components/jarallax';
import iconFullHeight from './icons/fullheight.svg';
import iconVerticalCenter from './icons/vertical-center.svg';
import iconVerticalTop from './icons/vertical-top.svg';
import iconVerticalBottom from './icons/vertical-bottom.svg';

/**
 * WordPress Dependencies
 */
const { __ } = wp.i18n;

const { Fragment, useEffect } = wp.element;

const {
  useBlockProps,
  useInnerBlocksProps: __stableUseInnerBlocksProps,
  __experimentalUseInnerBlocksProps,
  InspectorControls,
  InnerBlocks,
  MediaUpload,
  BlockControls,
  BlockAlignmentToolbar,
} = wp.blockEditor;

const useInnerBlocksProps = __stableUseInnerBlocksProps || __experimentalUseInnerBlocksProps;

const {
  Button,
  PanelBody,
  SelectControl,
  ToggleControl,
  TextControl,
  RangeControl,
  ToolbarGroup,
  ToolbarButton,
  ToolbarItem,
} = wp.components;

const { useSelect } = wp.data;

const AWBData = window.AWBGutenbergData;

const validAlignments = ['full', 'wide'];

/**
 * Get icon for toolbar.
 *
 * @param {Function} Svg - icon.
 * @return {Object} - result svg.
 */
function getToolbarIcon(Svg) {
  return <Svg viewBox="0 0 24 24" />;
}

/**
 * Select image
 *
 * @param {Object} media - media data.
 * @param {Function} setAttributes - function to set attributes on the block.
 */
function onImageSelect(media, setAttributes) {
  setAttributes({
    image: '',
    imageSizes: '',
  });

  wp.media
    .attachment(media.id)
    .fetch()
    .then((data) => {
      if (data && data.sizes) {
        const { url } =
          data.sizes['post-thumbnail'] ||
          data.sizes.medium ||
          data.sizes.medium_large ||
          data.sizes.full;
        if (url) {
          setAttributes({
            image: media.id,
            imageSizes: data.sizes,
          });
        }
      }
    });
}

const videoPosterCache = {};
let videoPosterTimeout;

/**
 * Load YouTube / Vimeo poster image
 *
 * @param {String} url - video URL.
 * @param {Function} cb - load callback with result.
 */
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

export function RenderInspectorControls(props) {
  const { attributes, setAttributes } = props;

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

    mediaOpacity,

    color,
    backgroundColor,

    parallax,
    parallaxSpeed,
    parallaxMobile,

    mouseParallax,
    mouseParallaxSize,
    mouseParallaxSpeed,
  } = attributes;

  // load YouTube / Vimeo poster
  if ('yt_vm_video' === type && video && !image) {
    getVideoPoster(video, (url) => {
      if (url !== videoPosterPreview) {
        setAttributes({ videoPosterPreview: url });
      }
    });
  }

  return (
    <Fragment>
      <PanelBody>
        <ToggleGroup
          value={'video' === type || 'yt_vm_video' === type ? 'yt_vm_video' : type}
          options={[
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
          ]}
          onChange={(value) => {
            setAttributes({ type: value });
          }}
        />

        {'video' === type || 'yt_vm_video' === type ? (
          <ToggleGroup
            value={type}
            options={[
              {
                label: __('YouTube / Vimeo'),
                value: 'yt_vm_video',
              },
              {
                label: __('Self Hosted'),
                value: 'video',
              },
            ]}
            onChange={(value) => {
              setAttributes({ type: value });
            }}
          />
        ) : null}
      </PanelBody>

      {type ? (
        <Fragment>
          {'yt_vm_video' === type || 'video' === type ? (
            <PanelBody title={__('Video')} initialOpen={'yt_vm_video' === type || 'video' === type}>
              {'yt_vm_video' === type ? (
                <TextControl
                  label={__('Video URL')}
                  type="url"
                  value={video}
                  onChange={(v) => setAttributes({ video: v })}
                  help={__('Supported YouTube and Vimeo URLs')}
                />
              ) : null}

              {/* Preview Video */}
              {'video' === type && (videoMp4 || videoOgv || videoWebm) ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video controls>
                  {videoMp4 ? <source src={videoMp4} type="video/mp4" /> : ''}
                  {videoOgv ? <source src={videoOgv} type="video/ogg" /> : ''}
                  {videoWebm ? <source src={videoWebm} type="video/webm" /> : ''}
                </video>
              ) : null}

              {/* Select Videos */}
              {'video' === type && !videoMp4 ? (
                <MediaUpload
                  onSelect={(media) => {
                    setAttributes({
                      videoMp4: '',
                    });
                    wp.media
                      .attachment(media.id)
                      .fetch()
                      .then((data) => {
                        setAttributes({
                          videoMp4: data.url,
                        });
                      });
                  }}
                  allowedTypes={['video/mp4', 'video/m4v']}
                  value={videoMp4}
                  render={({ open }) => (
                    <div style={{ marginBottom: 13 }}>
                      <Button onClick={open} isPrimary>
                        {__('Select MP4')}
                      </Button>
                    </div>
                  )}
                />
              ) : null}
              {'video' === type && videoMp4 ? (
                <div>
                  <span>{videoMp4.substring(videoMp4.lastIndexOf('/') + 1)} </span>
                  <Button
                    isLink
                    onClick={() => {
                      setAttributes({
                        videoMp4: '',
                      });
                    }}
                  >
                    {__('(Remove)')}
                  </Button>
                  <div style={{ marginBottom: 13 }} />
                </div>
              ) : null}
              {'video' === type && !videoOgv ? (
                <MediaUpload
                  onSelect={(media) => {
                    setAttributes({
                      videoOgv: '',
                    });
                    wp.media
                      .attachment(media.id)
                      .fetch()
                      .then((data) => {
                        setAttributes({
                          videoOgv: data.url,
                        });
                      });
                  }}
                  allowedTypes={['video/ogv', 'video/ogg']}
                  value={videoOgv}
                  render={({ open }) => (
                    <div style={{ marginBottom: 13 }}>
                      <Button onClick={open} isPrimary>
                        {__('Select OGV')}
                      </Button>
                    </div>
                  )}
                />
              ) : null}
              {'video' === type && videoOgv ? (
                <div>
                  <span>{videoOgv.substring(videoOgv.lastIndexOf('/') + 1)} </span>
                  <Button
                    isLink
                    onClick={() => {
                      setAttributes({
                        videoOgv: '',
                      });
                    }}
                  >
                    {__('(Remove)')}
                  </Button>
                  <div style={{ marginBottom: 13 }} />
                </div>
              ) : null}
              {'video' === type && !videoWebm ? (
                <MediaUpload
                  onSelect={(media) => {
                    setAttributes({
                      videoWebm: '',
                    });
                    wp.media
                      .attachment(media.id)
                      .fetch()
                      .then((data) => {
                        setAttributes({
                          videoWebm: data.url,
                        });
                      });
                  }}
                  allowedTypes={['video/webm']}
                  value={videoWebm}
                  render={({ open }) => (
                    <div style={{ marginBottom: 13 }}>
                      <Button onClick={open} isPrimary>
                        {__('Select WEBM')}
                      </Button>
                    </div>
                  )}
                />
              ) : null}
              {'video' === type && videoWebm ? (
                <div>
                  <span>{videoWebm.substring(videoWebm.lastIndexOf('/') + 1)} </span>
                  <Button
                    isLink
                    onClick={() => {
                      setAttributes({
                        videoWebm: '',
                      });
                    }}
                  >
                    {__('(Remove)')}
                  </Button>
                  <div style={{ marginBottom: 13 }} />
                </div>
              ) : null}
              <ToggleControl
                label={__('Enable on mobile devices')}
                checked={!!videoMobile}
                onChange={(v) => setAttributes({ videoMobile: v })}
              />

              <TextControl
                label={__('Start time')}
                type="number"
                value={videoStartTime}
                onChange={(v) => setAttributes({ videoStartTime: parseFloat(v) })}
                help={__(
                  'Start time in seconds when video will be started (this value will be applied also after loop)'
                )}
              />
              <TextControl
                label={__('End time')}
                type="number"
                value={videoEndTime}
                onChange={(v) => setAttributes({ videoEndTime: parseFloat(v) })}
                help={__('End time in seconds when video will be ended')}
              />
              <ToggleControl
                label={__('Loop')}
                checked={!!videoLoop}
                onChange={(v) => setAttributes({ videoLoop: v })}
              />
              <ToggleControl
                label={__('Always play')}
                help={__('Play video also when not in viewport')}
                checked={!!videoAlwaysPlay}
                onChange={(v) => setAttributes({ videoAlwaysPlay: v })}
              />
              <RangeControl
                label={__('Video Opacity')}
                value={mediaOpacity}
                min="0"
                max="100"
                onChange={(value) => setAttributes({ mediaOpacity: value })}
              />
            </PanelBody>
          ) : null}

          {'image' === type || 'yt_vm_video' === type || 'video' === type ? (
            <PanelBody
              title={'image' === type ? __('Image') : __('Poster Image')}
              initialOpen={'image' === type}
            >
              {/* Select Image */}
              {!image || !imageTag ? (
                <MediaUpload
                  onSelect={(media) => {
                    onImageSelect(media, setAttributes);
                  }}
                  allowedTypes={['image']}
                  value={image}
                  render={({ open }) => (
                    <Button onClick={open} isPrimary>
                      {__('Select image')}
                    </Button>
                  )}
                />
              ) : null}

              {image && imageTag ? (
                <Fragment>
                  <FocalPointPicker
                    value={imageBackgroundPosition}
                    image={maybeDecode(imageTag)}
                    onChange={(v) => setAttributes({ imageBackgroundPosition: v })}
                  />
                  {imageSizes ? (
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
                      onChange={(v) => setAttributes({ imageSize: v })}
                    />
                  ) : null}
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
                    onChange={(v) => setAttributes({ imageBackgroundSize: v })}
                  />
                  <RangeControl
                    label={__('Image Opacity')}
                    value={mediaOpacity}
                    min="0"
                    max="100"
                    onChange={(value) => setAttributes({ mediaOpacity: value })}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      isSecondary
                      isSmall
                      onClick={() => {
                        setAttributes({
                          image: '',
                          imageTag: '',
                          imageSizes: '',
                        });
                      }}
                    >
                      {__('Remove Image')}
                    </Button>
                  </div>
                </Fragment>
              ) : null}
            </PanelBody>
          ) : null}

          {'image' === type || 'yt_vm_video' === type || 'video' === type ? (
            <PanelBody
              title={
                <Fragment>
                  {__('Background Color')}
                  {backgroundColor ? <ColorIndicator colorValue={backgroundColor} /> : null}
                </Fragment>
              }
            >
              <ColorPicker
                label={__('Background Color')}
                help={__(
                  'You should always specify the background color, as it will be visible once the Media is in loading state. It will be also helpful when you set the Media opacity.'
                )}
                value={backgroundColor}
                onChange={(val) => setAttributes({ backgroundColor: val })}
                alpha
              />
            </PanelBody>
          ) : null}

          <PanelBody
            title={
              <Fragment>
                {'color' === type ? __('Color') : __('Overlay Color')}
                {color ? <ColorIndicator colorValue={color} /> : null}
              </Fragment>
            }
            initialOpen={'color' === type}
          >
            <ColorPicker
              label={'color' === type ? __('Background Color') : __('Overlay Color')}
              value={color}
              onChange={(val) => setAttributes({ color: val })}
              alpha
            />
          </PanelBody>

          {'image' === type || 'yt_vm_video' === type || 'video' === type ? (
            <Fragment>
              <PanelBody
                title={
                  __('Parallax') +
                  (parallax && '' !== parallaxSpeed ? ` (${parallax} ${parallaxSpeed})` : '')
                }
                initialOpen={false}
              >
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
                  onChange={(v) => setAttributes({ parallax: v })}
                />
                {parallax ? (
                  <Fragment>
                    <TextControl
                      label={__('Speed')}
                      type="number"
                      value={parallaxSpeed}
                      step="0.1"
                      min="-1"
                      max="2"
                      onChange={(v) => setAttributes({ parallaxSpeed: parseFloat(v) })}
                      help={__('Provide number from -1.0 to 2.0')}
                    />
                    <ToggleControl
                      label={__('Enable on mobile devices')}
                      checked={!!parallaxMobile}
                      onChange={(v) => setAttributes({ parallaxMobile: v })}
                    />
                  </Fragment>
                ) : null}
              </PanelBody>
              <PanelBody title={__('Mouse parallax')} initialOpen={false}>
                <ToggleControl
                  label={__('Enable')}
                  checked={!!mouseParallax}
                  onChange={(v) => setAttributes({ mouseParallax: v })}
                />
                {mouseParallax ? (
                  <Fragment>
                    <RangeControl
                      label={__('Size')}
                      value={mouseParallaxSize}
                      min="0"
                      max="200"
                      help={` ${__('px')}`}
                      onChange={(v) => setAttributes({ mouseParallaxSize: v })}
                    />
                    <RangeControl
                      label={__('Speed')}
                      value={mouseParallaxSpeed}
                      min="0"
                      max="20000"
                      help={` ${__('ms')}`}
                      onChange={(v) => setAttributes({ mouseParallaxSpeed: v })}
                    />
                  </Fragment>
                ) : null}
              </PanelBody>
            </Fragment>
          ) : null}
        </Fragment>
      ) : null}
    </Fragment>
  );
}

export function RenderEditorPreview({ attributes, setAttributes, clientId }) {
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

    mediaOpacity,

    color,
    backgroundColor,
  } = attributes;

  // load YouTube / Vimeo poster
  if ('yt_vm_video' === type && video && !image) {
    getVideoPoster(video, (url) => {
      if (url !== videoPosterPreview) {
        setAttributes({ videoPosterPreview: url });
      }
    });
  }

  let previewHTML = '';
  let jarallaxSrc = '';
  if ('image' === type || 'video' === type || 'yt_vm_video' === type) {
    if (imageSizes && imageSize && imageSizes[imageSize] && imageSizes[imageSize].url) {
      jarallaxSrc = imageSizes[imageSize].url;
    }

    if (imageTag) {
      previewHTML = maybeDecode(imageTag);
    } else if ('yt_vm_video' === type && videoPosterPreview) {
      jarallaxSrc = videoPosterPreview;
      previewHTML = `<img src="${videoPosterPreview}" class="jarallax-img" alt="" style="object-fit: cover;object-position: 50% 50%;">`;
    }
  }

  const useJarallax = (parallax && 'image' === type) || 'video' === type || 'yt_vm_video' === type;
  const jarallaxParams = {
    type: parallax,
    speed: parallaxSpeed,
    imgSize: imageBackgroundSize || 'cover',
    imgPosition: imageBackgroundPosition || '50% 50%',
  };

  if ('pattern' === imageBackgroundSize) {
    jarallaxParams.imgSize = 'auto';
    jarallaxParams.imgRepeat = 'repeat';
  }

  if (video && ('video' === type || 'yt_vm_video' === type)) {
    jarallaxParams.speed = parallax ? parallaxSpeed : 1;
    jarallaxParams.videoSrc = video;
    jarallaxParams.videoStartTime = videoStartTime;
    jarallaxParams.videoEndTime = videoEndTime;
    jarallaxParams.videoVolume = videoVolume;
    jarallaxParams.videoLoop = videoLoop;
    jarallaxParams.videoPlayOnlyVisible = !videoAlwaysPlay;
  }

  if (jarallaxSrc) {
    jarallaxParams.imgSrc = jarallaxSrc;
  }

  return (
    <div
      className="awb-gutenberg-preview-block"
      style={backgroundColor ? { backgroundColor } : null}
    >
      {useJarallax ? (
        <Jarallax
          key={`${jarallaxParams.videoSrc || ''} ${jarallaxParams.imgSrc || ''} ${
            jarallaxParams.imgSize || ''
          } ${jarallaxParams.imgRepeat || ''}`}
          {...jarallaxParams}
        />
      ) : (
        <div
          className="awb-gutenberg-preview-block-inner"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: previewHTML,
          }}
        />
      )}
      {color ? <div className="nk-awb-overlay" style={{ backgroundColor: color }} /> : ''}
      <EditorStyles
        styles={`
          #block-${clientId} > .awb-gutenberg-preview-block > .awb-gutenberg-preview-block-inner img {
            object-fit: ${imageBackgroundSize || 'cover'};
            object-position: ${imageBackgroundPosition || '50% 50%'};
          }
          #block-${clientId} > .awb-gutenberg-preview-block > .jarallax,
          #block-${clientId} > .awb-gutenberg-preview-block > .awb-gutenberg-preview-block-inner {
            opacity: ${'number' === typeof mediaOpacity ? mediaOpacity / 100 : 1};
          }
        `}
      />
    </div>
  );
}

export function BlockEdit(props) {
  const { clientId, attributes, setAttributes, inspectorControlsOnly } = props;

  const {
    type,
    align,
    fullHeight,
    fullHeightAlign,

    image,
    imageTag,
    imageSize,
    imageBackgroundSize,

    video,
    videoPosterPreview,

    ghostkitClassname,
  } = attributes;

  let className = 'nk-awb';

  const { hasChildBlocks, fetchImageTag } = useSelect(
    (select) => {
      const blockEditor = select('core/block-editor');

      let imageQuery = '';

      if (image) {
        imageQuery = `size=${encodeURIComponent(imageSize)}&attr[class]=jarallax-img`;

        // background image with pattern size
        if ('pattern' === imageBackgroundSize) {
          imageQuery += '&div_tag=1';
        }
      }

      return {
        hasChildBlocks: blockEditor ? 0 < blockEditor.getBlockOrder(clientId).length : false,
        fetchImageTag: imageQuery
          ? select('nk/awb').getImageTagData(`/awb/v1/get_attachment_image/${image}?${imageQuery}`)
          : false,
      };
    },
    [clientId, image, imageSize, imageBackgroundSize]
  );

  useEffect(() => {
    // set image tag to attribute
    if (fetchImageTag && maybeEncode(fetchImageTag) !== imageTag) {
      setAttributes({ imageTag: maybeEncode(fetchImageTag) });
    }
  }, [fetchImageTag, imageTag]);

  // load YouTube / Vimeo poster
  if ('yt_vm_video' === type && video && !image) {
    getVideoPoster(video, (url) => {
      if (url !== videoPosterPreview) {
        setAttributes({ videoPosterPreview: url });
      }
    });
  }

  // add full height classname.
  if (fullHeight) {
    className = classnames(
      className,
      'nk-awb-fullheight',
      fullHeightAlign ? `nk-awb-content-valign-${fullHeightAlign}` : ''
    );
  }

  // add custom classname.
  if (ghostkitClassname) {
    className = classnames(className, ghostkitClassname);
  }

  // return controls only
  // used in GhostKit extension
  if (inspectorControlsOnly) {
    return <RenderInspectorControls {...props} />;
  }

  const blockProps = useBlockProps({
    className,
  });
  const { children, ...innerBlocksProps } = useInnerBlocksProps(blockProps, {
    templateLock: false,
    renderAppender: hasChildBlocks ? undefined : () => <InnerBlocks.ButtonBlockAppender />,
  });

  return (
    <Fragment>
      <BlockControls>
        <ToolbarGroup>
          {AWBData.full_width_fallback ? (
            /* Fallback for align full */
            <ToolbarButton
              icon="align-full-width"
              label={__('Full Width')}
              isActive={'full' === align}
              onClick={() => setAttributes({ align: 'full' === align ? '' : 'full' })}
            />
          ) : (
            <BlockAlignmentToolbar
              controls={validAlignments}
              value={align}
              onChange={(v) => setAttributes({ align: v })}
            />
          )}

          <ToolbarButton
            icon={getToolbarIcon(iconFullHeight)}
            label={__('Full Height')}
            isActive={fullHeight}
            onClick={() => setAttributes({ fullHeight: !fullHeight })}
          />
          {fullHeight ? (
            <Fragment>
              <ToolbarButton
                icon={getToolbarIcon(iconVerticalTop)}
                label={__('Content Vertical Top')}
                isActive={'top' === fullHeightAlign}
                onClick={() => setAttributes({ fullHeightAlign: 'top' })}
              />
              <ToolbarButton
                icon={getToolbarIcon(iconVerticalCenter)}
                label={__('Content Vertical Center')}
                isActive={'center' === fullHeightAlign}
                onClick={() => setAttributes({ fullHeightAlign: 'center' })}
              />
              <ToolbarButton
                icon={getToolbarIcon(iconVerticalBottom)}
                label={__('Content Vertical Bottom')}
                isActive={'bottom' === fullHeightAlign}
                onClick={() => setAttributes({ fullHeightAlign: 'bottom' })}
              />
            </Fragment>
          ) : null}
        </ToolbarGroup>

        {'image' === type ? (
          <ToolbarGroup>
            <MediaUpload
              onSelect={(media) => {
                onImageSelect(media, setAttributes);
              }}
              allowedTypes={['image']}
              value={image}
              render={({ open }) => (
                <ToolbarButton
                  className="components-toolbar__control"
                  label={__('Edit image')}
                  icon="edit"
                  onClick={open}
                />
              )}
            />
          </ToolbarGroup>
        ) : null}

        {'yt_vm_video' === type ? (
          <ToolbarGroup>
            <ToolbarItem>
              {() => (
                <input
                  aria-label={__('YouTube / Vimeo URL')}
                  type="url"
                  value={video}
                  onChange={(event) => setAttributes({ video: event.target.value })}
                  placeholder={__('YouTube / Vimeo URL')}
                />
              )}
            </ToolbarItem>
          </ToolbarGroup>
        ) : null}
      </BlockControls>
      <InspectorControls>
        <RenderInspectorControls {...props} />
      </InspectorControls>

      <div {...innerBlocksProps}>
        <RenderEditorPreview {...props} />
        {children}
      </div>
    </Fragment>
  );
}
