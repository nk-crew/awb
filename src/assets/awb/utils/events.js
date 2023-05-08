const PREFIX = 'awb';

/**
 * Custom event trigger.
 *
 * @param {Element} $el - element to dispatch event.
 * @param {String} name - event name.
 * @param {Object} args - additional arguments.
 */
export function trigger($el, name, args) {
  const evt = new CustomEvent(`${PREFIX}-${name}`, {
    bubbles: true,
    cancelable: true,
    detail: args,
  });

  $el.dispatchEvent(evt);
}

/**
 * Custom event listener.
 *
 * @param {String} name - event name.
 * @param {Function} fn - callback function.
 * @param {Element} $el - element to dispatch event.
 */
export function on(name, fn, $el = document) {
  $el.addEventListener(`${PREFIX}-${name}`, fn);
}
