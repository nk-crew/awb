import { throttle } from 'throttle-debounce';

import { on } from '../utils/events';
import { getData } from '../utils/get-data';

const { settings } = getData();

/**
 * Stretch Background
 */
function stretch() {
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
  if (settings.full_width_fallback) {
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

const throttledStretch = throttle(200, stretch);

// init.
on('before-init', () => {
  throttledStretch();
});

window.addEventListener('resize', throttledStretch, { passive: true });
window.addEventListener('orientationchange', throttledStretch, { passive: true });
window.addEventListener('load', throttledStretch, { passive: true });
