/**
 * Mouse Parallax
 */
import { throttle } from 'throttle-debounce';

// variables
const { IntersectionObserver } = window;

// Thanks https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(
  navigator.userAgent || navigator.vendor || window.opera
);

let $parallaxMouseList = [];
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

document.addEventListener('resize', throttledUpdateRects, { passive: true });
document.addEventListener('scroll', throttledUpdateRects, { passive: true });
document.addEventListener('orientationchange', throttledUpdateRects, { passive: true });
document.addEventListener('load', throttledUpdateRects, { passive: true });

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

function init() {
  const $newParallax = document.querySelectorAll(
    '.nk-awb .nk-awb-wrap[data-awb-mouse-parallax-size]:not(.nk-awb-mouse-parallax) > .nk-awb-inner'
  );

  if ($newParallax && $newParallax.length) {
    // add data to new parallax blocks.
    $newParallax.forEach(($el) => {
      const $parent = $el.parentNode;
      const size = parseFloat($parent.getAttribute('data-awb-mouse-parallax-size')) || 30;
      const speed = parseFloat($parent.getAttribute('data-awb-mouse-parallax-speed')) || 10000;

      $parent.classList.add('nk-awb-mouse-parallax');

      $el.awbMouseData = {
        // is_in_viewport: isInViewport($parent) ? isVisible($parent) : 0,
        is_in_viewport: 0,
        rect: $parent.getBoundingClientRect(),
        size,
        speed: speed / 1000,
      };

      $el.style.left = `${-size}px`;
      $el.style.right = `${-size}px`;
      $el.style.top = `${-size}px`;
      $el.style.bottom = `${-size}px`;

      visibilityObserver.observe($el);
    });

    // add new parallax blocks
    if ($parallaxMouseList.length) {
      $parallaxMouseList = [...$parallaxMouseList, ...$newParallax];

      // first init parallax
    } else {
      $parallaxMouseList = $newParallax;

      initEvents();
    }
  }
}

const throttledInit = throttle(200, init);

init();

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
          if (typeof node.dataset.awbMouseParallaxSize !== 'undefined') {
            allowInit = true;
          } else if (
            node.firstElementChild &&
            node.querySelector('[data-awb-mouse-parallax-size]:not(.nk-awb-mouse-parallax)')
          ) {
            allowInit = true;
          }
        }
      });
    }
  });

  if (allowInit) {
    throttledInit();
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});
