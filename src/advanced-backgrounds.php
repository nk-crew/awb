<?php
/**
 * Plugin Name:  Advanced WordPress Backgrounds
 * Description:  Parallax, Video, Images Backgrounds
 * Version:      1.2.4
 * Author:       nK
 * Author URI:   https://nkdev.info
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  advanced-backgrounds
 */
define('NK_AWB_DOMAIN', 'advanced-backgrounds');

// Make sure we don't expose any info if called directly
if ( !function_exists( 'add_action' ) ) {
    echo 'Hi there!  I\'m just a plugin, not much I can do when called directly.';
    exit;
}


/**
 * nK Theme Helper Class
 */
class nK_AWB {
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
            self::$_instance->init();
            self::$_instance->init_hooks();
        }
        return self::$_instance;
    }

    public $plugin_path;
    public $plugin_url;
    public $plugin_name;
    public $plugin_version;
    public $plugin_slug;
    public $plugin_name_sanitized;

    public function __construct() {
        /* We do nothing here! */
    }

    /**
     * Init translation
     */
    public function init () {
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);

        // load textdomain
        load_plugin_textdomain( NK_AWB_DOMAIN, false, dirname( plugin_basename(__FILE__) ) . '/languages/' );

        // include helper files
        $this->include_dependencies();

        // clear caches
        $this->clear_expired_caches();

        // init classes
        new nK_AWB_Shortcode();
        new nK_AWB_VC_Extend();
        new nK_AWB_TinyMCE();
    }

    public function init_hooks() {
        add_action('admin_init', array($this, 'admin_init'));
        add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
    }

    /**
     * Register scripts that will be used in the future when portfolio will be printed.
     */
    public function register_scripts() {
        wp_register_script('jarallax', nk_awb()->plugin_url . 'assets/vendor/jarallax/jarallax.min.js', array('jquery'), '1.9.0', true);
        wp_register_script('jarallax-video', nk_awb()->plugin_url . 'assets/vendor/jarallax/jarallax-video.min.js', array('jarallax'), '1.9.0', true);
        wp_register_script('object-fit-images', nk_awb()->plugin_url . 'assets/vendor/object-fit-images/ofi.min.js', '', '', true);
        wp_register_script('nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.js', array('jquery', 'jarallax', 'jarallax-video', 'object-fit-images'), '', true);
        wp_register_style('nk-awb', nk_awb()->plugin_url . 'assets/awb/awb.css');
    }

    public function admin_init () {
        // get current plugin data
        $data = get_plugin_data(__FILE__);
        $this->plugin_name = $data['Name'];
        $this->plugin_version = $data['Version'];
        $this->plugin_slug = plugin_basename(__FILE__, '.php');
        $this->plugin_name_sanitized = basename(__FILE__, '.php');
    }

    // include
    private function include_dependencies () {
        require_once($this->plugin_path . 'classes/class-shortcode.php');
        require_once($this->plugin_path . 'classes/class-vc-extend.php');
        require_once($this->plugin_path . 'classes/class-tinymce.php');
    }


    /**
     * Options
     */
    private function get_options () {
        $options_slug = 'nk_awb_options';
        return unserialize( get_option($options_slug, 'a:0:{}') );
    }
    public function update_option ($name, $value) {
        $options_slug = 'nk_awb_options';
        $options = self::get_options();
        $options[self::sanitize_key($name)] = $value;
        update_option($options_slug, serialize($options));
    }
    public function get_option ($name, $default = null) {
        $options = self::get_options();
        $name = self::sanitize_key($name);
        return isset($options[$name]) ? $options[$name] : $default;
    }
    private function sanitize_key ($key) {
        return preg_replace( '/[^A-Za-z0-9\_]/i', '', str_replace( array( '-', ':' ), '_', $key ) );
    }


    /**
     * Cache
     * $time in seconds
     */
    private function get_caches () {
        $caches_slug = 'cache';
        return $this->get_option($caches_slug, array());
    }
    public function set_cache ($name, $value, $time = 3600) {
        if(!$time || $time <= 0) {
            return;
        }
        $caches_slug = 'cache';
        $caches = self::get_caches();

        $caches[self::sanitize_key($name)] = array(
            'value'   => $value,
            'expired' => time() + ((int) $time ? $time : 0)
        );
        $this->update_option($caches_slug, $caches);
    }
    public function get_cache ($name, $default = null) {
        $caches = self::get_caches();
        $name = self::sanitize_key($name);
        return isset($caches[$name]['value']) ? $caches[$name]['value'] : $default;
    }
    public function clear_cache ($name) {
        $caches_slug = 'cache';
        $caches = self::get_caches();
        $name = self::sanitize_key($name);
        if(isset($caches[$name])) {
            $caches[$name] = null;
            $this->update_option($caches_slug, $caches);
        }
    }
    public function clear_expired_caches () {
        $caches_slug = 'cache';
        $caches = self::get_caches();
        foreach($caches as $k => $cache) {
            if(isset($cache) && isset($cache['expired']) && $cache['expired'] < time()) {
                $caches[$k] = null;
            }
        }
        $this->update_option($caches_slug, $caches);
    }
}

function nk_awb () {
    return nK_AWB::instance();
}
add_action('plugins_loaded', 'nk_awb' );
