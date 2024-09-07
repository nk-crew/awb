# Advanced WordPress Backgrounds

* Contributors: nko
* Tags: parallax, video, youtube, background, gutenberg
* Requires at least: 6.2
* Tested up to: 6.6
* Requires PHP: 7.2
* Stable tag: @@plugin_version
* License: GPLv2 or later
* License URI: <http://www.gnu.org/licenses/gpl-2.0.html>

Easy to use advanced Parallax, Image and Video backgrounds block plugin with parallax and video support.

## Description

**Parallax, Image and Video Backgrounds Plugin For WordPress**
★★★★★<br>

**Create any type of backgrounds using advanced block settings**. We created [**Advanced WordPress Backgrounds plugin**](https://wpbackgrounds.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head) to insert the Youtube and Image Parallax backgrounds with a few clicks on block sites of our clients.

[See Live Demo](https://wpbackgrounds.com/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head) | [Documentation](https://wpbackgrounds.com/docs/getting-started/?utm_source=wordpress.org&utm_medium=readme&utm_campaign=head) | [GitHub](https://github.com/nk-crew/awb/)

### Features

* Background **Types**:
  * Color
  * Image
  * Post Featured Image
  * Pattern images
  * Self Hosted Video
  * Youtube / Vimeo Video
* **Parallax** options powered by high performance JavaScript plugin [Jarallax](https://github.com/nk-o/jarallax/)
  * Custom speed option
  * Enable / Disable for mobile devices option
  * Scroll effect
  * Opacity effect
  * Scale effect
  * Scroll + Opacity effect
  * Scroll + Scale effect
* **Mouse Parallax**
* Custom **video** start & end time
* srcset supported (i.e. Google love it)
* **Overlay** color with transparency options
* **Gutenberg** block supported
* **WPBakery Page Builder** supported (extended row and col options + separate shortcode)
* Custom CSS offsets (paddings + margins)

## Installation

### Automatic installation

Automatic installation is the easiest option as WordPress handles the file transfers itself and you don’t need to leave your web browser. To do an automatic install of AWB, log in to your WordPress dashboard, navigate to the Plugins menu and click Add New.

In the search field type AWB and click Search Plugins. Once you’ve found our plugin you can view details about it such as the point release, rating and description. Most importantly of course, you can install it by simply clicking “Install Now”.

### Manual installation

The manual installation method involves downloading our AWB plugin and uploading it to your webserver via your favourite FTP application. The WordPress codex contains [instructions on how to do this here](https://codex.wordpress.org/Managing_Plugins#Manual_Plugin_Installation).

## Screenshots

1. Background color
2. Background image
3. Background video
4. Background parallax and Mouse parallax
5. Extended WPBakery Page Builder ROW options

## Changelog

= 1.12.4 - Sep 7, 2024 =

* added escaping to imageTag attribute in the AWB block to prevent xss vulnerability

= 1.12.3 - Mar 27, 2024 =

* fixed background settings display in Ghost Kit columns
* fixed parallax option enabled on block with Color background type

= 1.12.2 - Mar 9, 2024 =

* added support for private Vimeo videos hash in URL
* fixed `play` method play when `endTime` reached
* fixed rendering styles error in editor iframe and latest Gutenberg

= 1.12.1 - Nov 13, 2023 =

* improved EditorStyles component to use portals in WP editor
* fixed error in WP editor because of missing lodash dependency

= 1.12.0 - Nov 12, 2023 =

* added support for new Ghost Kit extensions
* removed Ghost Kit spacings fallback feature, use Gutenberg spacings instead
* fixed default AWB padding in editor
* changed attributes registration from JS to PHP

= 1.11.5 - Oct 26, 2023 =

* change block apiVersion to v3
* fixed parallax speed 0 in AWB block
* fixed JS error inside iframe in block editor

= 1.11.4 - May 17, 2023 =

* fixed JS error in TwentyTwenty and TwentyTwentyOne themes

= 1.11.3 - May 10, 2023 =

* fixed JS error when WPBakery FullHeight row used

= 1.11.2 - May 10, 2023 =

* improved Stretch script to use `before-init` event with provided elements - better performance
* fixed wrong column background calculation in WPBakery Page Builder

= 1.11.1 - May 9, 2023 =

* added support for `Layout`, `Block Gap`, `Min Heigh` and `Typography` settings in the (Gutenberg block)
* added support for gradients in background and overlay (Gutenberg block)
* added `Fill` option in background size setting
* added `IntersectionObserver` for Mouse Parallax to detect element in viewport (increased performance)
* added JS events to init internal components and for 3rd-party code
* added global JS object `AWB`
* improved srcset fix code to work with some popular lazy loading data attributes
* removed jQuery dependency from frontend script (less code required)
* removed Pro tab from plugin settings
* deprecated public function `nkAwbInit`, use `AWB.init()` instead
* fixed image blinking when disabled browser cache and added new elements or screen resized
* fixed empty FullWidth block setting in the GhostKit Column settings

= 1.10.0 - Dec 27, 2022 =

* added `IntersectionObserver` to detect element in viewport (increased performance)
* added support for Youtube Shorts
* added support for Vimeo high quality thumbnails
* improved rendering of Featured Image - use faster method without `DOMDocument`

= 1.9.4 - Aug 29, 2022 =

* fixed error on widgets screen

= 1.9.3 - Aug 27, 2022 =

* fixed shortcode builder "Enable on Mobile Devices" checkbox displaying for Local videos
* renamed `Local Video` to `Self Hosted Video`

= 1.9.2 - Aug 15, 2022 =

* fixed self-hosted video preview loading in block editor
* fixed Youtube / Vimeo video preview image loading in block editor

= 1.9.1 - Aug 11, 2022 =

* added fallback image url in Gutenberg block preview to display image faster when page loaded
* improved rest permissions check

= 1.9.0 - Jul 22, 2022 =

* added support for Featured Image in the block background
* added `nk-awb` classname to the block in editor
* fixed block preview in FSE templates editor
* fixed parallax re-rendering in the editor when the props were not changed
* removed `will-change` usage from parallax - fixed the warning in the inspector in Firefox browser

= 1.8.1 - Feb 19, 2022 =

* fixed tinymce error - `Failed to initialize plugin: awb`
* disabled block align fallback in block-based themes

= 1.8.0 - Feb 18, 2022 =

* dropped support for IE and old browsers
* added support for block-based themes and WordPress 5.9
* added Media Opacity and Background Color attributes to Gutenberg block
* changed block to Blocks API v2 (less wrappers in the Gutenberg editor)
* fixed block re-saving when image tag fetched
* fixed invalid CSS for WPBakery gaps
* removed usage of DOMContentLoaded for register block
* minor changes

= 1.7.7 - Dec 1, 2021 =

* added encode/decode to Gutenberg block image tag attribute
* fixed shortcode inserter color overlay selection
* fixed conflict with PublishPress Blocks plugin
* fixed React state change inside render callback

= 1.7.6 - Aug 31, 2021 =

* added WP 5.8 support

= 1.7.5 - May 12, 2021 =

* added accessibility attributes to background videos (tabindex, aria-hidden)
* fixed video start and end time save in block

= 1.7.4 - Mar 4, 2021 =

* tested up to WordPress 5.7
* moved to nk-crew GitHub repo

= 1.7.3 - Feb 8, 2021 =

* fixed TwentyTwenty and TwentyTwentyOne video styles conflict

= 1.7.1 - Jan 7, 2021 =

* added support for Gutenberg Wide alignment
* added support for row gaps in WPBakery Page Builder
* added GDPR compliance parameters to Youtube and Vimeo videos
* fixed blur images on mobile devices
* fixed deprecated jQuery ready event usage

= 1.7.0 - Sep 23, 2020 =

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
