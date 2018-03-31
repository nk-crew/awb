=== Advanced WordPress Backgrounds ===
Contributors: nko
Tags: parallax, video, youtube, background, visual composer
Requires at least: 4.0.0
Tested up to: 4.9
Stable tag: @@plugin_version
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo.



== Description ==

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo. [Gutenberg](https://wordpress.org/gutenberg/) and Visual Composer support.

See __Online Demo__ here - [https://demo.nkdev.info/#awb](https://demo.nkdev.info/#awb)

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
* __Visual Composer__ supported (extended row and col options + separate shortcode)
* Custom CSS offsets (paddings + margins)


= Real Examples =

[Khaki - Multipurpose Theme](https://demo.nkdev.info/#khaki.corporate)



== Installation ==

= Automatic installation =

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of AWB, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type AWB and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

= Manual installation =

The manual installation method involves downloading our AWB plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).



== Screenshots ==

1. Gutenberg blocks
2. Background color
3. Background image
4. Background video
5. Background parallax and Mouse parallax
6. Extended Visual Composer ROW options



== Changelog ==

= 1.4.3 =
* updated Jarallax to 1.10.3

= 1.4.2 =
* fixed adding styles from Visual Composer "Design Options" tab in AWB shortcode

= 1.4.1 =
* updated Jarallax to 1.10.2

= 1.4.0 =
* added support for [Gutenberg](https://wordpress.org/gutenberg/) blocks builder
* added option to disable video on mobile devices
* fixed Visual Composer and Stretch row JS error on mobile devices 
* fixed Visual Composer icon position
* updated Jarallax to 1.10.1

= 1.3.2 =
* updated Jarallax to 1.9.1

= 1.3.1 =
* fixed parallax resize inside stretched Visual Composer row

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
* fixed local hosted video mute and loop
* fixed showing Local hosted videos if image is not set
* fixed video set aspect ratio (in some situations added black lines)

= 1.0.0 =
* Initial Release
