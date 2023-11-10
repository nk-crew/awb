import camelCaseToDash from '../camel-case-to-dash';

const cssPropsWithPixels = [
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'margin',
  'padding-left',
  'padding-right',
  'padding-top',
  'padding-bottom',
  'padding',
];

/**
 * Get styles from object.
 *
 * @param {object} data - styles data.
 * @param {string} selector - current styles selector (useful for nested styles).
 * @return {string} - ready to use styles string.
 */
export default function getGhostkitStyles(data = {}, selector = '') {
  const result = {};
  let resultCSS = '';

  // add styles.
  Object.keys(data).forEach((key) => {
    // object values.
    if (data[key] !== null && typeof data[key] === 'object') {
      let nestedSelector = selector;
      if (nestedSelector) {
        nestedSelector = `${nestedSelector} ${key}`;
      } else {
        nestedSelector = key;
      }
      resultCSS += (resultCSS ? ' ' : '') + getGhostkitStyles(data[key], nestedSelector);

      // style properties and values.
    } else if (typeof data[key] !== 'undefined' && data[key] !== false) {
      if (!result[selector]) {
        result[selector] = '';
      }
      const propName = camelCaseToDash(key);
      let propValue = data[key];

      // add pixels.
      if (
        (typeof propValue === 'number' &&
          propValue !== 0 &&
          cssPropsWithPixels.includes(propName)) ||
        (typeof propValue === 'string' && /^[0-9.\-]*$/.test(propValue)) // eslint-disable-line
      ) {
        propValue += 'px';
      }

      result[selector] += ` ${propName}: ${propValue};`;
    }
  });

  // add styles to selectors.
  Object.keys(result).forEach((key) => {
    resultCSS = `${key} {${result[key]} }${resultCSS ? ` ${resultCSS}` : ''}`;
  });

  return resultCSS;
}
