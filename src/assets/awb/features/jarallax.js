import { getData } from '../utils/get-data';
import { trigger, on } from '../utils/events';

const { jarallax } = window;

const { isMobile, disableParallax, disableVideo } = getData();

function prepareJarallax($el) {
  // init jarallax
  if (typeof jarallax === 'undefined') {
    return;
  }

  const $image = $el.querySelector('.jarallax-img');
  const type = $el.getAttribute('data-awb-type');
  const imageBgSize = $el.getAttribute('data-awb-image-background-size');
  const imageBgPosition = $el.getAttribute('data-awb-image-background-position');
  let video = false;
  let videoStartTime = 0;
  let videoEndTime = 0;
  let videoVolume = 0;
  let videoLoop = true;
  let videoAlwaysPlay = true;
  let videoMobile = false;
  let parallax = $el.getAttribute('data-awb-parallax');
  let parallaxSpeed = $el.getAttribute('data-awb-parallax-speed');
  let parallaxMobile =
    $el.getAttribute('data-awb-parallax-mobile') === 'true' ||
    $el.getAttribute('data-awb-parallax-mobile') === '1';

  // video type
  if (type === 'yt_vm_video' || type === 'video') {
    video = $el.getAttribute('data-awb-video');
    videoStartTime = parseFloat($el.getAttribute('data-awb-video-start-time')) || 0;
    videoEndTime = parseFloat($el.getAttribute('data-awb-video-end-time')) || 0;
    videoVolume = parseFloat($el.getAttribute('data-awb-video-volume')) || 0;
    videoLoop = $el.getAttribute('data-awb-video-loop') !== 'false';
    videoAlwaysPlay = $el.getAttribute('data-awb-video-always-play') === 'true';
    videoMobile =
      $el.getAttribute('data-awb-video-mobile') === '1' ||
      $el.getAttribute('data-awb-video-mobile') === 'true';

    // we need to enable parallax options to play videos
    // https://github.com/nk-crew/awb/issues/17
    if (video && !parallax && !parallaxSpeed) {
      parallax = 'scroll';
      parallaxSpeed = 1;
      parallaxMobile = videoMobile;
    }
  }

  // prevent if no parallax and no video
  if (!parallax && !video) {
    // we need to add object-fit manually, as we don't use Jarallax
    const objectSize = $el.getAttribute('data-awb-image-background-size') || 'cover';
    const objectPosition = $el.getAttribute('data-awb-image-background-position') || '50% 50%';

    if ($image) {
      $image.style.objectFit = objectSize;
      $image.style.objectPosition = objectPosition;
    }

    return;
  }

  const jarallaxParams = {
    type: parallax,
    speed: parallaxSpeed,
    disableParallax() {
      return disableParallax || (parallaxMobile ? false : isMobile);
    },
    disableVideo() {
      return disableVideo || (videoMobile ? false : isMobile);
    },
    imgSize: imageBgSize || 'cover',
    imgPosition: imageBgPosition || '50% 50%',
  };

  if (imageBgSize === 'pattern') {
    jarallaxParams.imgSize = 'auto';
    jarallaxParams.imgRepeat = 'repeat';
  }

  if (video) {
    jarallaxParams.speed = parallax ? parallaxSpeed : 1;
    jarallaxParams.videoSrc = video;
    jarallaxParams.videoStartTime = videoStartTime;
    jarallaxParams.videoEndTime = videoEndTime;
    jarallaxParams.videoVolume = videoVolume;
    jarallaxParams.videoLoop = videoLoop;
    jarallaxParams.videoPlayOnlyVisible = !videoAlwaysPlay;
  }

  const $inner = $el.querySelector(':scope > .nk-awb-inner');
  const $pictureImg = $inner.querySelector('picture .jarallax-img');

  if ($pictureImg) {
    $pictureImg.classList.remove('jarallax-img');
    $pictureImg.closest('picture').classList.add('jarallax-img');
  }

  trigger($el, 'before-jarallax-init', jarallaxParams);

  jarallax($inner, jarallaxParams);

  trigger($el, 'after-jarallax-init', jarallaxParams);
}

on('init', (e) => {
  prepareJarallax(e.target);
});
