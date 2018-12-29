/*!
 * Additional js for frontend and backend VC
 */
jQuery( ( $ ) => {
    const { vc } = window;

    if ( typeof vc === 'undefined' ) {
        return;
    }

    // shortcode frontend editor
    // on shortcode add and update events
    vc.events.on( 'shortcodes:add shortcodeView:updated', ( e ) => {
        if ( e.settings.base !== 'vc_row' && e.settings.base !== 'vc_column' ) {
            return;
        }

        const $this = e.view.$el.children( '.vc_row, .wpb_column' );
        const $awb = $this.children( '.nk-awb-wrap' );

        // destroy jarallax
        const $jarallax = $awb.find( '[id*="jarallax"]' ).length ? $awb[ 0 ] : false;
        if ( $jarallax && $jarallax.jarallax ) {
            $jarallax.jarallax.destroy.apply( $jarallax.jarallax );
        }

        // remove awb block
        $awb.remove();

        // init awb if needed
        const wnd = vc.$frame[ 0 ].contentWindow;
        const nkAwbInit = wnd ? wnd.nkAwbInit : false;
        if ( $this.children( '.nk-awb' ) && nkAwbInit ) {
            nkAwbInit();
        }
    } );

    // shortcode backend editor
    // on shortcode add and update events
    vc.events.on( 'shortcodes:vc_row shortcodes:vc_column shortcodes:nk_awb', ( e ) => {
        const params = e.attributes.params;

        // prevent if no view or control buttons (available only on backend)
        if ( ! e.view || ! e.view.$controls_buttons ) {
            return;
        }

        // find icon
        let $icon = false;
        if ( e.attributes.shortcode === 'nk_awb' ) {
            $icon = e.view.$el.find( '.wpb_element_title .nk-awb-icon' );
        } else {
            $icon = e.view.$controls_buttons.parent().children( '.vc_control-awb' );
        }

        // prevent if disabled awb
        if ( ! params || ! params.awb_type ) {
            $icon.css( 'background-image', '' ).html( '' );
            if ( $icon.hasClass( 'vc_control-awb' ) ) {
                $icon.remove();
            }
            return;
        }

        // add indicator to row or column
        if ( ! $icon.length && ( e.attributes.shortcode === 'vc_row' || e.attributes.shortcode === 'vc_column' ) ) {
            $icon = $( '<span class="vc_control-awb">' ).appendTo( e.view.$controls_buttons.parent() );
        }

        // add edit control attribute
        $icon.attr( 'data-vc-control', 'edit' );

        // insert overlay color
        $icon.html( `<span class="vc_control-awb-overlay" style="background-color: ${ params.awb_color || 'transparent' };"></span>` );

        // update image thumbnail
        $icon.css( 'background-image', '' );

        if ( params.awb_image ) {
            const $model = $( `[data-model-id=${ e.id }]` );
            const imageSrc = $model.data( 'field-awb_image-attach-image' );
            const $postId = $( '#post_ID' );
            const postId = $postId.length ? $postId.val() : 0;

            switch ( e.getParam( 'source' ) ) {
            case 'external_link':
                $icon.css( 'background-image', `url("${ e.getParam( 'custom_src' ) }")` );
                break;
            default:
                // eslint-disable-next-line
                _.isEmpty(params.awb_image) && e.getParam('source') !== 'featured_image' ? _.isUndefined(imageSrc) || ($model.removeData('field-awb_image-attach-image'), $icon.css('background-image', `url("${imageSrc}")`)) : $.ajax({
                    type: 'POST',
                    url: window.ajaxurl,
                    data: {
                        action: 'wpb_single_image_src',
                        content: params.awb_image,
                        params: e.attributes.params,
                        post_id: postId,
                        _vcnonce: window.vcAdminNonce,
                    },
                    dataType: 'html',
                    context: e.view,
                } ).done( ( newImageSrc ) => {
                    $icon.css( 'background-image', `url("${ newImageSrc }")` );
                } );
            }
        }
    } );
} );
