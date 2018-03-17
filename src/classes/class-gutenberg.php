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
     *
     * @param object $page - page data.
     */
    public function register_block( $page ) {
        // enqueue block js.
        wp_register_script(
            'awb-gutenberg',
            nk_awb()->plugin_url . 'assets/admin/gutenberg/block.min.js',
            array( 'wp-blocks', 'wp-i18n', 'wp-element', 'underscore' ),
            filemtime( nk_awb()->plugin_path . 'assets/admin/gutenberg/block.min.js' )
        );

        // enqueue block css.
        wp_register_style(
            'awb-gutenberg',
            nk_awb()->plugin_url . 'assets/admin/gutenberg/block-editor.min.css',
            array( 'wp-edit-blocks' ),
            filemtime( nk_awb()->plugin_path . 'assets/admin/gutenberg/block-editor.min.css' )
        );

        // register block.
        register_block_type( 'nk/awb', array(
            'editor_script' => 'awb-gutenberg',
            'editor_style'  => 'awb-gutenberg',
            'script' => 'nk-awb',
            'style'  => 'nk-awb',
        ) );

        // add variables to script.
        $data = array(
            'icon' => nk_awb()->plugin_url . 'assets/admin/gutenberg/icon.png',
        );
        wp_localize_script( 'awb-gutenberg', 'AWBGutenbergData', $data );
    }
}
