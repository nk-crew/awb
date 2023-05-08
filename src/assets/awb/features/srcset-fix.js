import { debounce } from 'throttle-debounce';

import { on } from '../utils/events';

/**
 * Srcset fix with object-fit: cover.
 *
 * Reasons:
 *   https://wordpress.org/support/topic/awb-full-image-on-mobile-blurry/
 *   https://wordpress.org/support/topic/supplement-to-awb-full-image-on-mobile-blurry/
 */
function srcsetFix($images) {
  if (!$images || !$images.length) {
    $images = document.querySelectorAll('.nk-awb .nk-awb-inner img');
  }

  if (!$images || !$images.length) {
    return;
  }

  $images.forEach(($img) => {
    const CSS = window.getComputedStyle($img, null);

    if (CSS && CSS.objectFit && CSS.objectFit === 'cover') {
      const imgHeight = parseInt($img.getAttribute('height'), 10);
      const imgWidth = parseInt($img.getAttribute('width'), 10);

      if (imgHeight) {
        let calculatedWidth = $img.clientWidth;

        if (imgWidth / imgHeight > $img.clientWidth / $img.clientHeight) {
          calculatedWidth = parseInt(($img.clientHeight * imgWidth) / imgHeight, 10);
        }

        // Make changes only if value changed to prevent image force reload.
        if ($img.getAttribute('sizes') !== `${calculatedWidth}px`) {
          $img.setAttribute('sizes', `${calculatedWidth}px`);

          // Support for some popular Lazy Loading attributes.
          if ($img.getAttribute('data-sizes')) {
            $img.setAttribute('data-sizes', `${calculatedWidth}px`);
          }
          if ($img.getAttribute('data-lazy-sizes')) {
            $img.setAttribute('data-lazy-sizes', `${calculatedWidth}px`);
          }
        }
      }
    }
  });
}

const debouncedSrcsetFix = debounce(500, srcsetFix);

// init.
on('before-init', (e) => {
  const $images = e.target.querySelectorAll('.nk-awb-inner img');

  srcsetFix($images);
});

window.addEventListener('resize', debouncedSrcsetFix, { passive: true });
window.addEventListener('orientationchange', debouncedSrcsetFix, { passive: true });
window.addEventListener('load', debouncedSrcsetFix, { passive: true });
