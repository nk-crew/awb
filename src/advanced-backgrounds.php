<?php
/**
 * Plugin Name:  Advanced WordPress Backgrounds
 * Description:  Parallax, Video, Images Backgrounds
 * Version:      @@plugin_version
 * Author:       nK
 * Author URI:   https://nkdev.info
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
     * @var $_instance
     */
    private static $_instance = null;

    /**
     * Main Instance
     * Ensures only one instance of this class exists in memory at any one time.
     */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
            self::$_instance->init();
            self::$_instance->init_hooks();
        }
        return self::$_instance;
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
        $this->plugin_url = plugin_dir_url( __FILE__ );

        // load textdomain.
        load_plugin_textdomain( '@@text_domain', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

        // include helper files.
        $this->include_dependencies();

        // clear caches.
        $this->clear_expired_caches();

        // init classes.
        new NK_AWB_Rest();
        new NK_AWB_Shortcode();
        new NK_AWB_VC_Extend();
        new NK_AWB_TinyMCE();
        new NK_AWB_Gutenberg();
    }

    /**
     * Init hooks
     */
    public function init_hooks() {
        add_action( 'init', array( $this, 'register_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
        add_action( 'wp_enqueue_scripts', array( $this, 'fix_youtube_embed_plus_plugin' ), 101 );
    }

    /**
     * Register scripts that will be used in the future when portfolio will be printed.
     */
    public function register_scripts() {
        wp_register_script( 'resize-observer-polyfill', nk_awb()->plugin_url . 'assets/vendor/resize-observer-polyfill/ResizeObserver.global.min.js', array(), '1.5.0', true );
        wp_register_script( 'jarallax', nk_awb()->plugin_url . 'assets/vendor/jarallax/jarallax.min.js', array( 'jquery', 'resize-observer-polyfill' ), '1.10.4', true );
        wp_register_script( 'jarallax-video', nk_awb()->plugin_url . 'assets/vendor/jarallax/jarallax-video.min.js', array( 'jarallax' ), '1.10.4', true );
        wp_register_script( 'object-fit-images', nk_awb()->plugin_url . 'assets/vendor/object-fit-images/ofi.min.js', '', '', true );
        wp_register_script( 'nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.min.js', array( 'jquery', 'jarallax', 'jarallax-video', 'object-fit-images' ), '@@plugin_version', true );
        wp_register_style( 'nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.min.css', '', '@@plugin_version' );
    }

    /**
     * Enqueue scripts.
     */
    public function enqueue_scripts() {
        // add styles to header to fix image jumping.
        wp_enqueue_style( 'nk-awb' );
    }

    /**
     * Fix for YouTube Embed Plus plugin.
     * https://wordpress.org/support/topic/video-does-not-loop/#post-10102519
     */
    public function fix_youtube_embed_plus_plugin() {
        wp_add_inline_script( '__ytprefs__', '
        (function () {
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
        }());
        ' );
    }

    /**
     * Include dependencies
     */
    private function include_dependencies() {
        require_once( $this->plugin_path . 'classes/class-rest.php' );
        require_once( $this->plugin_path . 'classes/class-shortcode.php' );
        require_once( $this->plugin_path . 'classes/class-vc-extend.php' );
        require_once( $this->plugin_path . 'classes/class-tinymce.php' );
        require_once( $this->plugin_path . 'classes/class-gutenberg.php' );
    }


    /**
     * Options
     */

    /**
     * Get options
     *
     * @return mixed
     */
    private function get_options() {
        $options_slug = 'nk_awb_options';
        return unserialize( get_option( $options_slug, 'a:0:{}' ) );
    }

    /**
     * Update option
     *
     * @param string $name - option name.
     * @param mixed  $value - option value.
     */
    public function update_option( $name, $value ) {
        $options_slug = 'nk_awb_options';
        $options = self::get_options();
        $options[ self::sanitize_key( $name ) ] = $value;
        update_option( $options_slug, serialize( $options ) );
    }

    /**
     * Get option
     *
     * @param string $name - option name.
     * @param mixed  $default - option default value.
     *
     * @return null
     */
    public function get_option( $name, $default = null ) {
        $options = self::get_options();
        $name = self::sanitize_key( $name );
        return isset( $options[ $name ] ) ? $options[ $name ] : $default;
    }

    /**
     * Sanitize option name
     *
     * @param string $key - string to sanitize.
     *
     * @return mixed
     */
    private function sanitize_key( $key ) {
        return preg_replace( '/[^A-Za-z0-9\_]/i', '', str_replace( array( '-', ':' ), '_', $key ) );
    }


    /**
     * Cache
     */

    /**
     * Get all caches
     *
     * @return null
     */
    private function get_caches() {
        $caches_slug = 'cache';
        return $this->get_option( $caches_slug, array() );
    }

    /**
     * Set cache
     *
     * @param string $name - cache name.
     * @param mixed  $value - cache value.
     * @param int    $time - cache time in seconds.
     */
    public function set_cache( $name, $value, $time = 3600 ) {
        if ( ! $time || $time <= 0 ) {
            return;
        }
        $caches_slug = 'cache';
        $caches = self::get_caches();

        $caches[ self::sanitize_key( $name ) ] = array(
            'value'   => $value,
            'expired' => time() + ( (int) $time ? $time : 0 ),
        );
        $this->update_option( $caches_slug, $caches );
    }

    /**
     * Get cache
     *
     * @param string $name - cache name.
     * @param mixed  $default cache default value.
     *
     * @return null
     */
    public function get_cache( $name, $default = null ) {
        $caches = self::get_caches();
        $name = self::sanitize_key( $name );
        return isset( $caches[ $name ]['value'] ) ? $caches[ $name ]['value'] : $default;
    }

    /**
     * Clear cache
     *
     * @param string $name - cache name.
     */
    public function clear_cache( $name ) {
        $caches_slug = 'cache';
        $caches = self::get_caches();
        $name = self::sanitize_key( $name );
        if ( isset( $caches[ $name ] ) ) {
            $caches[ $name ] = null;
            $this->update_option( $caches_slug, $caches );
        }
    }

    /**
     * Clear all expired caches
     */
    public function clear_expired_caches() {
        $caches_slug = 'cache';
        $caches = self::get_caches();
        foreach ( $caches as $k => $cache ) {
            if ( isset( $cache ) && isset( $cache['expired'] ) && $cache['expired'] < time() ) {
                $caches[ $k ] = null;
            }
        }
        $this->update_option( $caches_slug, $caches );
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
