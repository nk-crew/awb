/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */

import { throttle } from 'throttle-debounce';

// variables
const { AWBData = {}, jarallax } = window;

// Thanks https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
/* eslint-disable */
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(
  navigator.userAgent || navigator.vendor || window.opera
);
const isIE = /*@cc_on!@*/ false || !!document.documentMode;
const isEdge = !isIE && !!window.StyleMedia;
const isFirefox = typeof InstallTrigger !== 'undefined';
const isSafari =
  /constructor/i.test(window.HTMLElement) ||
  (function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
const isChrome = !!window.chrome && !!window.chrome.webstore;
const isOpera =
  (!!window.opr && !!window.opr.addons) ||
  !!window.opera ||
  navigator.userAgent.indexOf(' OPR/') >= 0;
const isTwentyTwenty = !!document.querySelector(
  '#twentytwenty-style-css, #twenty-twenty-style-css, #twenty-twenty-one-style-css'
);
/* eslint-enable */

// disable parallax/video on some devices.
let disableParallax = false;
let disableVideo = false;

if (
  AWBData.settings &&
  AWBData.settings.disable_parallax &&
  AWBData.settings.disable_parallax.length
) {
  AWBData.settings.disable_parallax.forEach((device) => {
    if (disableParallax) {
      return;
    }

    switch (device) {
      case 'everywhere':
        disableParallax = true;
        break;
      case 'mobile':
        disableParallax = isMobile;
        break;
      case 'ie':
        disableParallax = isIE;
        break;
      case 'edge':
        disableParallax = isEdge;
        break;
      case 'firefox':
        disableParallax = isFirefox;
        break;
      case 'safari':
        disableParallax = isSafari;
        break;
      case 'chrome':
        disableParallax = isChrome;
        break;
      case 'opera':
        disableParallax = isOpera;
        break;
      // no default
    }
  });
}
if (AWBData.settings && AWBData.settings.disable_video && AWBData.settings.disable_video.length) {
  AWBData.settings.disable_video.forEach((device) => {
    if (disableVideo) {
      return;
    }

    switch (device) {
      case 'everywhere':
        disableVideo = true;
        break;
      case 'mobile':
        disableVideo = isMobile;
        break;
      case 'ie':
        disableVideo = isIE;
        break;
      case 'edge':
        disableVideo = isEdge;
        break;
      case 'firefox':
        disableVideo = isFirefox;
        break;
      case 'safari':
        disableVideo = isSafari;
        break;
      case 'chrome':
        disableVideo = isChrome;
        break;
      case 'opera':
        disableVideo = isOpera;
        break;
      // no default
    }
  });
}

/**
 * Stretch Background
 */
function stretchAwb() {
  const $blocks = document.querySelectorAll(
    '.nk-awb:not(.wpb_column) > .nk-awb-wrap[data-awb-stretch="true"]'
  );

  if ($blocks && $blocks.length) {
    $blocks.forEach(($el) => {
      const rect = $el.getBoundingClientRect();
      const { left } = rect;
      const right = window.innerWidth - rect.right;
      const computedStyles = getComputedStyle($el);

      const ml = parseFloat(computedStyles['margin-left'] || 0);
      const mr = parseFloat(computedStyles['margin-right'] || 0);

      $el.style['margin-left'] = `${ml - left}px`;
      $el.style['margin-right'] = `${mr - right}px`;
    });
  }

  // column stretch
  const $columns = document.querySelectorAll(
    '.nk-awb.wpb_column > .nk-awb-wrap[data-awb-stretch="true"]'
  );

  if ($columns && $columns.length) {
    $columns.forEach(($el) => {
      const $row = $el.closest('.vc_row');
      const $col = $el.closest('.wpb_column');
      const rectAWB = $el.getBoundingClientRect();
      const rectRow = $row.getBoundingClientRect();
      const rectCol = $col.getBoundingClientRect();
      const computedStyles = getComputedStyle($el);
      const computedStylesRow = getComputedStyle($row);

      const leftAWB = rectAWB.left;
      const rightAWB = window.innerWidth - rectAWB.right;
      const leftRow = rectRow.left + (parseFloat(computedStylesRow['padding-left']) || 0);
      const rightRow =
        window.innerWidth - rectRow.right + (parseFloat(computedStylesRow['padding-right']) || 0);
      const leftCol = rectCol.left;
      const rightCol = window.innerWidth - rectCol.right;
      const css = {
        'margin-left': 0,
        'margin-right': 0,
      };

      // We need to round numbers because in some situations the same blocks have different offsets, for example
      // Row right is 68
      // Col right is 68.015625
      // I don't know why :(
      if (Math.round(leftRow) === Math.round(leftCol)) {
        const ml = parseFloat(computedStyles['margin-left'] || 0);
        css['margin-left'] = `${ml - leftAWB}px`;
      }

      if (Math.round(rightRow) === Math.round(rightCol)) {
        const mr = parseFloat(computedStyles['margin-right'] || 0);
        css['margin-right'] = `${mr - rightAWB}px`;
      }

      $el.style = { ...$el.style, ...css };
    });
  }

  // Gutenberg stretch fallback
  if (AWBData.settings && AWBData.settings.full_width_fallback) {
    const $blockAlignfull = document.querySelectorAll('.nk-awb.alignfull > .nk-awb-wrap');

    $blockAlignfull.forEach(($el) => {
      const rect = $el.getBoundingClientRect();
      const { left, bottom } = rect;
      const right = window.innerWidth - rect.right;
      const computedStyles = getComputedStyle($el);

      const ml = parseFloat(computedStyles['margin-left'] || 0);
      const mr = parseFloat(computedStyles['margin-right'] || 0);
      const mb = parseFloat(computedStyles['margin-bottom'] || 0);

      let changeLeft = ml - left;
      let changeRight = mr - right;
      let changeBottom = '';

      // Ghostkit column support
      const $col = $el.closest('.ghostkit-col');
      if ($col) {
        const $row = $el.closest('.ghostkit-grid');
        const rectRow = $row.getBoundingClientRect();
        const rectCol = $col.getBoundingClientRect();
        const leftRow = rectRow.left;
        const rightRow = window.innerWidth - rectRow.right;
        const leftCol = rectCol.left;
        const rightCol = window.innerWidth - rectCol.right;
        const bottomCol = rectCol.bottom;

        // We need to round numbers because in some situations the same blocks has different offsets, for example
        // Row right is 68
        // Col right is 68.015625
        // I don't know why :(
        if (Math.round(leftRow) !== Math.round(leftCol)) {
          changeLeft = leftCol - left + ml;
        }
        if (Math.round(rightRow) !== Math.round(rightCol)) {
          changeRight = rightCol - right + mr;
        }

        changeBottom = mb - (bottomCol - bottom);
      }

      $el.style['margin-left'] = `${changeLeft}px`;
      $el.style['margin-right'] = `${changeRight}px`;
      $el.style['margin-bottom'] = `${changeBottom}px`;
    });
  }
}
const throttledStretchAwb = throttle(200, stretchAwb);

/**
 * Srcset fix with object-fit: cover.
 *
 * Reasons:
 *   https://wordpress.org/support/topic/awb-full-image-on-mobile-blurry/
 *   https://wordpress.org/support/topic/supplement-to-awb-full-image-on-mobile-blurry/
 */
function fixSrcsetAwb() {
  const $images = document.querySelectorAll('.nk-awb .nk-awb-inner img');

  if (!$images || !$images.length) {
    return;
  }

  $images.forEach(($el) => {
    const CSS = window.getComputedStyle($el, null);

    if (CSS && CSS.objectFit && CSS.objectFit === 'cover') {
      const imgHeight = parseInt($el.getAttribute('height'), 10);
      const imgWidth = parseInt($el.getAttribute('width'), 10);

      if (imgHeight) {
        let calculatedWidth = $el.clientWidth;

        if (imgWidth / imgHeight > $el.clientWidth / $el.clientHeight) {
          calculatedWidth = parseInt(($el.clientHeight * imgWidth) / imgHeight, 10);
        }

        // Make changes only if value changed to prevent image force reload.
        if ($el.getAttribute('sizes') !== `${calculatedWidth}px`) {
          $el.setAttribute('sizes', `${calculatedWidth}px`);
        }
      }
    }
  });
}
const throttledFixSrcsetAwb = throttle(200, fixSrcsetAwb);

/**
 * Custom styles fallback if GhostKit plugin is not installed.
 */
let customStyles = '';
function maybeFallbackGhostkitStyles() {
  if (window.GHOSTKIT) {
    return;
  }

  const $blocksWithStyles = document.querySelectorAll('.nk-awb[data-ghostkit-styles]');

  if (!$blocksWithStyles || !$blocksWithStyles.length) {
    return;
  }

  $blocksWithStyles.forEach(($el) => {
    customStyles += $el.getAttribute('data-ghostkit-styles');
    $el.removeAttribute('data-ghostkit-styles');
  });

  let $style = document.querySelector('#ghostkit-awb-custom-css-inline-css');
  if (!$style) {
    $style = document.createElement('style');
    $style.setAttribute('id', 'ghostkit-awb-custom-css-inline-css');

    document.head.appendChild($style);
  }

  $style.textContent = customStyles;
}

/**
 * Fix Jetpack Lazy Loading conflict.
 * Jetpack make image clone and our Jarallax stop working.
 */
// $doc.on('jetpack-lazy-loaded-image', '.jarallax-img', (e) => {
//   const $parent = $(e.target).parent().parent();

//   if ($parent[0].jarallax && $parent[0].jarallax.image && $parent[0].jarallax.image.$item) {
//     $parent[0].jarallax.image.$item = e.target;
//   }
// });

/**
 * Main AWB Init
 */
window.nkAwbInit = function () {
  // prepare vc_row
  const $vcRows = document.querySelectorAll('.nk-awb-after-vc_row');

  if ($vcRows && $vcRows.length) {
    $vcRows.forEach(($el) => {
      let $vcClearfix = $el.previousElementSibling;
      $vcClearfix = $vcClearfix.classList.contains('vc_clearfix') ? $vcClearfix : false;

      let $vcRow = ($vcClearfix || $el).previousElementSibling;
      $vcRow = $vcRow && $vcRow.matches('.vc_row:not(.nk-awb)') ? $vcRow : false;

      if ($vcRow) {
        const $children = $el.querySelector(':scope > .nk-awb-wrap');

        if ($children) {
          // remove stretch option from AWB if stretch enabled on ROW
          if ($vcRow.matches('[data-vc-full-width=true]')) {
            $children.removeAttr('data-awb-stretch');
          }

          // insert AWB in row
          $vcRow.classList.add('nk-awb');
          $vcRow.append($children);
        }
      }

      $el.remove();
    });
  }

  // prepare vc_column
  const $vcCols = document.querySelectorAll('.nk-awb-after-vc_column');

  if ($vcCols && $vcCols.length) {
    $vcCols.forEach(($el) => {
      let $vcCol = $el.previousElementSibling;
      $vcCol = $vcCol && $vcCol.matches('.wpb_column:not(.nk-awb)') ? $vcCol : false;

      const $vcRow = $vcCol.closest('.vc_row');

      if ($vcCol) {
        const $children = $el.querySelector(':scope > .nk-awb-wrap');

        // remove stretch option from AWB if stretch enabled on ROW
        if ($vcRow.matches('[data-vc-stretch-content=true]')) {
          $children.removeAttribute('data-awb-stretch');
        }

        // insert AWB in row
        $vcCol.classList.add('nk-awb');
        $vcCol.append($children);
      }

      $el.remove();
    });
  }

  // Ghostkit styles fallback
  maybeFallbackGhostkitStyles();

  // stretch
  stretchAwb();

  // fix srcset
  fixSrcsetAwb();

  // init jarallax
  if (typeof jarallax === 'undefined') {
    return;
  }

  const $awbWrap = document.querySelectorAll('.nk-awb .nk-awb-wrap:not(.nk-awb-rendered)');

  if (!$awbWrap || !$awbWrap.length) {
    return;
  }

  $awbWrap.forEach(function ($el) {
    $el.classList.add('nk-awb-rendered');

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
      const $image = $el.querySelector('.jarallax-img');

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

    // Fix for TwentyTwenty and TwentyTwentyOne (using custom CSS) video styles conflict.
    // https://github.com/WordPress/twentytwenty/blob/master/assets/js/index.js#L294-L318
    // https://github.com/WordPress/twentytwentyone/blob/trunk/assets/js/responsive-embeds.js#L14-L30
    if (isTwentyTwenty) {
      jarallaxParams.onInit = function () {
        $inner.children.forEach(($child) => {
          $child.classList.add('intrinsic-ignore');
        });
      };
    }

    jarallax($inner, jarallaxParams);
  });
};

const throttledInitAwb = throttle(200, () => {
  window.nkAwbInit();
});

// init awb.
window.nkAwbInit();

new window.MutationObserver((mutations) => {
  if (!mutations || !mutations.length) {
    return;
  }

  let allowInit = false;

  // Check if AWB elements added, and run Init function.
  mutations.forEach(({ addedNodes }) => {
    if (!allowInit && addedNodes && addedNodes.length) {
      addedNodes.forEach((node) => {
        if (!allowInit && node.tagName) {
          if (
            node.classList.contains('nk-awb') ||
            node.classList.contains('nk-awb-after-vc_row') ||
            node.classList.contains('nk-awb-after-vc_column')
          ) {
            allowInit = true;
          } else if (
            node.firstElementChild &&
            node.querySelector('.nk-awb, .nk-awb-after-vc_row, .nk-awb-after-vc_column')
          ) {
            allowInit = true;
          }
        }
      });
    }
  });

  if (allowInit) {
    throttledInitAwb();
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// init stretch.
document.addEventListener('resize', throttledStretchAwb, { passive: true });
document.addEventListener('orientationchange', throttledStretchAwb, { passive: true });
document.addEventListener('load', throttledStretchAwb, { passive: true });

// init srcset fixes.
document.addEventListener('resize', throttledFixSrcsetAwb, { passive: true });
document.addEventListener('orientationchange', throttledFixSrcsetAwb, { passive: true });
document.addEventListener('load', throttledFixSrcsetAwb, { passive: true });
