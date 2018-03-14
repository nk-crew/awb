<?php
/**
 * Rest API functions
 *
 * @package @@plugin_name
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class NK_AWB_Rest
 */
class NK_AWB_Rest extends WP_REST_Controller {
    /**
     * Namespace.
     *
     * @var string
     */
    protected $namespace = 'awb/v';

    /**
     * Version.
     *
     * @var string
     */
    protected $version   = '1';

    /**
     * NK_AWB_Rest constructor.
     */
    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    /**
     * Register rest routes.
     */
    public function register_routes() {
        $namespace = $this->namespace . $this->version;

        // Get attachment image <img> tag.
        register_rest_route(
            $namespace, '/get_attachment_image/(?P<id>[\d]+)', array(
                'methods'         => WP_REST_Server::READABLE,
                'callback'        => array( $this, 'get_attachment_image' ),
                'permission_callback'   => array( $this, 'get_attachment_image_permission' ),
            )
        );
    }

    /**
     * Get attachment image <img> tag permissions.
     *
     * @param WP_REST_Request $request  request object.
     *
     * @return bool
     */
    public function get_attachment_image_permission( WP_REST_Request $request ) {
        $id = $request->get_param( 'id' );

        if ( ! $id ) {
            return $this->error( 'no_id_found', __( 'Provide image ID.', '@@text_domain' ) );
        }
        return true;
    }

    /**
     * Get attachment image <img> tag.
     *
     * @param WP_REST_Request $request  request object.
     *
     * @return mixed
     */
    public function get_attachment_image( WP_REST_Request $request ) {
        $id = $request->get_param( 'id' );
        $size = $request->get_param( 'size' );
        $icon = $request->get_param( 'icon' );
        $attr = $request->get_param( 'attr' );
        $div_tag = $request->get_param( 'div_tag' );

        if ( $div_tag ) {
            $image_url = wp_get_attachment_image_url( $id, $size, $icon );
            $attr = isset( $attr ) && $attr && is_array( $attr ) ? $attr : array();

            if ( ! isset( $attr['style'] ) ) {
                $attr['style'] = '';
            }

            $attr['style'] .= 'background-image: url("' . esc_url( $image_url ) . '");';

            $attr = array_map( 'esc_attr', $attr );
            $image = '<div';
            foreach ( $attr as $name => $value ) {
                $image .= " $name=" . '"' . $value . '"';
            }
            $image .= '></div>';
        } else {
            $image = wp_get_attachment_image( $id, $size, $icon, $attr );
        }

        if ( $image ) {
            return $this->success( $image );
        } else {
            return $this->error( 'no_image_found', __( 'Image not found.', '@@text_domain' ) );
        }
    }

    /**
     * Success rest.
     *
     * @param mixed $response response data.
     * @return mixed
     */
    public function success( $response ) {
        return new WP_REST_Response(
            array(
                'success' => true,
                'response' => $response,
            ), 200
        );
    }

    /**
     * Error rest.
     *
     * @param mixed $code     error code.
     * @param mixed $response response data.
     * @return mixed
     */
    public function error( $code, $response ) {
        return new WP_REST_Response(
            array(
                'error' => true,
                'success' => false,
                'error_code' => $code,
                'response' => $response,
            ), 401
        );
    }
}
