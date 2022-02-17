/**
 * Convert string to title case
 * https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
 *
 * @param {String} str - string to convert
 * @return {String} - title case string.
 */
export default function toTitleCase(str) {
  return str
    .split(/[.,/ \-_]/)
    .map((word) => (word && word.length ? word.replace(word[0], word[0].toUpperCase()) : word))
    .join(' ');
}
