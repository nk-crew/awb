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
        if ( function_exists( 'register_block_type_from_metadata' ) ) {
            $this->init_hooks();
        }
    }

    /**
     * Init Hooks
     */
    public function init_hooks() {
        add_action( 'enqueue_block_assets', array( $this, 'enqueue_block_assets' ) );
        add_action( 'init', array( $this, 'register_block' ) );
        add_action( 'init', array( $this, 'register_attribute' ) );
    }

    /**
     * Enqueue block assets
     */
    public function enqueue_block_assets() {
        $js_deps  = array( 'wp-i18n', 'wp-element', 'wp-components', 'wp-block-editor', 'lodash', 'jquery', 'jarallax', 'jarallax-video' );
        $css_deps = array();

        // enqueue block js.
        wp_register_script(
            'awb-gutenberg',
            nk_awb()->plugin_url . 'assets/admin/gutenberg/index.min.js',
            $js_deps,
            filemtime( nk_awb()->plugin_path . 'assets/admin/gutenberg/index.min.js' ),
            true
        );

        // enqueue block css.
        wp_register_style(
            'awb-gutenberg',
            nk_awb()->plugin_url . 'assets/admin/gutenberg/editor.min.css',
            $css_deps,
            filemtime( nk_awb()->plugin_path . 'assets/admin/gutenberg/editor.min.css' )
        );

        // add variables to script.
        $data = array(
            'placeholder_url'     => nk_awb()->plugin_url . 'assets/images/placeholder.jpg',
            'full_width_fallback' => ! ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() || get_theme_support( 'align-wide' ) ),
            'is_ghostkit_active'  => class_exists( 'GhostKit' ),
        );
        wp_localize_script( 'awb-gutenberg', 'AWBGutenbergData', $data );
    }

    /**
     * Enqueue admin scripts hook
     */
    public function register_block() {
        // register block.
        register_block_type_from_metadata(
            nk_awb()->plugin_path . 'assets/admin/gutenberg',
            array(
                'render_callback' => array( $this, 'render_block' ),
            )
        );

        // Register the block support.
        WP_Block_Supports::get_instance()->register(
            'awb',
            array(
                'register_attribute' => array( $this, 'register_attribute' ),
            )
        );
    }

    /**
     * Renders the block on server.
     * Adds Featured Image when useFeaturedImage is true.
     *
     * @param array  $attributes The block attributes.
     * @param string $content    The block rendered content.
     *
     * @return string
     */
    public function render_block( $attributes, $content ) {
        if ( 'image' !== $attributes['type'] || false === $attributes['useFeaturedImage'] ) {
            return $content;
        }

        $regex = '/<div class="nk-awb-inner"[^>]*(>)/';

        preg_match( $regex, $content, $matches, PREG_OFFSET_CAPTURE );

        if ( ! isset( $matches[0][0] ) ) {
            return $content;
        }

        $post     = get_post();
        $thumb_id = get_post_thumbnail_id( $post );

        if ( ! $thumb_id ) {
            return $content;
        }

        if ( in_the_loop() ) {
            update_post_thumbnail_cache();
        }

        $image = wp_get_attachment_image(
            $thumb_id,
            $attributes['imageSize'] ?? 'full',
            false,
            array(
                'class' => 'wp-image-' . esc_attr( $thumb_id ) . ' jarallax-img',
            )
        );

        if ( ! $image ) {
            return $content;
        }

        $content = preg_replace( $regex, $matches[0][0] . $image, $content, 1 );

        return $content;
    }

    /**
     * Registers the `awb` block attribute for block types that support it.
     *
     * @param WP_Block_Type $block_type Block Type.
     */
    public function register_attribute( $block_type ) {
        $has_awb_support = block_has_support( $block_type, array( 'awb' ), false );

        if ( ! $has_awb_support ) {
            return;
        }

        $awb_block_type = WP_Block_Type_Registry::get_instance()->get_registered( 'nk/awb' );

        $skip_attributes = array( 'lock', 'ghostkit', 'ghostkitId', 'ghostkitClassname', 'ghostkitStyles', 'ghostkitSR', 'ghostkitCustomCSS', 'ghostkitPosition', 'ghostkitSpacings', 'ghostkitFrame', 'className', 'style', 'layout', 'fontSize', 'fontFamily' );

        // Add all AWB attributes to the block.
        if ( ! empty( $awb_block_type->attributes ) ) {
            if ( ! $block_type->attributes ) {
                $block_type->attributes = array();
            }

            foreach ( $awb_block_type->attributes as $name => $val ) {
                if ( ! in_array( $name, $skip_attributes, true ) ) {
                    $block_type->attributes[ 'awb_' . $name ] = $val;
                }
            }
        }
    }
}
