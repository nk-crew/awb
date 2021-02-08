# Advanced WordPress Backgrounds

* Contributors: nko
* Tags: parallax, video, youtube, background, gutenberg
* Requires at least: 5.4
* Tested up to: 5.5
* Requires PHP: 5.5.9
* Stable tag: @@plugin_version
* License: GPLv2 or later
* License URI: <http://www.gnu.org/licenses/gpl-2.0.html>

Image backgrounds, YouTube / Vimeo / Self hosted video backgrounds with parallax support.

## Description

AWB let you to use parallax backgrounds with images, videos, youtube and vimeo. [Gutenberg](https://wordpress.org/gutenberg/) and WPBakery Page Builder support.

### Links

* [Live Demo](https://wpbackgrounds.com)
* [GitHub](https://github.com/nk-o/awb)

= Features =

* Background __Types__:
  * Color
  * Image
  * Pattern images
  * Self Hosted Video
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

= Real Usage Examples =

* [SquadForce - eSports Gaming WordPress Theme](https://wp.nkdev.info/squadforce/)
* [Skylith - Multipurpose Gutenberg Theme](https://wp.nkdev.info/skylith/)
* [Youplay - Gaming Theme](https://wp.nkdev.info/youplay/)
* [Godlike - Gaming Theme](https://wp.nkdev.info/godlike/)
* [Khaki - Multipurpose Theme](https://wp.nkdev.info/khaki/)
* [Snow - Portfolio Theme](https://wp.nkdev.info/snow/)

## Installation

### Automatic installation

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of AWB, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type AWB and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

### Manual installation

The manual installation method involves downloading our AWB plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

## Frequently Asked Questions

### How to enable `Stretch` with Gutenberg

[Read in documentation](https://wpbackgrounds.com/documentation/enable-stretch-option-with-gutenberg/)

## Screenshots

1. Background color
2. Background image
3. Background video
4. Background parallax and Mouse parallax
5. Extended WPBakery Page Builder ROW options

## Changelog

= 1.7.3 =

* fixed TwentyTwenty and TwentyTwentyOne video styles conflict

= 1.7.1 =

* added support for Gutenberg Wide alignment
* added support for row gaps in WPBakery Page Builder
* added GDPR compliance parameters to Youtube and Vimeo videos
* fixed blur images on mobile devices
* fixed deprecated jQuery ready event usage

= 1.7.0 =

* added support for 3rd-party plugins, that adds WebP images
* fixed bug with clip images in Safari v14
* fixed image position when disabled parallax effect
* fixed video loop and image reset problem
* fixed JS deprecated notice
* additional styles for video elements (prevent click on video blocks)

= 1.6.7 =

* fixed color picker error in WordPress 5.5 and WPBakery Page Builder

= 1.6.6 =

* added support for WordPress 5.5

= 1.6.5 =

* added Gutenberg block inner blocks inserter (better UI)

= 1.6.4 =

* fixed GhostKit 2.10.0 and WordPress 5.4 compatibility issues

= 1.6.3 =

* fixed stretch script calculation with the latest Ghost Kit Grid

= 1.6.2 =

* added shortcode inserter in Classic block in Gutenberg
* fixed background integration for Ghost Kit Grid and Columns
* fixed WPB column background position

= 1.6.1 =

* added parallax and video preview in Gutenberg editor
* added support for Ghost Kit Custom CSS extension
* updated Jarallax library to 1.12.0
* fixed Jetpack conflict with parallax images
* fixed color picker in the latest Gutenberg
* fixed deprecation warnings in the latest Gutenberg

= 1.6.0 =

* added Focal Point picker in block background settings
* added Lazy Loading for background videos
* changed block background img tag output (fixes bug, when user with Editor permission save background image and block crashed)
* fixed background image jumping on mobile devices when scroll
* fixed reusable block error

= 1.5.10 =

* fixed WPBakery Page Builder FullWidth Row background position

= 1.5.9 =

* fixed WPBakery Page Builder Row background position

= 1.5.8 =

* fixed Gutenberg editor background preview for Pattern images
* fixed Ghost Kit Grid columns background image after WP demo import

= 1.5.7 =

* fixed JS error if Ghost Kit plugin is not installed
* fixed Gutenberg background preview

= 1.5.6 =

* added support for Ghost Kit Grid and Column blocks. [See live](https://ghostkit.io/blocks/grid/)
* added support for Ghost Kit 2.0 update
* added Loop option in Gutenberg block for videos
* fixed editor background preview styles in alignfull block
* fixed AWB video play without parallax on mobile devices
* minor changes

= 1.5.5 =

* added file types limitations in image and self hosted videos selection

= 1.5.4 =

* updated Conditionize script
* fixed usage of deprecated PanelColor

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
* changed background image to &lt;img&gt; tag with srcset support
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
* fixed self hosted video mute and loop
* fixed showing Self hosted videos if image is not set
* fixed video set aspect ratio (in some situations added black lines)

= 1.0.0 =

* Initial Release
