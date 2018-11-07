# Advanced WordPress Backgrounds #
* Contributors: nko
* Tags: parallax, video, youtube, background, gutenberg
* Requires at least: 4.0.0
* Tested up to: 4.9
* Stable tag: @@plugin_version
* License: GPLv2 or later
* License URI: http://www.gnu.org/licenses/gpl-2.0.html

Image backgrounds, YouTube / Vimeo / Local hosted video backgrounds with parallax support.


## Description ##

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo. [Gutenberg](https://wordpress.org/gutenberg/) and WPBakery Page Builder support.

#### Links ####

* [Live Demo](https://demo.nkdev.info/#awb)
* [GitHub](https://github.com/nk-o/awb)

= Features =
* Background __Types__:
    * Color
    * Image
    * Pattern images
    * Local Hosted Video
    * Youtube / Vimeo Video
* __Parallax__ options powered by high performance JavaScript plugin [Jarallax](https://github.com/nk-o/jarallax)
    * Custom speed option
    * Enable / Disable for mobile devices option
    * Scroll effect
    * Opacity effect
    * Scale effect
    * Scroll + Opacity effect
    * Scroll + Scale effect
* __Mouse Parallax__
* Custom __video__ start & end time
* srcset supported (i.e. Google love it)
* __Overlay__ color with transparency options
* Stretch option. Will be useful on boxed websites.
* Visual shortcode maker. You can create shortcode using visual builder
* [Gutenberg](https://wordpress.org/gutenberg/) supported
* __WPBakery Page Builder__ supported (extended row and col options + separate shortcode)
* Custom CSS offsets (paddings + margins)


= Real Examples =

* [Youplay - Gaming Theme](https://demo.nkdev.info/#youplay)
* [Godlike - Gaming Theme](https://demo.nkdev.info/#godlike)
* [Khaki - Multipurpose Theme](https://demo.nkdev.info/#khaki.corporate)
* [Snow - Portfolio Theme](https://demo.nkdev.info/#snow)



## Installation ##

#### Automatic installation ####

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of AWB, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type AWB and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

#### Manual installation ####

The manual installation method involves downloading our AWB plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).



## Frequently Asked Questions ##

#### How to enable `Stretch` with Gutenberg ####
Since the Gutenberg support `Wide` blocks, you can make stretch for AWB in theme code:

1. Enable support for `Wide` blocks in theme. [Read here how](https://wordpress.org/gutenberg/handbook/extensibility/theme-support/#wide-alignment)
2. Add this JS code to your theme or in 3rd-party plugin:
    ```javascript
    (function ($) {
        var $body = $('body');

        // fullwidth gutenberg feature.
        function stretchAWB() {
            var wndW = $body.width();

            $('.nk-awb.alignfull > .nk-awb-wrap').each(function () {
                var $this = $(this);

                var rect = this.getBoundingClientRect();
                var left = rect.left;
                var right = wndW - rect.right;

                var ml = parseFloat($this.css('margin-left') || 0);
                var mr = parseFloat($this.css('margin-right') || 0);

                $this.css({
                    'margin-left': ml - left,
                    'margin-right': mr - right,
                });
            });
        }
        stretchAWB();
        $(window).on('resize orientationchange load', stretchAWB);
    }(jQuery));
    ```
Note: this code for example only, your theme may not work with it properly (it may not work correctly with theme sidebars). So, you will need to change this code manually depending on your theme styles.


## Screenshots ##

1. Background color
2. Background image
3. Background video
4. Background parallax and Mouse parallax
5. Extended WPBakery Page Builder ROW options



## Changelog ##

= 1.5.3 =

* fixed image fetch error in Gutenberg 4.2
* changed color picker to Gutenberg component

= 1.5.2 =

* removed default paddings from AWB shortcode, keep it only for Gutenberg block

= 1.5.1 =

* fixed selected image preview in Inspector

= 1.5.0 =

* added default padding to the AWB block on frontend and in Gutenberg editor
* added spacing options (paddings, margins) in Gutenberg block
* added initialization AWB for dynamic content (AJAX loading)
* improved editor styles with GhostKit grid
* registered additional image sizes
* fixed mouse parallax on mobile devices (acceleration calculated properly now)
* fixed Gutenberg 4.0 number attribute type automatic convert
* fixed Gutenberg 4.0 AWB block border
* fixed image height calculation when block height > than window height
* updated conditionize vendor script

= 1.4.10 =

* added Reset button to Color Picker in Gutenberg block
* updated icons in Gutenberg block
* fixed disable on mobile devices checkboxes in WPBakery Page Builder
* fixed Vimeo autoplay on mobile devices
* fixed self hosted video url building string in Gutenberg block

= 1.4.9 =

* added Full Height option in Gutenberg AWB toolbar
* added fallback for align full. If the theme don't support align-wide, AWB will still show the button for it
* added some helpful controls in Gutenberg block toolbar
* changed icon to svg in Gutenberg block

= 1.4.8 =

* fixed JS error "only one instance of babel-polyfill is allowed" in Gutenberg editor

= 1.4.7 =

* added support for Gutenberg 3.7.0
* added __wp_admin > Settings > AWB__ page
* added settings to disable parallax on mobile devices and in some browsers
* updated Jarallax and object-fit-images scripts
* removed Video Volume option since browsers don't support autoplay with sound [https://developers.google.com/web/updates/2017/09/autoplay-policy-changes](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes)
* fixed compatibility with WordPress Import/Export content (Gutenberg)
* fixed drag event on image backgrounds (without parallax)

= 1.4.6 =

* added support for Gutenberg 3.4.0
* added support for [Ghostkit](https://wordpress.org/plugins/ghostkit/) Indents extension (you can add paddings and margins to AWB block)
* fixed JS error when select image with specific image size title

= 1.4.5 =

* fixed js error toUpperCase of undefined in Gutenberg editor
* minor code improvements for Gutenberg blocks
* changed jquery ready event to DOMContentLoaded

= 1.4.4 =

* improved Gutenberg backgrounds preview
* fixed conflict with YouTube Embed Plus plugin

= 1.4.3 =

* updated Jarallax to 1.10.3

= 1.4.2 =

* fixed adding styles from WPBakery Page Builder "Design Options" tab in AWB shortcode

= 1.4.1 =

* updated Jarallax to 1.10.2

= 1.4.0 =

* added support for [Gutenberg](https://wordpress.org/gutenberg/) blocks builder
* added option to disable video on mobile devices
* fixed WPBakery Page Builder and Stretch row JS error on mobile devices 
* fixed WPBakery Page Builder icon position
* updated Jarallax to 1.10.1

= 1.3.2 =

* updated Jarallax to 1.9.1

= 1.3.1 =

* fixed parallax resize inside stretched WPBakery Page Builder row

= 1.3.0 =

* added video volume option
* added video always play option
* added background image size option (support for pattern backgrounds)
* added background image position option
* changed background image to <img> tag with srcset support
* changed scripts enqueue to registration first (prevent some themes to override scripts)
* updated jarallax plugin
* updated wp-color-picker-alpha plugin to support WordPress 4.9

= 1.2.4 =

* improved mouse parallax (removed GSAP, now this is pure CSS animation)

= 1.2.3 =

* fixed url escaping in style attribute

= 1.2.1 =

* fixed stretch columns in some situations
* prevent stretch column when row is stretched

= 1.2.0 =

* added support for WPBakery Page Builder column background
* added icons with images and overlay in WPBakery Page Builder backend view
* small fix for stretch option

= 1.1.1 =

* added Mouse Parallax support with GSAP
* added support to wrap selected content in default MCE shortcode
* fix for safari image z position

= 1.0.1 =

* fixed Vimeo videos autoplay
* fixed video iframe - reset some styles like max-width
* fixed parallax for speed > 1 (wrong calculation)
* fixed local hosted video mute and loop
* fixed showing Local hosted videos if image is not set
* fixed video set aspect ratio (in some situations added black lines)

= 1.0.0 =

* Initial Release
