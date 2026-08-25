import classnames from 'classnames/dedupe';

/**
 * WordPress Dependencies
 */
const { useRef, useEffect, Fragment } = wp.element;

/**
 * The jarallax instance that belongs to the element's own document.
 *
 * This component runs in the admin page but renders into the editor canvas, which WordPress 7.1
 * always serves as an iframe. jarallax reads the viewport from the window it was loaded in, so
 * the copy on the admin page would measure the admin viewport while positioning an element that
 * lives in the canvas - the parallax offset comes out wrong by the difference between the two,
 * and the visibility check that gates video playback tests the wrong rectangle.
 *
 * The canvas loads its own copy, so take that one. The admin page's copy is the fallback for
 * anywhere the canvas does not have it.
 *
 * @param {HTMLElement} element - the element being decorated.
 *
 * @return {Function|undefined} jarallax, bound to the right document.
 */
function getJarallax(element) {
  const view = element && element.ownerDocument && element.ownerDocument.defaultView;

  return (view && view.jarallax) || window.jarallax;
}

/**
 * Component
 */
export default function Jarallax({ className = '', ...options }) {
  const $el = useRef();

  if (options.video) {
    options.videoSrc = options.video;
  }

  options.type = options.parallax;
  options.speed = options.parallaxSpeed;
  options.imgSize = options.imageBackgroundSize;
  options.imgPosition = options.imageBackgroundPosition;
  options.videoPlayOnlyVisible = !options.videoAlwaysPlay;

  if (options.imageBackgroundSize === 'pattern') {
    options.imgSize = 'auto';
    options.imgRepeat = 'repeat';
  }

  // Init Jarallax and update options.
  useEffect(() => {
    const jarallax = getJarallax($el.current);

    if ($el.current && jarallax) {
      jarallax($el.current, 'destroy');
      jarallax($el.current, options);
    }
  }, [
    options.type,
    options.speed,
    options.imgSrc,
    options.imgSize,
    options.imgPosition,
    options.imgRepeat,
    options.video,
    options.videoSrc,
    options.videoStartTime,
    options.videoEndTime,
    options.videoVolume,
    options.videoLoop,
    options.videoPlayOnlyVisible,
    options.videoYoutubeHost,
  ]);

  // Destroy Jarallax. Resolve the instance from the element again rather than closing over the
  // one used to initialise, so teardown always talks to the copy that owns the element.
  useEffect(() => {
    const $currentEl = $el.current;

    return () => {
      const jarallax = getJarallax($currentEl);

      if ($currentEl && jarallax) {
        jarallax($currentEl, 'destroy');
      }
    };
  }, []);

  return (
    <div className={classnames('jarallax', className)} ref={$el}>
      {options.imgSrc ? (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <Fragment>
          {options.imgSize === 'auto' && options.imgRepeat === 'repeat' ? (
            <div
              className="jarallax-img"
              style={{
                backgroundImage: `url(${options.imgSrc})`,
              }}
            />
          ) : (
            <img className="jarallax-img" src={options.imgSrc} alt="" />
          )}
        </Fragment>
      ) : (
        ''
      )}
    </div>
  );
}
