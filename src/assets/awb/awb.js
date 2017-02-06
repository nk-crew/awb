/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */
(function($){
    "use strict";

    var awbStretched = [];

    window.nk_awb_init = function () {
        // prepare vc_row
        $('.nk-awb-after-vc_row').each(function () {
            var $this = $(this);
            var $vc_clearfix = $this.prev('.vc_clearfix');
                $vc_clearfix = $vc_clearfix.length ? $vc_clearfix : false;
            var $vc_row = ($vc_clearfix || $this).prev('.vc_row:not(.nk-awb)');

            if ($vc_row.length) {
                var $children = $this.children('.nk-awb-inner');

                // remove stretch option from AWB if stretch enabled on ROW
                if ($vc_row.is('[data-vc-full-width=true]')) {
                    $children.removeAttr('data-awb-stretch');
                }

                // insert AWB in row
                $vc_row.addClass('nk-awb');
                $vc_row.append($children);
            }

            $this.remove();
        });


        // init jarallax
        if (typeof $.fn.jarallax === 'undefined') {
            return '';
        }

        $('.nk-awb .nk-awb-inner:not(.nk-awb-rendered)').each(function () {
            var $this = $(this).addClass('nk-awb-rendered');
            var type = $this.attr('data-awb-type');
            var image = false;
            var imageWidth = false;
            var imageHeight = false;
            var video = false;
            var videoStartTime = false;
            var videoEndTime = false;
            var parallax = $this.attr('data-awb-parallax');
            var parallaxSpeed = $this.attr('data-awb-parallax-speed');
            var parallaxMobile = $this.attr('data-awb-parallax-mobile') !== 'false';

            // image type
            if (type === 'type' || type === 'yt_vm_video' || type === 'video') {
                image = $this.attr('data-awb-image');
                imageWidth = $this.attr('data-awb-image-width');
                imageHeight = $this.attr('data-awb-image-height');
            }

            // video type
            if (type === 'yt_vm_video' || type === 'video') {
                video = $this.attr('data-awb-video');
                videoStartTime = $this.attr('data-awb-video-start-time');
                videoEndTime = $this.attr('data-awb-video-end-time');
            }

            // prevent if no parallax and no video
            if (!parallax && !video) {
                return;
            }

            var jarallaxParams = {
                type: parallax,
                imgSrc: image,
                imgWidth: imageWidth,
                imgHeight: imageHeight,
                speed: parallaxSpeed,
                noAndroid: !parallaxMobile,
                noIos: !parallaxMobile
            };

            if (video) {
                jarallaxParams.speed = parallax ? parallaxSpeed : 1;
                jarallaxParams.videoSrc = video;
                jarallaxParams.videoStartTime = videoStartTime;
                jarallaxParams.videoEndTime = videoEndTime;
            }

            $this.jarallax(jarallaxParams);
        });
    };


    // init immediately
    window.nk_awb_init();

    // init after dom ready
    $(function () {
        window.nk_awb_init();
    });


    // stretch background
    function stretch_awb () {
        $('.nk-awb .nk-awb-inner[data-awb-stretch="true"]').each(function () {
            var $this = $(this);
            var rect = this.getBoundingClientRect();
            var wndW = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var left = rect.left;
            var right = wndW - rect.right;

            if (left != 0 || right != 0) {
                var ml = parseFloat($this.css('margin-left') || 0);
                var mr = parseFloat($this.css('margin-right') || 0);
                $this.css({
                    'margin-left': ml - left,
                    'margin-right': mr - right
                })
            }
        });
    }
    stretch_awb();
    $(window).on('resize orientationchange load', stretch_awb);
})(jQuery);