/**
 * Mouse Parallax
 */
import { throttle } from 'throttle-debounce';

import { on } from '../utils/events';
import { getData } from '../utils/get-data';

// variables
const { IntersectionObserver } = window;

const { isMobile } = getData();

const $parallaxMouseList = [];
let parallaxMouseFirstRun = 1;

// update rects of visible sections.
function updateRects() {
  $parallaxMouseList.forEach(($el) => {
    if ($el.awbMouseData.is_in_viewport) {
      $el.awbMouseData.rect = $el.parentNode.getBoundingClientRect();
    }
  });
}

const throttledUpdateRects = throttle(200, updateRects);
setInterval(updateRects, 3000);

window.addEventListener('resize', throttledUpdateRects, { passive: true });
window.addEventListener('orientationchange', throttledUpdateRects, { passive: true });
window.addEventListener('load', throttledUpdateRects, { passive: true });
document.addEventListener('scroll', throttledUpdateRects, { passive: true });

// run parallax animation
function parallaxMouseRun(x, y, deviceOrientation) {
  let data;
  let itemX;
  let itemY;

  $parallaxMouseList.forEach(($el) => {
    data = $el.awbMouseData;

    // don't animate if block isn't in viewport
    if (
      !data ||
      typeof data !== 'object' ||
      (!data.is_in_viewport && !(deviceOrientation && parallaxMouseFirstRun))
    ) {
      return;
    }

    // device acceleration calculate
    if (deviceOrientation) {
      itemX = -data.size * x;
      itemY = -data.size * y;

      // mouse calculate
    } else {
      itemX = (data.rect.width - (x - data.rect.left)) / data.rect.width;
      itemY = (data.rect.height - (y - data.rect.top)) / data.rect.height;
      if (itemX > 1 || itemX < 0 || itemY > 1 || itemY < 0) {
        itemX = 0.5;
        itemY = 0.5;
      }
      itemX = data.size * (itemX - 0.5) * 2;
      itemY = data.size * (itemY - 0.5) * 2;
    }

    $el.style.transform = `translateX(${itemX}px) translateY(${itemY}px) translateZ(0)`;

    // Don't set transition on first orientation change on device.
    if (!deviceOrientation || !parallaxMouseFirstRun) {
      $el.style.transition = `transform ${
        deviceOrientation ? 2 : data.speed
      }s  cubic-bezier(.22, .63, .6, .88)`;
    }
  });

  parallaxMouseFirstRun = 0;
}
const throttledParallaxMouseRun = throttle(200, (x, y, deviceOrientation) => {
  parallaxMouseRun(x, y, deviceOrientation);
});

const visibilityObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.target.awbMouseData) {
        entry.target.awbMouseData.is_in_viewport = entry.isIntersecting;

        if (entry.isIntersecting) {
          throttledUpdateRects();
        }
      }
    });
  },
  {
    // We have to start parallax calculation before the block is in view
    // to prevent possible parallax jumping.
    rootMargin: '50px',
  }
);

function initEvents() {
  if (isMobile && window.DeviceOrientationEvent) {
    window.addEventListener(
      'deviceorientation',
      (event) => {
        throttledParallaxMouseRun(event.gamma / 90, event.beta / 180, true);
      },
      { passive: true }
    );
  } else {
    window.addEventListener(
      'mousemove',
      (event) => {
        throttledParallaxMouseRun(event.clientX, event.clientY);
      },
      { passive: true }
    );
  }
}

function prepareMouseParallax($el) {
  if (
    $el.classList.contains('nk-awb-mouse-parallax') ||
    !$el.getAttribute('data-awb-mouse-parallax-size')
  ) {
    return;
  }

  const $inner = $el.querySelector(':scope > .nk-awb-inner');
  const size = parseFloat($el.getAttribute('data-awb-mouse-parallax-size')) || 30;
  const speed = parseFloat($el.getAttribute('data-awb-mouse-parallax-speed')) || 10000;

  $el.classList.add('nk-awb-mouse-parallax');

  $inner.awbMouseData = {
    // is_in_viewport: isInViewport($el) ? isVisible($el) : 0,
    is_in_viewport: 0,
    rect: $el.getBoundingClientRect(),
    size,
    speed: speed / 1000,
  };

  $inner.style.left = `${-size}px`;
  $inner.style.right = `${-size}px`;
  $inner.style.top = `${-size}px`;
  $inner.style.bottom = `${-size}px`;

  visibilityObserver.observe($inner);

  $parallaxMouseList.push($inner);

  // init parallax when first mouse parallax added.
  if ($parallaxMouseList.length === 1) {
    initEvents();
  }
}

on('init', (e) => {
  prepareMouseParallax(e.target);
});
