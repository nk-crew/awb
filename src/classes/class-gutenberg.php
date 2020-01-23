<?php
/**
 * Gutenberg blocks
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class NK_AWB_Gutenberg
 */
class NK_AWB_Gutenberg {
    /**
     * NK_AWB_Gutenberg constructor.
     */
    public function __construct() {
        // work only if Gutenberg available.
        if ( function_exists( 'register_block_type' ) ) {
            $this->init_hooks();
        }
    }

    /**
     * Init Hooks
     */
    public function init_hooks() {
        add_action( 'init', array( $this, 'register_block' ) );
    }

    /**
     * Enqueue admin scripts hook
     */
    public function register_block() {
        $deps = array( 'wp-editor', 'wp-i18n', 'wp-element', 'underscore', 'jquery', 'jarallax', 'jarallax-video' );

        // enqueue block js.
        wp_register_script(
            'awb-gutenberg',
            nk_awb()->plugin_url . 'assets/admin/gutenberg/index.min.js',
            $deps,
            filemtime( nk_awb()->plugin_path . 'assets/admin/gutenberg/index.min.js' ),
            true
        );

        // register block.
        register_block_type(
            'nk/awb',
            array(
                'editor_script' => 'awb-gutenberg',
                'script'        => 'nk-awb',
                'style'         => 'nk-awb',
            )
        );

        // add variables to script.
        $data = array(
            'full_width_fallback' => ! get_theme_support( 'align-wide' ),
            'is_ghostkit_active'  => class_exists( 'GhostKit' ),
        );
        wp_localize_script( 'awb-gutenberg', 'AWBGutenbergData', $data );
    }
}
