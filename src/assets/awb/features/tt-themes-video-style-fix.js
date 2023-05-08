import { on } from '../utils/events';

const isTwentyTwenty = !!document.querySelector(
  '#twentytwenty-style-css, #twenty-twenty-style-css, #twenty-twenty-one-style-css'
);

// Fix for TwentyTwenty and TwentyTwentyOne (using custom CSS) video styles conflict.
// https://github.com/WordPress/twentytwenty/blob/master/assets/js/index.js#L294-L318
// https://github.com/WordPress/twentytwentyone/blob/trunk/assets/js/responsive-embeds.js#L14-L30
function prepareTTThemesStylesFix($el, jarallaxParams) {
  const $inner = $el.querySelector(':scope > .nk-awb-inner');
  const defaultOnInit = jarallaxParams.onInit;

  jarallaxParams.onInit = function () {
    $inner.children.forEach(($child) => {
      $child.classList.add('intrinsic-ignore');
    });

    if (defaultOnInit) {
      defaultOnInit();
    }
  };
}

on('before-jarallax-init', (e) => {
  if (isTwentyTwenty) {
    prepareTTThemesStylesFix(e.target, e.detail);
  }
});
