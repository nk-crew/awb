import { on } from '../utils/events';

/**
 * Custom styles fallback if GhostKit plugin is not installed.
 */
let $style = false;
let customStyles = '';

function prepareFallback($el) {
  const styles = $el.parentNode && $el.parentNode.getAttribute('data-ghostkit-styles');

  if (!styles) {
    return;
  }

  // Create style tag.
  if (!$style) {
    $style = document.createElement('style');
    $style.setAttribute('id', 'ghostkit-awb-custom-css-inline-css');

    document.head.appendChild($style);
  }

  // Add new custom styles.
  customStyles += styles;
  $el.parentNode.removeAttribute('data-ghostkit-styles');

  $style.textContent = customStyles;
}

on('before-init', (e) => {
  if (!window.GHOSTKIT) {
    prepareFallback(e.target);
  }
});
