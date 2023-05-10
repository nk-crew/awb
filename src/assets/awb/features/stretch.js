import { throttle } from 'throttle-debounce';

import { on } from '../utils/events';
import { getData } from '../utils/get-data';

const { settings } = getData();

// All AWB elements which needs to be stretched.
const $regular = [];
const $wpbColumns = [];
const $blocks = [];

function stretchRegular($elements = $regular) {
  if (!$elements || !$elements.length) {
    return;
  }

  $elements.forEach(($el) => {
    const rect = $el.getBoundingClientRect();
    const { left, right } = rect;
    const newRight = window.innerWidth - right;
    const computedStyles = getComputedStyle($el);

    const ml = parseFloat(computedStyles['margin-left'] || 0);
    const mr = parseFloat(computedStyles['margin-right'] || 0);

    $el.style['margin-left'] = `${ml - left}px`;
    $el.style['margin-right'] = `${mr - newRight}px`;
  });
}

function stretchWPBColumns($elements = $wpbColumns) {
  if (!$elements || !$elements.length) {
    return;
  }

  $elements.forEach(($el) => {
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

    $el.style['margin-left'] = css['margin-left'];
    $el.style['margin-right'] = css['margin-right'];
  });
}

function stretchBlocks($elements = $blocks) {
  if (!$elements || !$elements.length) {
    return;
  }

  $elements.forEach(($el) => {
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

/**
 * Stretch Background
 */
function stretch() {
  stretchRegular();
  stretchWPBColumns();
  stretchBlocks();
}

const throttledStretch = throttle(200, stretch);

function prepareElements($el) {
  const isStretchAttribute = $el.getAttribute('data-awb-stretch');

  if (isStretchAttribute && $el.parentNode.classList.contains('wpb_column')) {
    stretchWPBColumns([$el]);
    $wpbColumns.push($el);
    return;
  }

  if (isStretchAttribute) {
    stretchRegular([$el]);
    $regular.push($el);
    return;
  }

  if (settings.full_width_fallback && $el.parentNode.classList.contains('alignfull')) {
    stretchBlocks([$el]);
    $blocks.push($el);
  }
}

// init.
on('before-init', (e) => {
  prepareElements(e.target);
});

window.addEventListener('resize', throttledStretch, { passive: true });
window.addEventListener('orientationchange', throttledStretch, { passive: true });
window.addEventListener('load', throttledStretch, { passive: true });
