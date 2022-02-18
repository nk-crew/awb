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
export default function Jarallax({ className = '', options }) {
  const $el = useRef();

  // Init Jarallax.
  useEffect(() => {
    if ($el.current) {
      jarallax($el.current, options);
    }

    // Destroy Jarallax.
    return function destroy() {
      if ($el.current) {
        jarallax($el.current, 'destroy');
      }
    };
  }, []);

  // Update options.
  useEffect(() => {
    if ($el.current) {
      jarallax($el.current, 'destroy');
      jarallax($el.current, options);
    }
  }, [options]);

  return (
    <div className={classnames('jarallax', className)} ref={$el}>
      {options.imgSrc ? (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <Fragment>
          {'auto' === options.imgSize && 'repeat' === options.imgRepeat ? (
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
