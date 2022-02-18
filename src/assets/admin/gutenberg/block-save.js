/**
 * External Dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import { maybeDecode } from './utils/encode-decode';
import camelCaseToDash from './utils/camel-case-to-dash';

/**
 * WordPress Dependencies
 */
const {
  useBlockProps,
  useInnerBlocksProps: __stableUseInnerBlocksProps,
  __experimentalUseInnerBlocksProps,
} = wp.blockEditor;

const useInnerBlocksProps = __stableUseInnerBlocksProps || __experimentalUseInnerBlocksProps;

/**
 * Change attributes to data-attributes.
 * Example:
 * parallaxSpeed --> data-awb-parallax-speed
 *
 * @param {Object} attributes - block attributes.
 * @return {Object} - data attributes.
 */
function getDataAttributes(attributes) {
  const result = {};
  Object.keys(attributes).forEach((k) => {
    result[`data-awb-${camelCaseToDash(k)}`] = attributes[k];
  });
  return result;
}

export default function BlockSave(props) {
  const { attributes, backgroundHTMLOnly } = props;
  const {
    align,
    fullHeight,
    fullHeightAlign,

    type,

    imageTag,
    imageBackgroundSize,
    imageBackgroundPosition,

    videoMp4,
    videoOgv,
    videoWebm,
    videoStartTime,
    videoEndTime,
    videoVolume,
    videoLoop,
    videoAlwaysPlay,
    videoMobile,

    parallax,
    parallaxSpeed,
    parallaxMobile,

    mouseParallax,
    mouseParallaxSize,
    mouseParallaxSpeed,

    mediaOpacity,

    color,
    backgroundColor,
  } = attributes;

  let { video } = attributes;

  const resultAtts = {
    type: attributes.type,
  };

  let resultImg = false;

  let className = classnames('nk-awb', align ? ` align${align}` : '');

  // add full height classname.
  if (fullHeight) {
    className = classnames(
      className,
      'nk-awb-fullheight',
      fullHeightAlign ? `nk-awb-content-valign-${fullHeightAlign}` : ''
    );
  }

  switch (type) {
    case 'color':
      break;
    case 'video':
      video = '';
      if (videoMp4) {
        video += `mp4:${videoMp4}`;
      }
      if (videoOgv) {
        video += `${video ? ',' : ''}ogv:${videoOgv}`;
      }
      if (videoWebm) {
        video += `${video ? ',' : ''}webm:${videoWebm}`;
      }
    // eslint-disable-next-line
    case 'yt_vm_video':
      if (video) {
        resultAtts.video = video;
        if (videoStartTime) {
          resultAtts.videoStartTime = videoStartTime;
        }
        if (videoEndTime) {
          resultAtts.videoEndTime = videoEndTime;
        }
        if (videoVolume) {
          resultAtts.videoVolume = videoVolume;
        }
        if (!videoLoop) {
          resultAtts.videoLoop = videoLoop;
        }
        if (videoAlwaysPlay) {
          resultAtts.videoAlwaysPlay = videoAlwaysPlay;
        }
        resultAtts.videoMobile = videoMobile;
      }
    // eslint-disable-next-line
    case 'image':
      if (imageTag) {
        resultImg = imageTag;

        // inside exported xml file almost all symbols are escaped.
        if (resultImg && /^u003c/g.test(resultImg)) {
          resultImg = resultImg
            .replace(/u003c/g, '<')
            .replace(/u003e/g, '>')
            .replace(/u0022/g, '"')
            .replace(/u0026/g, '&');
        }

        if (imageBackgroundSize) {
          resultAtts.imageBackgroundSize = imageBackgroundSize;
        }
        if (imageBackgroundPosition) {
          resultAtts.imageBackgroundPosition = imageBackgroundPosition;
        }
      }
      break;
    default:
      break;
  }

  if (parallax) {
    resultAtts.parallax = parallax;
    if (parallaxSpeed) {
      resultAtts.parallaxSpeed = parallaxSpeed;
    }
    resultAtts.parallaxMobile = parallaxMobile;
  }

  if (mouseParallax) {
    resultAtts.mouseParallax = mouseParallax;
    if (mouseParallaxSize) {
      resultAtts.mouseParallaxSize = mouseParallaxSize;
    }
    if (mouseParallaxSpeed) {
      resultAtts.mouseParallaxSpeed = mouseParallaxSpeed;
    }
  }

  // Fix style tag background.
  if (resultImg) {
    resultImg = maybeDecode(resultImg);

    resultImg = resultImg.replace('url(&quot;', "url('");
    resultImg = resultImg.replace('&quot;);', "');");
  }

  // awb wrap inner html
  let wrapHTML = '';
  if (color) {
    wrapHTML += `<div class="nk-awb-overlay" style="background-color: ${color};"></div>`;
  }
  if (resultImg || resultAtts.video) {
    const opacityStyle =
      'number' === typeof mediaOpacity && 100 !== mediaOpacity
        ? ` style="opacity: ${mediaOpacity / 100};"`
        : '';

    wrapHTML += `<div class="nk-awb-inner"${opacityStyle}>${resultImg || ''}</div>`;
  }
  // eslint-disable-next-line react/no-danger
  wrapHTML = wrapHTML ? (
    <div
      className="nk-awb-wrap"
      style={backgroundColor ? { backgroundColor } : null}
      {...getDataAttributes(resultAtts)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: wrapHTML }}
    />
  ) : (
    ''
  );

  // return background block only
  // used in GhostKit extension
  if (backgroundHTMLOnly) {
    return wrapHTML;
  }

  // useBlockProps
  const blockProps = useBlockProps.save({
    className,
  });
  const { children, ...innerBlocksProps } = useInnerBlocksProps.save(blockProps);

  return (
    <div {...innerBlocksProps}>
      {wrapHTML}
      {children}
    </div>
  );
}
