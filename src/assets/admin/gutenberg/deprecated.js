/**
 * External Dependencies
 */
import classnames from 'classnames/dedupe';

/**
 * Internal Dependencies
 */
import metadata from './block.json';
import { maybeDecode } from './utils/encode-decode';
import camelCaseToDash from './utils/camel-case-to-dash';
import prepareJarallaxParams from './utils/prepare-jarallax-params';
import getGhostkitStyles from './utils/get-ghostkit-styles';

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

function maybeAddPixels(val) {
  // add pixels.
  if (
    (typeof val === 'number' && val !== 0) ||
    (typeof val === 'string' && /^[0-9.\-]*$/.test(val)) // eslint-disable-line
  ) {
    val += 'px';
  }

  return val;
}

export default [
  // v1.12.0
  // Migrate old data-ghostkit-styles attribute to Gutenberg spacings extension.
  {
    ...metadata,
    attributes: {
      ...metadata.attributes,
      ghostkitSpacings: {
        type: 'object',
      },
      ghostkitStyles: {
        type: 'object',
      },
    },
    isEligible(attributes) {
      // Migrate spacings only when Ghost Kit disabled and there is ghostkitSpacings attribute.
      return !window.GHOSTKIT && !!Object.keys(attributes?.ghostkitSpacings || {}).length;
    },
    migrate(attributes) {
      if (window.GHOSTKIT || !Object.keys(attributes?.ghostkitSpacings || {}).length) {
        return attributes;
      }

      const { ghostkitSpacings, ghostkitStyles, ghostkitClassname, ghostkitId, ...newAttributes } =
        attributes;

      const newSpacings = {
        margin: {},
        padding: {},
      };

      if (typeof ghostkitSpacings?.paddingTop !== 'undefined') {
        newSpacings.padding.top = maybeAddPixels(ghostkitSpacings.paddingTop);
      }
      if (typeof ghostkitSpacings?.paddingRight !== 'undefined') {
        newSpacings.padding.right = maybeAddPixels(ghostkitSpacings.paddingRight);
      }
      if (typeof ghostkitSpacings?.paddingBottom !== 'undefined') {
        newSpacings.padding.bottom = maybeAddPixels(ghostkitSpacings.paddingBottom);
      }
      if (typeof ghostkitSpacings?.paddingLeft !== 'undefined') {
        newSpacings.padding.left = maybeAddPixels(ghostkitSpacings.paddingLeft);
      }

      if (typeof ghostkitSpacings?.marginTop !== 'undefined') {
        newSpacings.margin.top = maybeAddPixels(ghostkitSpacings.marginTop);
      }
      if (typeof ghostkitSpacings?.marginRight !== 'undefined') {
        newSpacings.margin.right = maybeAddPixels(ghostkitSpacings.marginRight);
      }
      if (typeof ghostkitSpacings?.marginBottom !== 'undefined') {
        newSpacings.margin.bottom = maybeAddPixels(ghostkitSpacings.marginBottom);
      }
      if (typeof ghostkitSpacings?.marginLeft !== 'undefined') {
        newSpacings.margin.left = maybeAddPixels(ghostkitSpacings.marginLeft);
      }

      newAttributes.style = {
        ...(newAttributes?.style || {}),
        spacing: {
          ...(newAttributes?.style?.spacings || {}),
          ...newSpacings,
        },
      };

      return newAttributes;
    },
    save: function BlockSave(props) {
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

        ghostkitStyles,
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
        wrapHTML += `<div class="nk-awb-overlay" style="background: ${color};"></div>`;
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
          style={backgroundColor ? { background: backgroundColor } : null}
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

      // Migrate old attribute `data-ghostkit-styles`
      const extraProps = {};
      const customStyles = ghostkitStyles ? { ...ghostkitStyles } : false;

      if (customStyles && Object.keys(customStyles).length !== 0) {
        extraProps['data-ghostkit-styles'] = getGhostkitStyles(customStyles);
      }

      // useBlockProps
      const blockProps = useBlockProps.save({
        className,
        ...extraProps,
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
    },
  },

  // v1.10.0
  {
    ...metadata,
    save: function BlockSave(props) {
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
      const { children, ...innerBlocksProps } = useInnerBlocksProps.save(blockProps);

      return (
        <div {...innerBlocksProps}>
          {wrapHTML}
          {children}
        </div>
      );
    },
  },
];
