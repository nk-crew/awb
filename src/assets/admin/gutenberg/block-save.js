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
  const resultAtts = {
    type: attributes.type,
  };

  let resultImg = false;
  let { video } = attributes;

  let className = classnames('nk-awb', attributes.align ? ` align${attributes.align}` : '');

  // add full height classname.
  if (attributes.fullHeight) {
    className = classnames(
      className,
      'nk-awb-fullheight',
      attributes.fullHeightAlign ? `nk-awb-content-valign-${attributes.fullHeightAlign}` : ''
    );
  }

  switch (attributes.type) {
    case 'color':
      break;
    case 'video':
      video = '';
      if (attributes.videoMp4) {
        video += `mp4:${attributes.videoMp4}`;
      }
      if (attributes.videoOgv) {
        video += `${video ? ',' : ''}ogv:${attributes.videoOgv}`;
      }
      if (attributes.videoWebm) {
        video += `${video ? ',' : ''}webm:${attributes.videoWebm}`;
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
        if (!attributes.videoLoop) {
          resultAtts.videoLoop = attributes.videoLoop;
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

        // inside exported xml file almost all symbols are escaped.
        if (resultImg && /^u003c/g.test(resultImg)) {
          resultImg = resultImg
            .replace(/u003c/g, '<')
            .replace(/u003e/g, '>')
            .replace(/u0022/g, '"')
            .replace(/u0026/g, '&');
        }

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

  // Fix style tag background.
  if (resultImg) {
    resultImg = maybeDecode(resultImg);

    resultImg = resultImg.replace('url(&quot;', "url('");
    resultImg = resultImg.replace('&quot;);', "');");
  }

  // awb wrap inner html
  let wrapHTML = '';
  if (attributes.color) {
    wrapHTML += `<div class="nk-awb-overlay" style="background-color: ${attributes.color};"></div>`;
  }
  if (resultImg || resultAtts.video) {
    const opacityStyle =
      'number' === typeof attributes.mediaOpacity && 100 !== attributes.mediaOpacity
        ? ` style="opacity: ${attributes.mediaOpacity / 100};"`
        : '';

    wrapHTML += `<div class="nk-awb-inner"${opacityStyle}>${resultImg || ''}</div>`;
  }
  // eslint-disable-next-line react/no-danger
  wrapHTML = wrapHTML ? (
    <div
      className="nk-awb-wrap"
      style={attributes.backgroundColor ? { backgroundColor: attributes.backgroundColor } : null}
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
