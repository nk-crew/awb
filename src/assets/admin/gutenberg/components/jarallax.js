import classnames from 'classnames/dedupe';

/**
 * WordPress Dependencies
 */
const { useRef, useEffect, Fragment } = wp.element;

/**
 * Local Dependencies
 */
const { jarallax } = window;

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
    if ($el.current) {
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
  ]);

  // Destroy Jarallax.
  useEffect(() => {
    const $currentEl = $el.current;

    return () => {
      if ($currentEl) {
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
