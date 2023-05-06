/**
 * External Dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import { maybeDecode } from './utils/encode-decode';
import camelCaseToDash from './utils/camel-case-to-dash';
import prepareJarallaxParams from './utils/prepare-jarallax-params';

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

    useFeaturedImage,
    imageTag,
    imageBackgroundSize,
    imageBackgroundPosition,

    mouseParallax,
    mouseParallaxSize,
    mouseParallaxSpeed,

    mediaOpacity,

    color,
    backgroundColor,
  } = attributes;

  const jarallaxParams = prepareJarallaxParams(attributes);
  const resultAtts = {
    type: attributes.type,
    ...jarallaxParams,
  };

  // Remove attributes and add it later if needed.
  delete resultAtts.imageBackgroundSize;
  delete resultAtts.imageBackgroundPosition;

  let resultImg = false;

  let className = classnames(
    'nk-awb',
    align ? ` align${align}` : '',
    useFeaturedImage ? 'nk-awb-with-featured-image' : ''
  );

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
    // eslint-disable-next-line
    case 'yt_vm_video':
    // eslint-disable-next-line
    case 'image':
      if (useFeaturedImage || imageTag) {
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
  if (useFeaturedImage || resultImg || resultAtts.video) {
    const opacityStyle =
      typeof mediaOpacity === 'number' && mediaOpacity !== 100
        ? ` style="opacity: ${mediaOpacity / 100};"`
        : '';

    wrapHTML += `<div class="nk-awb-inner"${opacityStyle}>${resultImg || ''}</div>`;
  }

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
  const innerBlocksProps = useInnerBlocksProps.save({
    className: 'nk-awb-wrap-content',
  });

  return (
    <div {...blockProps}>
      {wrapHTML}
      <div {...innerBlocksProps} />
    </div>
  );
}
