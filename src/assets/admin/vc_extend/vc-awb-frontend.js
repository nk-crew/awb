/*!
 * Additional js for frontend and backend VC
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

    // shortcode backend editor
    if (typeof vc !== 'undefined') {

        // on shortcode add and update events
        vc.events.on('shortcodes:vc_row shortcodes:vc_column shortcodes:nk_awb', function (e) {
            var params = e.attributes.params;

            // prevent if no view or control buttons (available only on backend)
            if (!e.view || !e.view.$controls_buttons) {
                return;
            }

            // find icon
            var $icon = false;
            if (e.attributes.shortcode === 'nk_awb') {
                $icon = e.view.$el.find('.wpb_element_title .nk-awb-icon');
            } else {
                $icon = e.view.$controls_buttons.parent().children('.vc_control-awb');
            }

            if (params && (params.awb_type)) {

                // add indicator to row or column
                if (!$icon.length && (e.attributes.shortcode === 'vc_row' || e.attributes.shortcode === 'vc_column'))  {
                    $icon = $('<span class="vc_control-awb">').appendTo(e.view.$controls_buttons.parent());
                }

                // insert overlay color
                if ($icon) {
                    $icon.html('<span class="vc_control-awb-overlay" style="background-color: ' + (params.awb_color || 'transparent') + ';"></span>');
                }

                // update image thumbnail
                $icon.css('background-image', '');

                if (params.awb_image) {
                    var $model = $("[data-model-id=" + e.id + "]");
                    var image_src = $model.data("field-awb_image-attach-image");
                    var $post_id = $("#post_ID");
                    var post_id = $post_id.length ? $post_id.val() : 0;

                    switch (e.getParam("source")) {
                        case "external_link":
                            $icon.css('background-image', 'url("' + e.getParam("custom_src") + '")');
                            break;
                        default:
                            _.isEmpty(params.awb_image) && "featured_image" !== e.getParam("source") ? _.isUndefined(image_src) || ($model.removeData("field-awb_image-attach-image"), $icon.css('background-image', 'url("' + image_src + '")')) : $.ajax({
                                type: "POST",
                                url: window.ajaxurl,
                                data: {
                                    action: "wpb_single_image_src",
                                    content: params.awb_image,
                                    params: e.attributes.params,
                                    post_id: post_id,
                                    _vcnonce: window.vcAdminNonce
                                },
                                dataType: "html",
                                context: e.view
                            }).done(function(image_src) {
                                var image_exists = image_src.length || "featured_image" === e.getParam("source");
                                $icon.css('background-image', 'url("' + image_src + '")')
                            })
                    }
                }
            } else {
                $icon.css('background-image', '').html('');
            }
        });
    }
});
