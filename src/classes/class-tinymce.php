<?php
/**
 * Extend TinyMCE toolbar
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class NK_AWB_TinyMCE
 */
class NK_AWB_TinyMCE {
    /**
     * NK_AWB_TinyMCE constructor.
     */
    public function __construct() {
        $this->init_hooks();
    }

    /**
     * Init Hooks
     */
    public function init_hooks() {
        add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ) );
        add_action( 'admin_head', array( $this, 'admin_head' ) );
    }

    /**
     * Admin head action
     */
    public function admin_head() {
        if ( current_user_can( 'edit_posts' ) && current_user_can( 'edit_pages' ) ) {
            add_filter( 'mce_external_plugins', array( $this, 'mce_external_plugins' ) );
            add_filter( 'mce_buttons', array( $this, 'mce_buttons' ) );
        }
    }

    /**
     * Enqueue admin scripts hook
     *
     * @param object $page - page data.
     */
    public function admin_enqueue_scripts( $page ) {
        if ( 'post.php' === $page || 'post-new.php' === $page ) {
            wp_enqueue_media();
            wp_enqueue_style( 'awb-tinymce', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-button.min.css', '', '@@plugin_version' );
            wp_enqueue_style( 'wp-color-picker' );
            wp_enqueue_script( 'wp-color-picker' );
            wp_enqueue_script( 'wp-color-picker-alpha', nk_awb()->plugin_url . 'assets/vendor/wp-color-picker-alpha/wp-color-picker-alpha.min.js', array( 'wp-color-picker' ), '2.0.0' );
            wp_enqueue_script( 'conditionize', nk_awb()->plugin_url . 'assets/vendor/conditionize/conditionize.min.js', array( 'jquery' ), '1.0.1' );

            wp_enqueue_style( 'awb-tinymce-attach-video', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-video.min.css', '', '@@plugin_version' );
            wp_enqueue_script( 'awb-tinymce-attach-video', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-video.min.js', '', '@@plugin_version' );

            wp_enqueue_style( 'awb-tinymce-attach-image', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-image.min.css', '', '@@plugin_version' );
            wp_enqueue_script( 'awb-tinymce-attach-image', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-awb-attach-image.min.js', '', '@@plugin_version' );

            // add tiny mce data.
            $data_tiny_mce = array(
                'imageSizes' => self::get_image_sizes(),
            );
            wp_enqueue_script( 'awb-tinymce-localize', nk_awb()->plugin_url . 'assets/admin/tinymce/mce-localize.min.js', '', '@@plugin_version' );
            wp_localize_script( 'awb-tinymce-localize', 'AWBTinyMCEOptions', $data_tiny_mce );
        }
    }

    /**
     * Adds tinymce plugin
     *
     * @param array $plugin_array - plugins array.
     *
     * @return array
     */
    public function mce_external_plugins( $plugin_array ) {
        $plugin_array['awb'] = nk_awb()->plugin_url . 'assets/admin/tinymce/mce-button.min.js';
        return $plugin_array;
    }

    /**
     * Adds tinymce button
     *
     * @param array $buttons - plugins array.
     *
     * @return array
     */
    public function mce_buttons( $buttons ) {
        array_push( $buttons, 'awb' );
        return $buttons;
    }

    /**
     * Get Available Image Sizes + full
     */
    public static function get_image_sizes() {
        // @codingStandardsIgnoreLine
        $sizes = get_intermediate_image_sizes();
        array_unshift( $sizes, 'full' );

        $result = array();

        foreach ( $sizes as $size ) {
            $result[ $size ] = $size;
        }
        return $result;
    }
}
