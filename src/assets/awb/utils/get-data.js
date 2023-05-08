const { AWB } = window;

// Thanks https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser/9851769
const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(
  navigator.userAgent || navigator.vendor || window.opera
);
// eslint-disable-next-line spaced-comment
const isIE = /*@cc_on!@*/ false || !!document.documentMode;
const isEdge = !isIE && !!window.StyleMedia;
const isFirefox = typeof InstallTrigger !== 'undefined';
const isSafari =
  /constructor/i.test(window.HTMLElement) ||
  (function (p) {
    return p.toString() === '[object SafariRemoteNotification]';
  })(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification)); // eslint-disable-line no-undef
const isChrome = !!window.chrome && !!window.chrome.webstore;
const isOpera =
  (!!window.opr && !!window.opr.addons) ||
  !!window.opera ||
  navigator.userAgent.indexOf(' OPR/') >= 0;

let disableParallax = false;
let disableVideo = false;

if (AWB.settings && AWB.settings.disable_parallax && AWB.settings.disable_parallax.length) {
  AWB.settings.disable_parallax.forEach((device) => {
    if (disableParallax) {
      return;
    }

    switch (device) {
      case 'everywhere':
        disableParallax = true;
        break;
      case 'mobile':
        disableParallax = isMobile;
        break;
      case 'ie':
        disableParallax = isIE;
        break;
      case 'edge':
        disableParallax = isEdge;
        break;
      case 'firefox':
        disableParallax = isFirefox;
        break;
      case 'safari':
        disableParallax = isSafari;
        break;
      case 'chrome':
        disableParallax = isChrome;
        break;
      case 'opera':
        disableParallax = isOpera;
        break;
      // no default
    }
  });
}
if (AWB.settings && AWB.settings.disable_video && AWB.settings.disable_video.length) {
  AWB.settings.disable_video.forEach((device) => {
    if (disableVideo) {
      return;
    }

    switch (device) {
      case 'everywhere':
        disableVideo = true;
        break;
      case 'mobile':
        disableVideo = isMobile;
        break;
      case 'ie':
        disableVideo = isIE;
        break;
      case 'edge':
        disableVideo = isEdge;
        break;
      case 'firefox':
        disableVideo = isFirefox;
        break;
      case 'safari':
        disableVideo = isSafari;
        break;
      case 'chrome':
        disableVideo = isChrome;
        break;
      case 'opera':
        disableVideo = isOpera;
        break;
      // no default
    }
  });
}

AWB.isMobile = isMobile;
AWB.disableParallax = disableParallax;
AWB.disableVideo = disableVideo;

export function getData() {
  return AWB;
}
