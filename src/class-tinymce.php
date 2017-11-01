<?php
/**
 * Extend TinyMCE toolbar
 */

if (!class_exists('nK_AWB_TinyMCE')) :
    class nK_AWB_TinyMCE {
        /**
         * The single class instance.
         */
        private static $_instance = null;

        /**
         * Main Instance
         * Ensures only one instance of this class exists in memory at any one time.
         */
        public static function instance() {
            if ( is_null( self::$_instance ) ) {
                self::$_instance = new self();
                self::$_instance->init_hooks();
            }

            return self::$_instance;
        }

        public function __construct() {
            /* We do nothing here! */
        }

        public function init_hooks () {
            add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
            add_action('admin_head', array($this, 'admin_head'));
        }

        public function admin_head () {
            if (current_user_can('edit_posts') && current_user_can('edit_pages')) {
                add_filter('mce_external_plugins', array($this ,'mce_external_plugins'));
                add_filter('mce_buttons', array($this, 'mce_buttons'));
            }
        }

        public function admin_enqueue_scripts ($page) {
            if ($page == "post.php" || $page == "post-new.php") {
                wp_enqueue_media();
                wp_enqueue_style('awb-tinymce', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-button.css');
                wp_enqueue_style('wp-color-picker');
                wp_enqueue_script('wp-color-picker');
                wp_enqueue_script('wp-color-picker-alpha', nk_awb()->plugin_url . 'assets/vendor/wp-color-picker-alpha.min.js', array('wp-color-picker'), '1.2.2');
                wp_enqueue_script('conditionize', nk_awb()->plugin_url . 'assets/vendor/conditionize.js');

                wp_enqueue_style('awb-tinymce-attach-video', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-video.css');
                wp_enqueue_script('awb-tinymce-attach-video', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-video.js');

                wp_enqueue_style('awb-tinymce-attach-image', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-image.css');
                wp_enqueue_script('awb-tinymce-attach-image', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-image.js');

                // add tiny mce data
                $dataTinyMCE = array(
                    'imageSizes' => self::getImageSizes()
                );
                wp_enqueue_script('awb-tinymce-localize', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-localize.js');
                wp_localize_script('awb-tinymce-localize', 'AWB_TinyMCE_Options', $dataTinyMCE);
            }
        }

        /**
         * Adds tinymce plugin
         */
        public function mce_external_plugins( $plugin_array ) {
            $plugin_array['awb'] = nk_awb()->plugin_url . 'assets/admin/tinymce/mce-button.js';
            return $plugin_array;
        }

        /**
         * Adds tinymce button
         */
        function mce_buttons( $buttons ) {
            array_push($buttons, 'awb');
            return $buttons;
        }

        /**
         * Get Available Image Sizes + full
         */
        static function getImageSizes () {
            $sizes = get_intermediate_image_sizes();
            array_unshift($sizes, 'full');

            $result = array();

            foreach ($sizes as $size) {
                $result[$size] = $size;
            }
            return $result;
        }
    }
endif;