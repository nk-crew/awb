<?php
/**
 * Extend Visual Composer vc_row, add video attachment control
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class nK_AWB_VC_Extend {
    /**
     * nK_AWB_VC_Extend constructor.
     */
    public function __construct() {
        $this->init_options();
        $this->init_hooks();
    }

    public function init_options () {
        // add VC control
        if (function_exists('vc_add_shortcode_param')) {
            // attach video
            vc_add_shortcode_param('awb_attach_video', array($this, 'vc_control_awb_attach_video'), nk_awb()->plugin_url . 'assets/admin/vc_extend/vc-awb-attach-video.js');

            // heading
            vc_add_shortcode_param('awb_heading', array($this, 'vc_control_awb_heading'));
        }
    }

    public function init_hooks () {
        add_filter('vc_shortcode_output', array($this, 'vc_shortcode_output_filter'), 10, 3);
        add_action('admin_init', array($this, 'vc_shortcode_extend_prepare'));
        add_action('admin_init', array($this, 'vc_shortcode_remove_params'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }

    public function admin_enqueue_scripts ($page) {
        if ($page == "post.php" || $page == "post-new.php") {
            wp_enqueue_media();
            wp_enqueue_style('nk-awb-vc-attach-file', nk_awb()->plugin_url . 'assets/admin/vc_extend/vc-awb-attach-video.css');
            wp_enqueue_style('nk-awb-vc-heading', nk_awb()->plugin_url . 'assets/admin/vc_extend/vc-awb-heading.css');
            wp_enqueue_style('nk-awb-vc-icon', nk_awb()->plugin_url . 'assets/admin/vc_extend/vc-awb-icon.css');
            wp_enqueue_script('nk-awb-vc-frontend', nk_awb()->plugin_url . 'assets/admin/vc_extend/vc-awb-frontend.js', array('jquery'));
        }
    }

    /**
     * Add VC attach_video control
     */
    public function vc_control_awb_attach_video ($settings, $value) {
        if ($value && is_numeric($value)) {
            $value = wp_get_attachment_url($value);
            if (!$value) {
                $value = '';
            }
        }

        return '<div class="awb_attach_video">
                    <input name="' . esc_attr($settings['param_name']) . '" class="wpb_vc_param_value ' . esc_attr($settings['param_name']) . ' ' . esc_attr($settings['type']) . '_field" type="hidden" value="' . esc_attr($value) . '" />
               </div>
               <input type="button" class="awb_attach_video_btn ' . ($value ? 'awb_attach_video_btn_selected' : '') . ' button" data-select-title="' . esc_attr__('Select File', NK_AWB_DOMAIN) . '" data-remove-title="' . esc_attr__('&times;', NK_AWB_DOMAIN) . '" value="' . ($value ? esc_attr__('&times;', NK_AWB_DOMAIN) : esc_attr__('Select File', NK_AWB_DOMAIN)) . '">
               <small class="awb_attach_video_label">' . esc_html(basename($value)) . '</small>';
    }
    /**
     * Add VC awb_heading control
     */
    public function vc_control_awb_heading ($settings, $value) {
        return '<input name="' . esc_attr($settings['param_name']) . '" class="wpb_vc_param_value ' . esc_attr($settings['param_name']) . ' ' . esc_attr($settings['type']) . '_field" type="hidden" value="" />
                <div class="wpb_element_label awb_heading">' . esc_html($settings['title']) . '</div>';
    }

    /**
     * Get Available Image Sizes + full
     */
    static function getImageSizes () {
        $sizes = get_intermediate_image_sizes();
        array_unshift($sizes, 'full');
        return $sizes;
    }

    /**
     * Filter for vc_row output
     */
    public function vc_shortcode_output_filter ($output, $obj, $attr) {
        if ($obj->settings('base') == 'vc_row') {
            $attr['awb_after_vc_row'] = 'true';
            $output .= nK_AWB_Shortcode::get_shortcode_out($attr, '');
        } else if ($obj->settings('base') == 'vc_column') {
            $attr['awb_after_vc_column'] = 'true';
            $output .= nK_AWB_Shortcode::get_shortcode_out($attr, '');
        }
        return $output;
    }

    /**
     * Remove default vc_row params for backgrounds and parallax
     */
    public function vc_shortcode_remove_params () {
        if (!function_exists('vc_remove_param')) {
            return;
        }

        //        vc_remove_param('vc_row', 'parallax');
        //        vc_remove_param('vc_row', 'parallax_image');
        //        vc_remove_param('vc_row', 'parallax_speed_bg');
        //        vc_remove_param('vc_row', 'video_bg');
        //        vc_remove_param('vc_row', 'video_bg_url');
        //        vc_remove_param('vc_row', 'video_bg_parallax');
        //        vc_remove_param('vc_row', 'parallax_speed_video');
    }

    /**
     * Prepare VC Extend
     */
    public function vc_shortcode_extend_prepare () {
        // add new tab in vc_row
        $this->vc_shortcode_extend_params('vc_row', esc_html__('Background [AWB]', NK_AWB_DOMAIN));

        // add new tab in vc_column
        $this->vc_shortcode_extend_params('vc_column', esc_html__('Background [AWB]', NK_AWB_DOMAIN));

        // add new shortcode nk_awb
        if (function_exists('vc_map')) {
            $shortcode_name = 'nk_awb';
            $shortcode_group = esc_html__('General', NK_AWB_DOMAIN);
            vc_map(array(
                'name'              => esc_html__('Advanced WordPress Backgrounds', NK_AWB_DOMAIN),
                'base'              => $shortcode_name,
                'controls'          => 'full',
                'icon'              => 'nk-awb-icon',
                'is_container'      => true,
                'js_view'           => 'VcColumnView',
                'params'            => array()
            ));
            $this->vc_shortcode_extend_params($shortcode_name, $shortcode_group);

            if (function_exists('vc_add_param')) {
                vc_add_param($shortcode_name, array(
                    "type"        => "awb_heading",
                    "param_name"  => "awb_heading__awb_custom_classes",
                    "title"       => esc_html__("Custom Classes", NK_AWB_DOMAIN),
                    "group"       => $shortcode_group
                ));
                vc_add_param($shortcode_name, array(
                    "type"        => "textfield",
                    "param_name"  => "awb_class",
                    "heading"     => "",
                    "group"       => $shortcode_group
                ));
                vc_add_param($shortcode_name, array(
                    "type"        => "css_editor",
                    'heading'     => esc_html__('CSS', NK_AWB_DOMAIN),
                    "param_name"  => "vc_css",
                    'group'       => esc_html__('Design Options', NK_AWB_DOMAIN)
                ));
            }
        }
    }

    /**
     * Extend vc_row params
     */
    public function vc_shortcode_extend_params ($element, $group_name) {
        if(!function_exists('vc_add_param')) {
            return;
        }

        vc_add_param($element, array(
            "type"        => "dropdown",
            "param_name"  => "awb_type",
            "heading"     => esc_html__( "Background Type", NK_AWB_DOMAIN ),
            "value"       => array(
                esc_html__( "None", NK_AWB_DOMAIN )             => "",
                esc_html__( "Color", NK_AWB_DOMAIN )            => "color",
                esc_html__( "Image", NK_AWB_DOMAIN )            => "image",
                esc_html__( "YouTube / Vimeo", NK_AWB_DOMAIN )  => "yt_vm_video",
                esc_html__( "Local Video", NK_AWB_DOMAIN )      => "video",
            ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6 vc_column-with-padding",
            "admin_label" => true,
        ));

        // stretch
        vc_add_param($element, array(
            "type"        => "checkbox",
            "param_name"  => "awb_stretch",
            "heading"     => esc_html__( "Stretch", NK_AWB_DOMAIN ),
            'value'       => array( '' => true ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "not_empty"  => true
            ),
        ));

        // Image
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_image",
            "title"       => esc_html__("Image", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_poster_image",
            "title"       => esc_html__("Poster Image", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video", "video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "attach_image",
            "param_name"  => "awb_image",
            "heading"     => "",
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "dropdown",
            "param_name"  => "awb_image_size",
            "heading"     => "",
            "group"       => $group_name,
            "std"         => "full",
            "value"       => self::getImageSizes(),
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_image",
                "not_empty"  => true
            )
        ));
        vc_add_param($element, array(
            "type"        => "dropdown",
            "param_name"  => "awb_image_background_size",
            "heading"     => "",
            "group"       => $group_name,
            "std"         => "cover",
            "value"       => array(
                esc_html__( "Cover", NK_AWB_DOMAIN )   => "cover",
                esc_html__( "Contain", NK_AWB_DOMAIN ) => "contain",
                esc_html__( "Pattern", NK_AWB_DOMAIN )  => "pattern",
            ),
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_image",
                "not_empty"  => true
            )
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_image_background_position",
            "heading"     => "",
            "description" => esc_html__( "Image position. Example: 50% 50%", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "value"       => "50% 50%",
            "save_always" => true,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_image",
                "not_empty"  => true
            )
        ));

        // Video Youtube / Vimeo
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_yt_vm_video",
            "title"       => esc_html__("Youtube / Vimeo", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_video",
            "heading"     => "",
            "description" => esc_html__( "Supported YouTube and Vimeo URLs", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "value"       => "https://vimeo.com/110138539",
            "save_always" => true,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video")
            )
        ));

        // Local Video
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_video",
            "title"       => esc_html__("Video", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "awb_attach_video",
            "param_name"  => "awb_video_mp4",
            "heading"     => esc_html__( "MP4", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "awb_attach_video",
            "param_name"  => "awb_video_webm",
            "heading"     => esc_html__( "WEBM", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "awb_attach_video",
            "param_name"  => "awb_video_ogv",
            "heading"     => esc_html__( "OGV", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("video")
            )
        ));

        // Video Start / End Time
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_video_start_time",
            "heading"     => esc_html__( "Start Time", NK_AWB_DOMAIN ),
            "description" => esc_html__( "Start time in seconds when video will be started (this value will be applied also after loop)", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video", "video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_video_end_time",
            "heading"     => esc_html__( "End Time", NK_AWB_DOMAIN ),
            "description" => esc_html__( "End time in seconds when video will be ended", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video", "video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_video_volume",
            "heading"     => esc_html__( "Volume", NK_AWB_DOMAIN ),
            "description" => esc_html__( "Volume from 0 to 100.", NK_AWB_DOMAIN ),
            "group"       => $group_name,
            "value"       => "0",
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video", "video")
            )
        ));
        vc_add_param($element, array(
            "type"        => "checkbox",
            "param_name"  => "awb_video_always_play",
            "heading"     => esc_html__( "Always play", NK_AWB_DOMAIN ),
            "description" => esc_html__( "Play video also when not in viewport.", NK_AWB_DOMAIN ),
            'value'       => array( '' => true ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-6",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("yt_vm_video", "video")
            )
        ));

        // Color
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_color",
            "title"       => esc_html__("Color", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("color")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_color_overlay",
            "title"       => esc_html__("Overlay Color", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "colorpicker",
            "param_name"  => "awb_color",
            "heading"     => "",
            "value"       => '',
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "not_empty"  => true
            )
        ));

        // Parallax
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_parallax",
            "title"       => esc_html__("Parallax", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "dropdown",
            "param_name"  => "awb_parallax",
            "heading"     => esc_html__( "Type", NK_AWB_DOMAIN ),
            "value"       => array(
                esc_html__( "Disabled", NK_AWB_DOMAIN )          => "",
                esc_html__( "Scroll", NK_AWB_DOMAIN )           => "scroll",
                esc_html__( "Scale", NK_AWB_DOMAIN )            => "scale",
                esc_html__( "Opacity", NK_AWB_DOMAIN )          => "opacity",
                esc_html__( "Opacity + Scroll", NK_AWB_DOMAIN ) => "scroll-opacity",
                esc_html__( "Opacity + Scale", NK_AWB_DOMAIN )  => "scale-opacity",
            ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            ),
            "admin_label" => true,
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_parallax_speed",
            "heading"     => esc_html__( "Speed", NK_AWB_DOMAIN ),
            "description" => esc_html__( "Provide number from -1.0 to 2.0", NK_AWB_DOMAIN ),
            "value"       => 0.5,
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_parallax",
                "not_empty"  => true
            )
        ));
        vc_add_param($element, array(
            "type"        => "checkbox",
            "param_name"  => "awb_parallax_mobile",
            "heading"     => esc_html__( "Enable on Mobile Devices", NK_AWB_DOMAIN ),
            'value'       => array( '' => true ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_parallax",
                "not_empty"  => true
            )
        ));

        // Mouse Parallax
        vc_add_param($element, array(
            "type"        => "awb_heading",
            "param_name"  => "awb_heading__awb_mouse_parallax",
            "title"       => esc_html__("Mouse Parallax", NK_AWB_DOMAIN),
            "group"       => $group_name,
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "checkbox",
            "param_name"  => "awb_mouse_parallax",
            "heading"     => esc_html__( "Enable", NK_AWB_DOMAIN ),
            'value'       => array( '' => true ),
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_type",
                "value"      => array("image", "yt_vm_video", "video")
            ),
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_mouse_parallax_size",
            "heading"     => esc_html__( "Size", NK_AWB_DOMAIN ),
            "description" => esc_html__( "pixels", NK_AWB_DOMAIN ),
            'value'       => 30,
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_mouse_parallax",
                'not_empty'  => true
            ),
        ));
        vc_add_param($element, array(
            "type"        => "textfield",
            "param_name"  => "awb_mouse_parallax_speed",
            "heading"     => esc_html__( "Speed", NK_AWB_DOMAIN ),
            "description" => esc_html__( "milliseconds", NK_AWB_DOMAIN ),
            'value'       => 10000,
            "group"       => $group_name,
            "edit_field_class" => "vc_col-sm-4",
            "dependency" => array(
                "element"    => "awb_mouse_parallax",
                'not_empty'  => true
            ),
        ));
    }
}

// extend vc controls for nk_awb shortcode
if (class_exists('WPBakeryShortCodesContainer')) {
    class WPBakeryShortCode_nk_awb extends WPBakeryShortCodesContainer {

    }
}