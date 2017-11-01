<?php
/**
 * AWB Shortcode Class
 */

if (!class_exists('nK_AWB_Shortcode')) :
    class nK_AWB_Shortcode {
        /**
         * The single class instance.
         */
        private static $_instance = null;

        /**
         * Main Instance
         * Ensures only one instance of this class exists in memory at any one time.
         */
        public static function instance () {
            if ( is_null( self::$_instance ) ) {
                self::$_instance = new self();
                self::$_instance->init_options();
            }
            return self::$_instance;
        }

        public function __construct () {
            /* We do nothing here! */
        }

        public function init_options () {
            // add shortcode
            add_shortcode('nk_awb', array($this, 'get_shortcode_out'));
        }

        /**
         * Scripts enqueued flag
         *
         * @var bool
         */
        static private $scripts_enqueued = false;

        /**
         * Enqueue styles and scripts
         */
        static function enqueue_front_assets () {
            if ( self::$scripts_enqueued ) {
                return;
            }
            self::$scripts_enqueued = true;

            wp_enqueue_script( 'nk-awb' );
            wp_enqueue_style( 'nk-awb' );
        }

        /**
         * Shortcode Output
         */
        public function get_shortcode_out ($atts = array(), $content = null) {
            extract(shortcode_atts(array(
                "awb_type"              => "", // color, image, yt_vm_video, video

                "awb_stretch"           => "false",

                "awb_color"             => "",
                "awb_image"             => "",
                "awb_video"             => "",

                "awb_image_size"        => "full",

                "awb_video_mp4"         => "",
                "awb_video_webm"        => "",
                "awb_video_ogv"         => "",
                "awb_video_start_time"  => "",
                "awb_video_end_time"    => "",

                "awb_parallax"          => "false", // scroll, scale, opacity, scroll-opacity, scale-opacity
                "awb_parallax_speed"    => 0.5,
                "awb_parallax_mobile"   => "false",

                "awb_mouse_parallax"    => "false",
                "awb_mouse_parallax_size" => 30, // pixels
                "awb_mouse_parallax_speed" => 10000, // ms

                "awb_after_vc_row"      => "false",
                "awb_after_vc_column"   => "false",

                "awb_class"             => "",
                "awb_styles"            => "",
            ), $atts));

            // prevent if no valid type
            if ($awb_type != 'color' && $awb_type != 'image' && $awb_type != 'yt_vm_video' && $awb_type != 'video') {
                return '';
            }

            // enqueue styles and scripts
            self::enqueue_front_assets();

            // prepare attributes and styles
            $awb_class = 'nk-awb ' . $awb_class;
            $awb_attributes = '';
            $awb_wrap_attributes = 'data-awb-type="' . esc_attr($awb_type) . '"';
            $awb_inner_styles = '';
            $awb_inner_attributes = '';

            // stretch
            if (filter_var($awb_stretch, FILTER_VALIDATE_BOOLEAN)) {
                $awb_wrap_attributes .= ' data-awb-stretch="true"';
            }

            // after vc_row
            if (filter_var($awb_after_vc_row, FILTER_VALIDATE_BOOLEAN)) {
                $awb_class .= ' nk-awb-after-vc_row';
            }

            // after vc_column
            if (filter_var($awb_after_vc_column, FILTER_VALIDATE_BOOLEAN)) {
                $awb_class .= ' nk-awb-after-vc_column';
            }

            // nk_awb shortcode with custom css from VC
            if (function_exists('vc_shortcode_custom_css_class') && isset($atts['vc_css'])) {
                $awb_class .= ' ' . vc_shortcode_custom_css_class($atts['vc_css']);
            }

            // overlay color
            $awb_overlay_html = '';
            if (isset($awb_color) && $awb_color) {
                $awb_overlay_html .= '<div class="nk-awb-overlay" style="background-color: ' . esc_attr($awb_color) . ';"></div>';
            }

            // types
            $awb_inner_html = '';
            if ($awb_type === 'image' || $awb_type === 'yt_vm_video' || $awb_type === 'video') {
                if (is_numeric($awb_image)) {
                    $awb_inner_html .= wp_get_attachment_image($awb_image, $awb_image_size, false, array(
                        'class' => 'jarallax-img'
                    ));
                } else if (isset($awb_image) && $awb_image) {
                    $awb_wrap_attributes .= ' data-awb-image="' . esc_url($awb_image) . '"';
                    $awb_inner_styles .= 'background-image: url(\'' . esc_url($awb_image) . '\');';
                }
            }
            if ($awb_type === 'yt_vm_video') {
                $awb_wrap_attributes .= ' data-awb-video="' . esc_attr($awb_video) . '"';
                $awb_wrap_attributes .= ' data-awb-video-start-time="' . esc_attr($awb_video_start_time) . '"';
                $awb_wrap_attributes .= ' data-awb-video-end-time="' . esc_attr($awb_video_end_time) . '"';
            }
            if ($awb_type === 'video') {
                $videos = '';
                if (isset($awb_video_mp4) && $awb_video_mp4) {
                    if (is_numeric($awb_video_mp4)) {
                        $awb_video_mp4 = wp_get_attachment_url($awb_video_mp4);
                    }
                    if ($awb_video_mp4) {
                        $videos .= 'mp4:' . esc_url($awb_video_mp4);
                    }
                }
                if (isset($awb_video_webm) && $awb_video_webm) {
                    if (is_numeric($awb_video_webm)) {
                        $awb_video_webm = wp_get_attachment_url($awb_video_webm);
                    }
                    if ($awb_video_webm) {
                        if ($videos) {
                            $videos .= ',';
                        }
                        $videos .= 'webm:' . esc_url($awb_video_webm);
                    }
                }
                if (isset($awb_video_ogv) && $awb_video_ogv) {
                    if (is_numeric($awb_video_ogv)) {
                        $awb_video_ogv = wp_get_attachment_url($awb_video_ogv);
                    }
                    if ($awb_video_ogv) {
                        if ($videos) {
                            $videos .= ',';
                        }
                        $videos .= 'ogv:' . esc_url($awb_video_ogv);
                    }
                }
                $awb_wrap_attributes .= ' data-awb-video="' . esc_attr($videos) . '"';
                $awb_wrap_attributes .= ' data-awb-video-start-time="' . esc_attr($awb_video_start_time) . '"';
                $awb_wrap_attributes .= ' data-awb-video-end-time="' . esc_attr($awb_video_end_time) . '"';
            }

            // parallax
            if ($awb_parallax == 'scroll' || $awb_parallax == 'scale' || $awb_parallax == 'opacity' || $awb_parallax == 'scroll-opacity' || $awb_parallax == 'scale-opacity') {
                $awb_wrap_attributes .= ' data-awb-parallax="' . esc_attr($awb_parallax) . '"';
                $awb_wrap_attributes .= ' data-awb-parallax-speed="' . esc_attr($awb_parallax_speed) . '"';
                $awb_wrap_attributes .= ' data-awb-parallax-mobile="' . esc_attr($awb_parallax_mobile) . '"';
            }

            // mouse parallax
            if ($awb_mouse_parallax && $awb_mouse_parallax !== 'false') {
                $awb_wrap_attributes .= ' data-awb-mouse-parallax-size="' . esc_attr($awb_mouse_parallax_size) . '"';
                $awb_wrap_attributes .= ' data-awb-mouse-parallax-speed="' . esc_attr($awb_mouse_parallax_speed) . '"';
            }

            // outer styles
            if ($awb_styles) {
                $awb_attributes .= ' style="' . esc_attr($awb_styles) . '"';
            }

            // inner styles
            $awb_inner_attributes .= ' class="nk-awb-inner"';
            if ($awb_inner_styles) {
                $awb_inner_attributes .= ' style="' . $awb_inner_styles . '"';
            }

            // classes
            $awb_wrap_attributes = 'class="nk-awb-wrap" ' . $awb_wrap_attributes;

            return '<div class="' . esc_attr($awb_class) . '" ' . $awb_attributes . '>'
                        . do_shortcode($content)
                        . '<div ' . $awb_wrap_attributes . '>'
                            . $awb_overlay_html
                            . '<div ' . $awb_inner_attributes . '>' . $awb_inner_html . '</div>'
                        . '</div>'
                    . '</div>';
        }
    }
endif;

