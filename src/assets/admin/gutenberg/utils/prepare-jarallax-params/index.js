/**
 * Prepare params for jarallax init.
 *
 * @param {Object} attrs - block attributes
 * @return {Object}
 */
export default function prepareJarallaxParams(attrs) {
  const result = {
    imageBackgroundSize: attrs.imageBackgroundSize || 'cover',
    imageBackgroundPosition: attrs.imageBackgroundPosition || '50% 50%',
  };

  let { video } = attrs;

  switch (attrs.type) {
    case 'video':
      video = '';
      if (attrs.videoMp4) {
        video += `mp4:${attrs.videoMp4}`;
      }
      if (attrs.videoOgv) {
        video += `${video ? ',' : ''}ogv:${attrs.videoOgv}`;
      }
      if (attrs.videoWebm) {
        video += `${video ? ',' : ''}webm:${attrs.videoWebm}`;
      }
    // eslint-disable-next-line
    case 'yt_vm_video':
      if (video) {
        result.video = video;
        if (attrs.videoStartTime) {
          result.videoStartTime = attrs.videoStartTime;
        }
        if (attrs.videoEndTime) {
          result.videoEndTime = attrs.videoEndTime;
        }
        if (attrs.videoVolume) {
          result.videoVolume = attrs.videoVolume;
        }
        if (!attrs.videoLoop) {
          result.videoLoop = attrs.videoLoop;
        }
        if (attrs.videoAlwaysPlay) {
          result.videoAlwaysPlay = attrs.videoAlwaysPlay;
        }
        result.videoMobile = attrs.videoMobile;
      }
      break;
    default:
      break;
  }

  if (attrs.type !== 'color' && attrs.parallax) {
    result.parallax = attrs.parallax;

    // We have to check for undefined, because 0 value is also valid.
    if (typeof attrs.parallaxSpeed !== 'undefined' && attrs.parallaxSpeed !== '') {
      result.parallaxSpeed = attrs.parallaxSpeed;
    }

    result.parallaxMobile = attrs.parallaxMobile;
  }

  return result;
}
