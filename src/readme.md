=== Advanced WordPress Backgrounds ===
Contributors: nko
Tags: parallax, video, youtube, background, visual composer
Requires at least: 4.0.0
Tested up to: 4.8
Stable tag: 1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo.



== Description ==

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo. There is available visual shortcode editor and support for Visual Composer page builder.

See __Online Demo__ here - [https://demo.nkdev.info/#awb](https://demo.nkdev.info/#awb)


= Real Examples =

[Khaki - Multipurpose Theme](https://demo.nkdev.info/#khaki.corporate)



== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/advanced-wordpress-backgrounds` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress
1. Add shortcodes in pages/posts from the editor toolbar



== Changelog ==

= 1.2.4 =
* improved mouse parallax (removed GSAP, now this is pure CSS animation)

= 1.2.3 =
* fixed url escaping in style attribute

= 1.2.1 =
* fixed stretch columns in some situations
* prevent stretch column when row is stretched

= 1.2.0 =
* added support for Visual Composer column background
* added icons with images and overlay in Visual Composer backend view
* small fix for stretch option

= 1.1.1 =
* added Mouse Parallax support with GSAP
* added support to wrap selected content in default MCE shortcode
* fix for safari image z position

= 1.0.1 =
* fixed Vimeo videos autoplay
* fixed video iframe - reset some styles like max-width
* fixed parallax for speed > 1 (wrong calculation)
* fixed local video mute and loop
* fixed showing Local videos if image is not set
* fixed video set aspect ratio (in some situations added black lines)

= 1.0.0 =
* Initial Release