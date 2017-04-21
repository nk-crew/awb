/*!
 * Additional js for frontend builder
 */
jQuery(function ($) {
    "use strict";

    // shortcode frontend editor
    if (typeof vc !== 'undefined') {

        // on shortcode add and update events
        vc.events.on('shortcodes:add shortcodeView:updated', function (e) {
            if (e.settings.base !== 'vc_row' && e.settings.base !== 'vc_column') {
                return;
            }

            var $this = e.view.$el.children('.vc_row, .wpb_column');
            var $awb = $this.children('.nk-awb-wrap');

            // destroy jarallax
            var $jarallax = $awb.find('[id*="jarallax"]').length ? $awb[0] : false;
            if ($jarallax && $jarallax.jarallax) {
                $jarallax.jarallax['destroy'].apply($jarallax.jarallax);
            }

            // remove awb block
            $awb.remove();

            // init awb if needed
            var wnd = vc.$frame[0].contentWindow;
            var nk_awb_init = wnd ? wnd.nk_awb_init : false;
            if ($this.children('.nk-awb') && nk_awb_init) {
                nk_awb_init();
            }
        });
    }
});
