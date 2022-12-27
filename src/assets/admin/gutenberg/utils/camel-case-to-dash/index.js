/**
 * camelCaseToDash('userId') => "user-id"
 * camelCaseToDash('waitAMoment') => "wait-a-moment"
 * camelCaseToDash('TurboPascal') => "turbo-pascal"
 *
 * https://gist.github.com/youssman/745578062609e8acac9f
 *
 * @param {String} str - camel case string
 * @return {String} - dash string.
 */
export default function camelCaseToDash(str) {
  if (typeof str !== 'string') {
    return str;
  }

  str = str.replace(/[a-z]([A-Z])+/g, (m) => `${m[0]}-${m.substring(1)}`);

  return str.toLowerCase();
}
