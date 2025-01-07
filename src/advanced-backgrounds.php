<?php
/**
 * Plugin Name:  Advanced WordPress Backgrounds
 * Description:  Parallax, Video, Images Backgrounds
 * Version:      @@plugin_version
 * Author:       Advanced WordPress Backgrounds Team
 * Author URI:   https://wpbackgrounds.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=byline
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  @@text_domain
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}


/**
 * Class NK_AWB
 */
class NK_AWB {
    /**
     * The single class instance.
     *
     * @var $instance
     */
    private static $instance = null;

    /**
     * Main Instance
     * Ensures only one instance of this class exists in memory at any one time.
     */
    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
            self::$instance->init();
        }
        return self::$instance;
    }

    /**
     * Path to the plugin directory
     *
     * @var $plugin_path
     */
    public $plugin_path;

    /**
     * URL to the plugin directory
     *
     * @var $plugin_url
     */
    public $plugin_url;

    /**
     * NK_AWB constructor.
     */
    public function __construct() {
        /* We do nothing here! */
    }

    /**
     * Init
     */
    public function init() {
        $this->plugin_path = plugin_dir_path( __FILE__ );
        $this->plugin_url  = plugin_dir_url( __FILE__ );

        // include helper files.
        $this->include_dependencies();

        // init classes.
        new NK_AWB_Rest();
        new NK_AWB_Shortcode();
        new NK_AWB_VC_Extend();
        new NK_AWB_TinyMCE();
        new NK_AWB_Gutenberg();

        // Hooks.
        add_action( 'init', array( $this, 'init_hook' ) );
        add_action( 'init', array( $this, 'register_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        add_action( 'ghostkit_parse_blocks', array( $this, 'parse_ghostkit_blocks' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'fix_youtube_embed_plus_plugin' ), 101 );
    }

    /**
     * Init hook
     */
    public function init_hook() {
        // register images sizes.
        $this->add_image_sizes();

        // load textdomain.
        load_plugin_textdomain( '@@text_domain', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
    }

    /**
     * Register scripts that will be used in the future when portfolio will be printed.
     */
    public function register_scripts() {
        wp_register_script( 'jarallax', nk_awb()->plugin_url . 'assets/vendor/jarallax/dist/jarallax.min.js', array(), '2.2.1', true );
        wp_register_script( 'jarallax-video', nk_awb()->plugin_url . 'assets/vendor/jarallax/dist/jarallax-video.min.js', array( 'jarallax' ), '2.2.1', true );
        wp_register_script( 'awb', nk_awb()->plugin_url . 'assets/awb/awb.min.js', array( 'jarallax', 'jarallax-video' ), '@@plugin_version', true );

        wp_localize_script(
            'awb',
            'AWB',
            array(
                'version'  => '@@plugin_version',
                'settings' => array(
                    'disable_parallax'    => array_keys( AWB_Settings::get_option( 'disable_parallax', 'awb_general', array() ) ? AWB_Settings::get_option( 'disable_parallax', 'awb_general', array() ) : array() ),
                    'disable_video'       => array_keys( AWB_Settings::get_option( 'disable_video', 'awb_general', array() ) ? AWB_Settings::get_option( 'disable_video', 'awb_general', array() ) : array() ),
                    'full_width_fallback' => ! ( function_exists( 'wp_is_block_theme' ) && wp_is_block_theme() || get_theme_support( 'align-wide' ) ),
                ),
            )
        );

        wp_register_style( 'awb', nk_awb()->plugin_url . 'assets/awb/awb.min.css', array(), '@@plugin_version' );
    }

    /**
     * Enqueue scripts.
     */
    public function enqueue_scripts() {
        // add styles to header to fix image jumping when use shortcode.
        wp_enqueue_style( 'awb' );
    }

    /**
     * Enqueue awb assets when used Ghost Kit grid or Column.
     *
     * @param array $blocks - block list.
     */
    public function parse_ghostkit_blocks( $blocks ) {
        foreach ( $blocks as $block ) {
            if ( 'ghostkit/grid-column' === $block['blockName'] || 'ghostkit/grid' === $block['blockName'] ) {
                wp_enqueue_script( 'awb' );
                wp_enqueue_style( 'awb' );
            }
        }
    }

    /**
     * Fix for YouTube Embed Plus plugin.
     * https://wordpress.org/support/topic/video-does-not-loop/#post-10102519
     */
    public function fix_youtube_embed_plus_plugin() {
        wp_add_inline_script(
            '__ytprefs__',
            '(function () {
                if (window._EPYT_ && window._EPYT_.evselector) {
                    var selectors = window._EPYT_.evselector.split(", ");
                    window._EPYT_.evselector = "";

                    for (var k = 0; k < selectors.length; k++) {
                        if (window._EPYT_.evselector) {
                            window._EPYT_.evselector += ", ";
                        }
                        window._EPYT_.evselector += ":not([id*=\"jarallax-container\"]) > " + selectors[k];
                    }
                }
            }());'
        );
    }

    /**
     * Add custom image sizes.
     */
    public function add_image_sizes() {
        if ( AWB_Settings::get_option( 'register_image_sizes', 'awb_images', true ) ) {
            add_image_size( 'awb_sm', 500 );
            add_image_size( 'awb_md', 800 );
            add_image_size( 'awb_lg', 1280 );
            add_image_size( 'awb_xl', 1920 );
        }
    }

    /**
     * Include dependencies
     */
    private function include_dependencies() {
        require_once $this->plugin_path . 'classes/class-settings.php';
        require_once $this->plugin_path . 'classes/class-rest.php';
        require_once $this->plugin_path . 'classes/class-shortcode.php';
        require_once $this->plugin_path . 'classes/class-vc-extend.php';
        require_once $this->plugin_path . 'classes/class-tinymce.php';
        require_once $this->plugin_path . 'classes/class-gutenberg.php';
    }
}

/**
 * Function works with the NK_AWB class instance
 *
 * @return object NK_AWB
 */
function nk_awb() {
    return NK_AWB::instance();
}
add_action( 'plugins_loaded', 'NK_AWB' );
