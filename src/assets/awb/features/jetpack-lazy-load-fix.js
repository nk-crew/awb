/**
 * Fix Jetpack Lazy Loading conflict in Safari.
 * Jetpack make image clone and our Jarallax stop working.
 *
 * @link https://github.com/Automattic/jetpack/blob/be53f4d3c1c25e39cac9f67e4e81a00d56fca19f/projects/packages/lazy-images/src/js/lazy-images.js#L183-L188
 */
document.addEventListener(
  'jetpack-lazy-loaded-image',
  (e) => {
    if (e.target.classList.contains('jarallax-img')) {
      const $parent = e.target.parentNode.parentNode;

      if ($parent && $parent.jarallax && $parent.jarallax.image && $parent.jarallax.image.$item) {
        $parent.jarallax.image.$item = e.target;
      }
    }
  },
  { passive: true }
);
