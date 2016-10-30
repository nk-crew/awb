<?php
/**
 * Check for plugin updates
 */
if (!class_exists( 'nK_AWB_Updater' )) :
    class nK_AWB_Updater {
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
                self::$_instance->init_actions();
            }
            return self::$_instance;
        }

        private function __construct () {
            /* We do nothing here! */
        }

        private function init_actions () {
            // update check
            add_filter('pre_set_site_transient_update_plugins', array($this, 'filter_plugin_set_transient'));
        }

        public function get_latest_plugin_version () {
            if(isset($this->latest_plugin_version)) {
                return $this->latest_plugin_version;
            } else {

                // Check cache
                $lastVersion = nk_awb()->get_cache('nk_awb_version_latest');

                // Return cached version
                if ($lastVersion) {
                    $this->latest_plugin_version = $lastVersion;
                    return $this->latest_plugin_version;
                }

                // Request for remote version check
                $response = wp_remote_get('https://wp.nkdev.info/_api/?item_id=' . nk_awb()->plugin_name_sanitized . '&type=version');
                if(wp_remote_retrieve_response_code($response) == 200 && wp_remote_retrieve_body($response)) {
                    $response = json_decode(wp_remote_retrieve_body($response));

                    if(isset($response->success)) {
                        $this->latest_plugin_version = $response->response;

                        // Save cache
                        nk_awb()->set_cache('nk_awb_version_latest', $this->latest_plugin_version);

                        return $this->latest_plugin_version;
                    }
                }
            }
            return false;
        }

        public function is_update_available () {
            $new = $this->get_latest_plugin_version();
            if($new) {
                return version_compare(nk_awb()->plugin_version, $new, '<');
            }
            return false;
        }

        public function get_plugin_download_url () {
            if(isset($this->plugin_download_uri)) {
                return $this->plugin_download_uri;
            } else {
                $response = wp_remote_get('https://wp.nkdev.info/_api/?item_id=' . nk_awb()->plugin_name_sanitized . '&type=get-wp-uri');
                if(wp_remote_retrieve_response_code($response) == 200 && wp_remote_retrieve_body($response)) {
                    $response = json_decode(wp_remote_retrieve_body($response));

                    if(isset($response->success)) {
                        $this->plugin_download_uri = $response->response;
                        return $this->plugin_download_uri;
                    }
                }
            }
            return false;
        }

        /**
         * Check info to the filter transient
         */
        public function filter_plugin_set_transient ($transient) {
            // Check for new version
            if ($this->is_update_available()) {
                $obj = new stdClass();
                $obj->slug = nk_awb()->plugin_slug;
                $obj->new_version = $this->get_latest_plugin_version();
                $obj->url = '';
                $obj->package = $this->get_plugin_download_url();
                $transient->response[$obj->slug] = $obj;
            }
            return $transient;
        }
    }
endif;
