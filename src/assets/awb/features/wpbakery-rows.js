import { on } from '../utils/events';

/**
 * Prepare AWB to work with WPBakery rows.
 */
function prepareRow($el) {
  if (!$el || !$el.parentNode || !$el.parentNode.classList.contains('nk-awb-after-vc_row')) {
    return;
  }

  const $parent = $el.parentNode;

  let $clearfix = $parent.previousElementSibling;
  $clearfix = $clearfix.classList.contains('vc_clearfix') ? $clearfix : false;

  let $row = ($clearfix || $parent).previousElementSibling;
  $row = $row && $row.matches('.vc_row:not(.nk-awb)') ? $row : false;

  if ($row) {
    // remove stretch option from AWB if stretch enabled on ROW
    if ($row.matches('[data-vc-full-width=true]')) {
      $el.removeAttr('data-awb-stretch');
    }

    // insert AWB in row
    $row.classList.add('nk-awb');
    $row.append($el);
  }

  $parent.remove();
}

/**
 * Prepare AWB to work with WPBakery columns.
 */
function prepareCol($el) {
  if (!$el || !$el.parentNode || !$el.parentNode.classList.contains('nk-awb-after-vc_column')) {
    return;
  }

  const $parent = $el.parentNode;

  let $col = $parent.previousElementSibling;
  $col = $col && $col.matches('.wpb_column:not(.nk-awb)') ? $col : false;

  const $row = $col.closest('.vc_row');

  if ($col) {
    // remove stretch option from AWB if stretch enabled on ROW
    if ($row.matches('[data-vc-stretch-content=true]')) {
      $el.removeAttribute('data-awb-stretch');
    }

    // insert AWB in col
    $col.classList.add('nk-awb');
    $col.append($el);
  }

  $parent.remove();
}

on('before-init', (e) => {
  prepareRow(e.target);
  prepareCol(e.target);
});
