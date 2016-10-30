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
         * Enqueue styles and scripts
         */
        static function enqueue_front_assets () {
            wp_enqueue_script('jarallax', nk_awb()->plugin_url . 'assets/jarallax/jarallax.min.js', array('jquery'), '', true);
            wp_enqueue_script('jarallax-video', nk_awb()->plugin_url . 'assets/jarallax/jarallax-video.min.js', array('jquery'), '', true);
            wp_enqueue_script('nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.js', array('jarallax'), '', true);
            wp_enqueue_style('nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.css');
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

                "awb_after_vc_row"      => "false",

                "awb_class"             => "",
            ), $atts));

            // prevent if no valid type
            if ($awb_type != 'color' && $awb_type != 'image' && $awb_type != 'yt_vm_video' && $awb_type != 'video') {
                return '';
            }

            // enqueue styles and scripts
            self::enqueue_front_assets();

            // prepare attributes and styles
            $awb_class = 'nk-awb ' . $awb_class;
            $awb_inner_attributes = 'data-awb-type="' . esc_attr($awb_type) . '"';
            $awb_inner_styles = '';

            // stretch
            if (filter_var($awb_stretch, FILTER_VALIDATE_BOOLEAN)) {
                $awb_inner_attributes .= ' data-awb-stretch="true"';
            }

            // after vc_row
            if (filter_var($awb_after_vc_row, FILTER_VALIDATE_BOOLEAN)) {
                $awb_class .= ' nk-awb-after-vc_row';
            }

            // overlay color
            $awb_overlay = '';
            if (isset($awb_color) && $awb_color) {
                $awb_overlay = '<div class="nk-awb-overlay" style="background-color: ' . esc_attr($awb_color) . ';"></div>';
            }

            // types
            if ($awb_type === 'image' || $awb_type === 'yt_vm_video' || $awb_type === 'video') {
                $imgWidth = '';
                $imgHeight = '';
                if (is_numeric($awb_image)) {
                    $awb_image = wp_get_attachment_image_src($awb_image, $awb_image_size);

                    if($awb_image && isset($awb_image[0])) {
                        $imgWidth = isset($awb_image[1]) ? $awb_image[1] : '';
                        $imgHeight = isset($awb_image[2]) ? $awb_image[2] : '';
                        $awb_image = $awb_image[0];
                    } else {
                        $awb_image = false;
                    }
                }
                if (isset($awb_image) && $awb_image) {
                    $awb_inner_attributes .= ' data-awb-image="' . esc_url($awb_image) . '"';
                    $awb_inner_attributes .= ' data-awb-image-width="' . esc_attr($imgWidth) . '"';
                    $awb_inner_attributes .= ' data-awb-image-height="' . esc_attr($imgHeight) . '"';
                    $awb_inner_styles .= 'background-image: url("' . esc_url($awb_image) . '");';
                }
            }
            if ($awb_type === 'yt_vm_video') {
                $awb_inner_attributes .= ' data-awb-video="' . esc_attr($awb_video) . '"';
                $awb_inner_attributes .= ' data-awb-video-start-time="' . esc_attr($awb_video_start_time) . '"';
                $awb_inner_attributes .= ' data-awb-video-end-time="' . esc_attr($awb_video_end_time) . '"';
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
                $awb_inner_attributes .= ' data-awb-video="' . esc_attr($videos) . '"';
                $awb_inner_attributes .= ' data-awb-video-start-time="' . esc_attr($awb_video_start_time) . '"';
                $awb_inner_attributes .= ' data-awb-video-end-time="' . esc_attr($awb_video_end_time) . '"';
            }

            // parallax
            if ($awb_parallax == 'scroll' || $awb_parallax == 'scale' || $awb_parallax == 'opacity' || $awb_parallax == 'scroll-opacity' || $awb_parallax == 'scale-opacity') {
                $awb_inner_attributes .= ' data-awb-parallax="' . esc_attr($awb_parallax). '"';
                $awb_inner_attributes .= ' data-awb-parallax-speed="' . esc_attr($awb_parallax_speed). '"';
                $awb_inner_attributes .= ' data-awb-parallax-mobile="' . esc_attr($awb_parallax_mobile). '"';
            }

            // styles
            if ($awb_inner_styles) {
                $awb_inner_attributes .= ' style="' . esc_attr($awb_inner_styles) . '"';
            }

            // classes
            $awb_inner_attributes = 'class="nk-awb-inner" ' . $awb_inner_attributes;

            return '<div class="' . esc_attr($awb_class) . '">' . do_shortcode($content) . '<div ' . $awb_inner_attributes . '>' . $awb_overlay . '</div></div>';
        }
    }
endif;

