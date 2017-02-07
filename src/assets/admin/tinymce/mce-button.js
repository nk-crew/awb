
(function($) {
    if (typeof AWB_TinyMCE_Options === 'undefined') {
        return;
    }
    var options = AWB_TinyMCE_Options;

    tinymce.PluginManager.add('awb', function( editor, url ) {
        var sh_tag = 'nk_awb';

        // default shortcode attributes
        var defaultAtts = {
            awb_type              : '',
            awb_stretch           : 'false',

            awb_color             : '',
            awb_image             : '',
            awb_video             : '',

            awb_image_size        : 'full',

            awb_video_mp4         : '',
            awb_video_webm        : '',
            awb_video_ogv         : '',
            awb_video_start_time  : '',
            awb_video_end_time    : '',

            awb_parallax          : '',
            awb_parallax_speed    : 0.5,
            awb_parallax_mobile   : 'false',

            awb_class             : ''
        };

        // get selector options
        function getSelectorOptions (arr, selected) {
            var result = '';
            for (var k in arr) {
                result += '<option value="' + k + '" ' + (selected === arr[k] ? 'selected' : '') + '>' + arr[k] + '</option>';
            }
            return result;
        }

        // is checked
        function isChecked (val) {
            return (val == 1 || val == '1' || val == true || val == 'true' || val == 'on') ? 'checked="checked"' : '';
        }

        // attach video/image control
        function attachControl (name, def, type) {
            $result = '';

            switch (type) {
                case 'video':
                    $result = [
                        '<div class="awb_attach_video">',
                        '<input name="' + name + '" class="' + name + ' awb_attach_video_field" type="hidden" value="' + def + '">',
                        '</div>',
                        '<input type="button" class="awb_attach_video_btn button" value="Select Video" data-select-title="Select Video" data-remove-title="&times;">',
                        '<small class="awb_attach_video_label">' + def + '</small>'
                    ].join(' ');
                    break;
                default:
                    // image
                    $result = [
                        '<div class="awb_attach_image">',
                        '<input name="' + name + '" class="' + name + ' awb_attach_image_field" type="hidden" value="' + def + '">',
                        '</div>',
                        '<input type="button" class="awb_attach_image_btn button" value="Select Image" data-select-title="Select Image" data-remove-title="&times;">',
                        '<small class="awb_attach_image_label">' + def + '</small>'
                    ].join(' ');
                    break;
            }

            return $result;
        }

        // add popup
        editor.addCommand('awb_popup', function(ui, atts) {
            editor.windowManager.open( {
                title: 'AWB Shortcode',
                width: 600,
                height: 400,
                classes: 'awb-panel',
                html: [
                    '<form class="awb-mce-form">',

                    '<div class="awb-tabs">',
                        '<a href="#awb-tab-general" class="awb-tab awb-tab-active">General</a>',
                        '<a href="#awb-tab-styles" class="awb-tab">Styles</a>',
                    '</div>',

                    // General Tab
                    '<div data-tab="awb-tab-general" class="awb-tab-active">',
                        '<div class="awb-col-6">',
                            '<h3>Background Type</h3>',
                            '<select name="awb_type">',
                                getSelectorOptions({
                                    ''       : 'None',
                                    'color'  : 'Color',
                                    'image'  : 'Image',
                                    'yt_vm_video' : 'YouTube / Vimeo',
                                    'video'  : 'Local Video'
                                }, atts.awb_type),
                            '</select>',
                        '</div>',

                        // stretch
                        '<div class="awb-col-6" data-cond="[name=awb_type]">',
                            '<h3>Stretch</h3>',
                            '<input type="checkbox" value="1" name="awb_stretch" ' + isChecked(atts.awb_stretch) + '>',
                        '</div>',

                        // Image
                        '<div data-cond="[name=awb_type] && [name=awb_type] != color">',
                            '<div class="awb-clearfix"></div>',
                            '<h3 class="awb-title">Image</h3>',
                            '<div class="awb-col-6">',
                                attachControl('awb_image', atts.awb_image, 'image'),
                            '</div>',
                            '<div class="awb-col-6" data-cond="[name=awb_image]">',
                                '<h3>Size</h3>',
                                '<select name="awb_image_size">',
                                    getSelectorOptions(options.imageSizes, atts.awb_image_size),
                                '</select>',
                            '</div>',
                        '</div>',

                        // Video Youtube / Vimeo
                        '<div data-cond="[name=awb_type] == yt_vm_video">',
                            '<div class="awb-clearfix"></div>',
                            '<h3 class="awb-title">Youtube / Vimeo</h3>',
                            '<div class="awb-col-12">',
                                '<input type="text" name="awb_video" value="' + atts.awb_video + '">',
                                '<div class="awb-description">Supported YouTube and Vimeo URLs</div>',
                            '</div>',
                        '</div>',

                        // Video
                        '<div data-cond="[name=awb_type] == video">',
                            '<div class="awb-clearfix"></div>',
                            '<h3 class="awb-title">Video</h3>',
                            '<div class="awb-col-4">',
                                '<h3>MP4</h3>',
                                attachControl('awb_video_mp4', atts.awb_video_mp4, 'video'),
                            '</div>',
                            '<div class="awb-col-4">',
                                '<h3>WEBM</h3>',
                                attachControl('awb_video_webm', atts.awb_video_webm, 'video'),
                            '</div>',
                            '<div class="awb-col-4">',
                                '<h3>OGV</h3>',
                                attachControl('awb_video_ogv', atts.awb_video_ogv, 'video'),
                            '</div>',
                        '</div>',

                        // Video Start / End Time
                        '<div data-cond="[name=awb_type] *= video">',
                            '<div class="awb-clearfix"></div>',
                            '<div class="awb-col-6">',
                                '<h3>Start Time</h3>',
                                '<input type="text" name="awb_video_start_time" value="' + atts.awb_video_start_time + '">',
                                '<div class="awb-description">Start time in seconds when video <br> will be started (this value will be <br> applied also after loop)</div>',
                            '</div>',
                            '<div class="awb-col-6">',
                                '<h3>End Time</h3>',
                                '<input type="text" name="awb_video_end_time" value="' + atts.awb_video_end_time + '">',
                                '<div class="awb-description">End time in seconds when video <br> will be ended</div>',
                            '</div>',
                        '</div>',

                        // Color
                        '<div data-cond="[name=awb_type]">',
                            '<div class="awb-clearfix"></div>',
                            '<h3 class="awb-title">Overlay Color</h3>',
                            '<div class="awb-col-12">',
                                '<input class="awb-colorpicker" type="text" name="awb_color" value="' + atts.awb_color + '" data-alpha="true">',
                            '</div>',
                        '</div>',

                        // Parallax
                        '<div data-cond="[name=awb_type] && [name=awb_type] != color">',
                            '<div class="awb-clearfix"></div>',
                            '<h3 class="awb-title">Parallax</h3>',
                            '<div class="awb-col-4">',
                                '<h3>Type</h3>',
                                '<select name="awb_parallax">',
                                    getSelectorOptions({
                                        ''               : 'Disabled',
                                        'scroll'         : 'Scroll',
                                        'scale'          : 'Scale',
                                        'opacity'        : 'Opacity',
                                        'scroll-opacity' : 'Opacity + Scroll',
                                        'scale-opacity'  : 'Opacity + Scale'
                                    }, atts.awb_parallax),
                                '</select>',
                            '</div>',
                            '<div data-cond="[name=awb_parallax]">',
                                '<div class="awb-col-4">',
                                    '<h3>Speed</h3>',
                                    '<input type="text" name="awb_parallax_speed" value="' + atts.awb_parallax_speed + '">',
                                    '<div class="awb-description">Provide number <br> from -1.0 to 2.0</div>',
                                '</div>',
                                '<div class="awb-col-4">',
                                    '<h3>Enable on Mobile Devices</h3>',
                                    '<input type="checkbox" value="1" name="awb_parallax_mobile" ' + isChecked(atts.awb_parallax_mobile) + '>',
                                '</div>',
                            '</div>',
                        '</div>',
                    '</div>',

                    // Styles Tab
                    '<div data-tab="awb-tab-styles">',
                        // Padding
                        '<div class="awb-clearfix"></div>',
                        '<div class="awb-col-12"><h3>Padding</h3></div>',
                        '<div class="awb-col-3">',
                            '<h3>Top</h3>',
                            '<input type="text" name="awb_styles_padding_top" data-style="padding-top" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Bottom</h3>',
                            '<input type="text" name="awb_styles_padding_bottom" data-style="padding-bottom" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Left</h3>',
                            '<input type="text" name="awb_styles_padding_left" data-style="padding-left" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Right</h3>',
                            '<input type="text" name="awb_styles_padding_right" data-style="padding-right" value="">',
                        '</div>',

                        // Margin
                        '<div class="awb-clearfix"></div>',
                        '<h3 class="awb-title">Margin</h3>',
                        '<div class="awb-col-3">',
                            '<h3>Top</h3>',
                            '<input type="text" name="awb_styles_margin_top" data-style="margin-top" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Bottom</h3>',
                            '<input type="text" name="awb_styles_margin_bottom" data-style="margin-bottom" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Left</h3>',
                            '<input type="text" name="awb_styles_margin_left" data-style="margin-left" value="">',
                        '</div>',
                        '<div class="awb-col-3">',
                            '<h3>Right</h3>',
                            '<input type="text" name="awb_styles_margin_right" data-style="margin-right" value="">',
                        '</div>',
                    '</div>',

                    '</form>'
                ].join(' '),

                buttons: [{
                    text: 'Insert',
                    classes: 'widget btn primary',
                    id: 'awb-panel-insert',
                    onclick: 'submit',
                    minHeight: 32,
                    minWidth: 70
                }, {
                    text: 'Close',
                    classes: 'widget btn secondary',
                    onclick: 'close',
                    minHeight: 32,
                    minWidth: 70
                }],

                onSubmit: function(e) {
                    var windows = editor.windowManager.getWindows()[0];
                    var $panel = jQuery(windows.$el[0]);

                    // fix color picker visibility
                    $panel.find('.wp-picker-container:visible').each(function () {
                        $(this).find('.awb-colorpicker').css('display', 'inline-block');
                    });

                    // get form values
                    var $controls = $panel.find('.awb-mce-form [name]');
                    var atts = {};
                    $controls.each(function () {
                        var $this = $(this);
                        if ($this.is('[type=hidden]')) {
                            if (!$this.parent().is(':visible')) {
                                return;
                            }
                        } else if (!$this.is(':visible')) {
                            return;
                        }
                        atts[this.name] = this.type === 'checkbox' ? this.checked : this.value;
                    });

                    // build shortcode
                    var shortcode_str = '[' + sh_tag;

                    // insert available attributes
                    for (var k in defaultAtts) {
                        if (typeof atts[k] !== 'undefined' && atts[k]) {
                            shortcode_str += ' ' + k + '="' + atts[k] + '"';
                        }
                    }

                    // insert custom styles
                    var customStyles = '';
                    $controls.filter('[data-style]').each(function () {
                        var $this = $(this);
                        var val = $this.val();
                        if (val) {
                            if ($.isNumeric(val)) {
                                val += 'px';
                            }
                            customStyles += ' ' + $this.attr('data-style') + ': ' + val + ';';
                        }
                    });
                    if (customStyles) {
                        shortcode_str += ' awb_styles="' + customStyles + '"';
                    }

                    // add panel content
                    shortcode_str += '] <p>Your Content Here</p> [/' + sh_tag + ']';

                    // insert shortcode to tinymce
                    editor.insertContent(shortcode_str);
                },
                onOpen: function (e) {
                    var windows = editor.windowManager.getWindows()[0];
                    var $panel = jQuery(windows.$el[0]);

                    /* check if wpColorPicker available */
                    if(typeof $.wp === 'object' && typeof $.wp.wpColorPicker === 'function') {
                        $panel.find('.awb-colorpicker').wpColorPicker({
                            alpha: true
                        });
                    }

                    // activate tabs
                    var $tabs = $panel.find('.awb-tabs');
                    if ($tabs.length) {
                        var $tabPanels = $tabs.parent().children('[data-tab]');
                        $tabs.on('click', '.awb-tab', function (e) {
                            e.preventDefault();
                            var $this = $(this);
                            var $currentTab = $tabPanels.filter('[data-tab="' + this.hash.replace('#', '') + '"]');
                            if ($currentTab.length) {
                                $tabPanels.removeClass('awb-tab-active');
                                $currentTab.addClass('awb-tab-active');
                                $this.addClass('awb-tab-active').siblings().removeClass('awb-tab-active');
                            }
                        });
                    }

                    // enable conditionize
                    $panel.conditionize();
                }
            });
        });

        // add button in toolbar
        editor.addButton('awb', {
            icon: 'awb',
            tooltip: 'Advanced WordPress Backgrounds',
            onclick: function() {
                editor.execCommand('awb_popup', '', defaultAtts);
            }
        });
    });
})(jQuery);