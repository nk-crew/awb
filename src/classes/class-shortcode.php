<?php
/**
 * AWB Shortcode Class
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class NK_AWB_Shortcode
 */
class NK_AWB_Shortcode {
    /**
     * NK_AWB_Shortcode constructor.
     */
    public function __construct() {
        $this->init_options();
    }

    /**
     * Init
     */
    public function init_options() {
        // add shortcode.
        add_shortcode( 'nk_awb', array( $this, 'get_shortcode_out' ) );
    }

    /**
     * Scripts enqueued flag
     *
     * @var bool
     */
    private static $scripts_enqueued = false;

    /**
     * Enqueue styles and scripts
     */
    public static function enqueue_front_assets() {
        if ( self::$scripts_enqueued ) {
            return;
        }
        self::$scripts_enqueued = true;

        wp_enqueue_script( 'nk-awb' );
        wp_enqueue_style( 'nk-awb' );
    }

    /**
     * Shortcode Output
     *
     * @param array  $atts - shortcode attributes.
     * @param string $content - shortcode content.
     *
     * @return string
     */
    public static function get_shortcode_out( $atts = array(), $content = null ) {
        $atts = shortcode_atts(
            array(
                'awb_type'                      => '', // color, image, yt_vm_video, video.

                'awb_stretch'                   => 'false',

                'awb_color'                     => '',
                'awb_image'                     => '',
                'awb_video'                     => '',

                'awb_image_size'                => 'full',
                'awb_image_background_size'     => 'cover',
                'awb_image_background_position' => '50% 50%',

                'awb_video_mp4'                 => '',
                'awb_video_webm'                => '',
                'awb_video_ogv'                 => '',
                'awb_video_start_time'          => 0,
                'awb_video_end_time'            => 0,
                'awb_video_volume'              => 0,
                'awb_video_always_play'         => 'false',
                'awb_video_mobile'              => 'false',

                'awb_parallax'                  => 'false', // scroll, scale, opacity, scroll-opacity, scale-opacity.
                'awb_parallax_speed'            => 0.5,
                'awb_parallax_mobile'           => 'false',

                'awb_mouse_parallax'            => 'false',
                'awb_mouse_parallax_size'       => 30, // pixels.
                'awb_mouse_parallax_speed'      => 10000, // ms.

                'awb_after_vc_row'              => 'false',
                'awb_after_vc_column'           => 'false',

                'awb_class'                     => '',
                'awb_styles'                    => '',
                'vc_css'                        => '',
            ),
            $atts
        );

        // prevent if no valid type.
        if ( 'color' !== $atts['awb_type'] && 'image' !== $atts['awb_type'] && 'yt_vm_video' !== $atts['awb_type'] && 'video' !== $atts['awb_type'] ) {
            return '';
        }

        // enqueue styles and scripts.
        self::enqueue_front_assets();

        // prepare attributes and styles.
        $atts['awb_class']    = 'nk-awb ' . $atts['awb_class'];
        $awb_attributes       = '';
        $awb_wrap_attributes  = 'data-awb-type="' . esc_attr( $atts['awb_type'] ) . '"';
        $awb_inner_styles     = '';
        $awb_inner_attributes = '';

        // stretch.
        if ( filter_var( $atts['awb_stretch'], FILTER_VALIDATE_BOOLEAN ) ) {
            $awb_wrap_attributes .= ' data-awb-stretch="true"';
        }

        // after vc_row.
        if ( filter_var( $atts['awb_after_vc_row'], FILTER_VALIDATE_BOOLEAN ) ) {
            $atts['awb_class'] .= ' nk-awb-after-vc_row';
        }

        // after vc_column.
        if ( filter_var( $atts['awb_after_vc_column'], FILTER_VALIDATE_BOOLEAN ) ) {
            $atts['awb_class'] .= ' nk-awb-after-vc_column';
        }

        // nk_awb shortcode with custom css from VC.
        if ( function_exists( 'vc_shortcode_custom_css_class' ) && isset( $atts['vc_css'] ) ) {
            $atts['awb_class'] .= ' ' . vc_shortcode_custom_css_class( $atts['vc_css'] );
        }

        // overlay color.
        $awb_overlay_html = '';
        if ( isset( $atts['awb_color'] ) && $atts['awb_color'] ) {
            $awb_overlay_html .= '<div class="nk-awb-overlay" style="background-color: ' . esc_attr( $atts['awb_color'] ) . ';"></div>';
        }

        // types.
        $awb_inner_html = '';
        if ( isset( $atts['awb_image'] ) && $atts['awb_image'] && ( 'image' === $atts['awb_type'] || 'yt_vm_video' === $atts['awb_type'] || 'video' === $atts['awb_type'] ) ) {
            if ( is_numeric( $atts['awb_image'] ) && 'pattern' !== $atts['awb_image_background_size'] ) {
                $awb_inner_html .= wp_get_attachment_image(
                    $atts['awb_image'],
                    $atts['awb_image_size'],
                    false,
                    array(
                        'class' => 'jarallax-img',
                        'style' => 'object-position: ' . $atts['awb_image_background_position'] . ';',
                    )
                );
            } else {
                if ( is_numeric( $atts['awb_image'] ) ) {
                    $atts['awb_image'] = wp_get_attachment_image_url( $atts['awb_image'], $atts['awb_image_size'] );
                }
                $awb_inner_styles .= 'background-image: url(\'' . esc_url( $atts['awb_image'] ) . '\');';
                $awb_inner_styles .= 'background-position: ' . esc_attr( $atts['awb_image_background_position'] ) . ';';
            }
        }

        // data image background attributes.
        if ( $atts['awb_image_background_size'] ) {
            $awb_wrap_attributes .= ' data-awb-image-background-size="' . esc_attr( $atts['awb_image_background_size'] ) . '"';
        }
        if ( $atts['awb_image_background_position'] ) {
            $awb_wrap_attributes .= ' data-awb-image-background-position="' . esc_attr( $atts['awb_image_background_position'] ) . '"';
        }

        if ( 'yt_vm_video' === $atts['awb_type'] ) {
            $awb_wrap_attributes .= ' data-awb-video="' . esc_attr( $atts['awb_video'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-start-time="' . esc_attr( $atts['awb_video_start_time'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-end-time="' . esc_attr( $atts['awb_video_end_time'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-volume="' . esc_attr( $atts['awb_video_volume'] ) . '"';

            // video always play.
            if ( filter_var( $atts['awb_video_always_play'], FILTER_VALIDATE_BOOLEAN ) ) {
                $awb_wrap_attributes .= ' data-awb-video-always-play="true"';
            }
        }
        if ( 'video' === $atts['awb_type'] ) {
            $videos = '';
            if ( isset( $atts['awb_video_mp4'] ) && $atts['awb_video_mp4'] ) {
                if ( is_numeric( $atts['awb_video_mp4'] ) ) {
                    $atts['awb_video_mp4'] = wp_get_attachment_url( $atts['awb_video_mp4'] );
                }
                if ( $atts['awb_video_mp4'] ) {
                    $videos .= 'mp4:' . esc_url( $atts['awb_video_mp4'] );
                }
            }
            if ( isset( $atts['awb_video_webm'] ) && $atts['awb_video_webm'] ) {
                if ( is_numeric( $atts['awb_video_webm'] ) ) {
                    $atts['awb_video_webm'] = wp_get_attachment_url( $atts['awb_video_webm'] );
                }
                if ( $atts['awb_video_webm'] ) {
                    if ( $videos ) {
                        $videos .= ',';
                    }
                    $videos .= 'webm:' . esc_url( $atts['awb_video_webm'] );
                }
            }
            if ( isset( $atts['awb_video_ogv'] ) && $atts['awb_video_ogv'] ) {
                if ( is_numeric( $atts['awb_video_ogv'] ) ) {
                    $atts['awb_video_ogv'] = wp_get_attachment_url( $atts['awb_video_ogv'] );
                }
                if ( $atts['awb_video_ogv'] ) {
                    if ( $videos ) {
                        $videos .= ',';
                    }
                    $videos .= 'ogv:' . esc_url( $atts['awb_video_ogv'] );
                }
            }
            $awb_wrap_attributes .= ' data-awb-video="' . esc_attr( $videos ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-start-time="' . esc_attr( $atts['awb_video_start_time'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-end-time="' . esc_attr( $atts['awb_video_end_time'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-video-volume="' . esc_attr( $atts['awb_video_volume'] ) . '"';

            // video always play.
            if ( filter_var( $atts['awb_video_always_play'], FILTER_VALIDATE_BOOLEAN ) ) {
                $awb_wrap_attributes .= ' data-awb-video-always-play="true"';
            }
        }

        // show video on mobile.
        if ( 'video' === $atts['awb_type'] || 'yt_vm_video' === $atts['awb_type'] ) {
            $awb_wrap_attributes .= ' data-awb-video-mobile="' . esc_attr( $atts['awb_video_mobile'] ) . '"';
        }

        // parallax.
        if ( 'scroll' === $atts['awb_parallax'] || 'scale' === $atts['awb_parallax'] || 'opacity' === $atts['awb_parallax'] || 'scroll-opacity' === $atts['awb_parallax'] || 'scale-opacity' === $atts['awb_parallax'] ) {
            $awb_wrap_attributes .= ' data-awb-parallax="' . esc_attr( $atts['awb_parallax'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-parallax-speed="' . esc_attr( $atts['awb_parallax_speed'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-parallax-mobile="' . esc_attr( $atts['awb_parallax_mobile'] ) . '"';
        }

        // mouse parallax.
        if ( $atts['awb_mouse_parallax'] && 'false' !== $atts['awb_mouse_parallax'] ) {
            $awb_wrap_attributes .= ' data-awb-mouse-parallax-size="' . esc_attr( $atts['awb_mouse_parallax_size'] ) . '"';
            $awb_wrap_attributes .= ' data-awb-mouse-parallax-speed="' . esc_attr( $atts['awb_mouse_parallax_speed'] ) . '"';
        }

        // outer styles.
        if ( $atts['awb_styles'] ) {
            $awb_attributes .= ' style="' . esc_attr( $atts['awb_styles'] ) . '"';
        }

        // inner styles.
        $awb_inner_attributes .= ' class="nk-awb-inner"';
        if ( $awb_inner_styles ) {
            $awb_inner_attributes .= ' style="' . $awb_inner_styles . '"';
        }

        // classes.
        $awb_wrap_attributes = 'class="nk-awb-wrap" ' . $awb_wrap_attributes;

        return '<div class="' . esc_attr( $atts['awb_class'] ) . '" ' . $awb_attributes . '>'
                    . do_shortcode( $content )
                    . '<div ' . $awb_wrap_attributes . '>'
                        . $awb_overlay_html
                        . '<div ' . $awb_inner_attributes . '>' . $awb_inner_html . '</div>'
                    . '</div>'
                . '</div>';
    }
}

