/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */

import { throttle } from 'throttle-debounce';

import { on, trigger } from './utils/events';
import { getData } from './utils/get-data';

import './features/jetpack-lazy-load-fix';
import './features/wpbakery-rows';
import './features/fallback-ghostkit-styles';
import './features/stretch';
import './features/mouse-parallax';
import './features/srcset-fix';
import './features/tt-themes-video-style-fix';
import './features/jarallax';

const AWB = {
  selector: '.nk-awb .nk-awb-wrap:not(.nk-awb-rendered)',
  events: {
    on,
    trigger,
  },
  getData,
};

/**
 * AWB init.
 *
 * @param {String} customSelector - custom selector for init.
 */
AWB.init = function (customSelector) {
  const $awbWrap = document.querySelectorAll(customSelector || AWB.selector);

  if (!$awbWrap || !$awbWrap.length) {
    return;
  }

  $awbWrap.forEach(function ($el) {
    trigger($el, 'before-init');

    $el.classList.add('nk-awb-rendered');

    trigger($el, 'init');

    trigger($el, 'after-init');
  });
};

AWB.initThrottled = throttle(200, () => {
  AWB.init();
});

// init awb.
AWB.init();

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
    AWB.initThrottled();
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Add object globally.
window.AWB = AWB;

// Fallback.
window.nkAwbInit = function () {
  // eslint-disable-next-line no-console
  console.warn(
    `You are using the "nkAwbInit()" function, which is deprecated since v1.11.1. Please, use "AWB.init()" instead.`
  );

  window.AWB.init();
};
