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
const { Component } = wp.element;

const { InnerBlocks } = wp.blockEditor;

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

export default class BlockSave extends Component {
  constructor(...args) {
    super(...args);

    // inside exported xml file almost all symbols are escaped.
    const { imageTag } = this.props.attributes;
    if (imageTag && /^u003c/g.test(imageTag)) {
      this.props.attributes.imageTag = imageTag
        .replace(/u003c/g, '<')
        .replace(/u003e/g, '>')
        .replace(/u0022/g, '"')
        .replace(/u0026/g, '&');
    }
  }

  render() {
    const { attributes, backgroundHTMLOnly } = this.props;
    let { className } = this.props;

    const resultAtts = {
      type: attributes.type,
    };
    let resultImg = false;
    let { video } = attributes;

    className = classnames(
      'nk-awb',
      className,
      attributes.align ? ` align${attributes.align}` : ''
    );

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
      wrapHTML += `<div class="nk-awb-inner">${resultImg || ''}</div>`;
    }
    // eslint-disable-next-line react/no-danger
    wrapHTML = wrapHTML ? (
      <div
        className="nk-awb-wrap"
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

    return (
      <div className={className}>
        {wrapHTML}
        <InnerBlocks.Content />
      </div>
    );
  }
}
