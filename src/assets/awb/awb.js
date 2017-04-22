/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */
(function($){
    "use strict";

    // variables
    var tween = typeof TweenMax !== 'undefined' ? TweenMax : false;
    var isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || window.opera);
    var isFireFox = typeof InstallTrigger !== 'undefined';
    var $wnd = $(window);
    var wndW = 0;
    var wndH = 0;
    function getWndSize () {
        wndW = $wnd.width();
        wndH = $wnd.height();
    }
    getWndSize();
    $wnd.on('resize load orientationchange', getWndSize);

    /**
     * In Viewport checker
     * return visible percent from 0 to 1
     */
    function is_in_viewport ($item, returnRect) {
        var rect = $item[0].getBoundingClientRect();
        var result = 1;

        if (rect.right <= 0 || rect.left >= wndW) {
            result = 0;
        }
        else if (rect.bottom < 0 && rect.top <= wndH) {
            result = 0;
        } else {
            var beforeTopEnd = Math.max(0, rect.height + rect.top);
            var beforeBottomEnd = Math.max(0, rect.height - (rect.top + rect.height - wndH));
            var afterTop = Math.max(0, -rect.top);
            var beforeBottom = Math.max(0, rect.top + rect.height - wndH);
            if(rect.height < wndH) {
                result = 1 - (afterTop || beforeBottom) / rect.height;
            } else {
                if(beforeTopEnd <= wndH) {
                    result = beforeTopEnd / wndH;
                } else if (beforeBottomEnd <= wndH) {
                    result = beforeBottomEnd / wndH;
                }
            }
            result = result < 0 ? 0 : result;
        }
        if (returnRect) {
            return [result, rect];
        }
        return result;
    }


    /**
     * Mouse Parallax
     */
    var $parallaxMouseList = false;
    var parallaxMouseTimeout;
    var parallaxMouseFirstRun = 1;

    // run parallax animation
    function parallax_mouse_run (x, y, deviceOrientation) {
        if (!tween) {
            return;
        }

        var data;
        var itemX;
        var itemY;
        $parallaxMouseList.each(function () {
            data = $(this).data('nk-parallax-mouse-data');

            // don't animate if block isn't in viewport
            if (typeof data !== 'object' || !data.is_in_viewport && !(deviceOrientation && parallaxMouseFirstRun)) {
                return;
            }

            // device acceleration calculate
            if (deviceOrientation) {
                itemX = - data.size * x;
                itemY = - data.size * y;

            // mouse calculate
            } else {
                itemX = (data.rect.width - (x - data.rect.left)) / data.rect.width;
                itemY = (data.rect.height - (y - data.rect.top)) / data.rect.height;
                if(itemX > 1 || itemX < 0 || itemY > 1 || itemY < 0) {
                    itemX = 0.5;
                    itemY = 0.5;
                }
                itemX = data.size * (itemX  - 0.5) * 2;
                itemY = data.size * (itemY  - 0.5) * 2;
            }

            // if first run orientation on device, set default values without animation
            if (deviceOrientation && parallaxMouseFirstRun) {
                tween.set(this, {
                    x: itemX,
                    y: itemY
                });
            } else {
                tween.to(this, deviceOrientation ? 2 : data.speed, {
                    x: itemX,
                    y: itemY
                });
            }
        });
        parallaxMouseFirstRun = 0;
    }

    function parallax_mouse_init (force) {
        if (!tween) {
            return;
        }

        function run () {
            var $newParallax = $('.nk-awb .nk-awb-wrap.nk-awb-mouse-parallax').children('.nk-awb-inner');
            if ($newParallax.length) {
                // add new parallax blocks
                if ($parallaxMouseList) {
                    $parallaxMouseList = $newParallax;
                }

                // first init parallax
                else {
                    $parallaxMouseList = $newParallax;
                    if (isMobile && window.DeviceOrientationEvent) {
                        $wnd.on('deviceorientation', function () {
                            parallax_mouse_run(event.gamma / 90, event.beta / 180, true);
                        });

                    // no smooth on firefox
                    } else if (!isFireFox) {
                        $wnd.on('mousemove', function (event) {
                            parallax_mouse_run(event.clientX, event.clientY);
                        });
                    }
                }
            }

            // update data for parallax blocks
            if ($parallaxMouseList) {
                $parallaxMouseList.each(function () {
                    var $this = $(this);
                    var $parent = $this.parent();
                    var size = parseFloat($parent.attr('data-awb-mouse-parallax-size')) || 30;
                    var speed = parseFloat($parent.attr('data-awb-mouse-parallax-speed')) || 10000;
                    $this.data('nk-parallax-mouse-data', {
                        is_in_viewport: is_in_viewport($parent) ? $parent.is(':visible') : 0,
                        rect: $parent[0].getBoundingClientRect(),
                        size: size,
                        speed: speed / 1000
                    });
                    $this.css({
                        left: -size,
                        right: -size,
                        top: -size,
                        bottom: -size
                    });
                });
            }
        }

        // run force without timeout
        clearTimeout(parallaxMouseTimeout);
        if (force) {
            run();
        } else {
            parallaxMouseTimeout = setTimeout(parallaxMouseTimeout, 100);
        }
    }
    $wnd.on('resize scroll orientationchange load', parallax_mouse_init);
    setInterval(parallax_mouse_init, 3000);


    /**
     * Stretch Background
     */
    function stretch_awb () {

        $('.nk-awb:not(.wpb_column)').children('.nk-awb-wrap[data-awb-stretch="true"]').each(function () {
            var $this = $(this);
            var rect = this.getBoundingClientRect();
            var left = rect.left;
            var right = wndW - rect.right;

            var ml = parseFloat($this.css('margin-left') || 0);
            var mr = parseFloat($this.css('margin-right') || 0);
            $this.css({
                'margin-left': ml - left,
                'margin-right': mr - right
            });
        });

        // column stretch
        $('.nk-awb.wpb_column').children('.nk-awb-wrap[data-awb-stretch="true"]').each(function () {
            var $this = $(this);
            var $row = $this.parents('.vc_row:eq(0)');
            var $col = $this.parents('.wpb_column:eq(0)');
            var rectAWB = this.getBoundingClientRect();
            var rectRow = $row[0].getBoundingClientRect();
            var rectCol = $col[0].getBoundingClientRect();
            var leftAWB = rectAWB.left;
            var rightAWB = wndW - rectAWB.right;
            var leftRow = rectRow.left + (parseFloat($row.css('padding-left')) || 0);
            var rightRow = wndW - rectRow.right + (parseFloat($row.css('padding-right')) || 0);
            var leftCol = rectCol.left;
            var rightCol = wndW - rectCol.right;
            var css = {
                'margin-left': 0,
                'margin-right': 0
            };

            // We need to round numbers because in some situations the same blocks have different offsets, for example
            // Row right is 68
            // Col right is 68.015625
            // I don't know why :(
            if (Math.round(leftRow) == Math.round(leftCol)) {
                var ml = parseFloat($this.css('margin-left') || 0);
                css['margin-left'] = ml - leftAWB;
            }

            if (Math.round(rightRow) == Math.round(rightCol)) {
                var mr = parseFloat($this.css('margin-right') || 0);
                css['margin-right'] = mr - rightAWB;
            }

            $this.css(css);
        });
    }


    /**
     * Main AWB Init
     */
    window.nk_awb_init = function () {
        // init mouse parallax
        $('.nk-awb .nk-awb-wrap[data-awb-mouse-parallax-size]').addClass('nk-awb-mouse-parallax');
        parallax_mouse_init(true);

        // prepare vc_row
        $('.nk-awb-after-vc_row').each(function () {
            var $this = $(this);
            var $vc_clearfix = $this.prev('.vc_clearfix');
                $vc_clearfix = $vc_clearfix.length ? $vc_clearfix : false;
            var $vc_row = ($vc_clearfix || $this).prev('.vc_row:not(.nk-awb)');

            if ($vc_row.length) {
                var $children = $this.children('.nk-awb-wrap');

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

        // prepare vc_column
        $('.nk-awb-after-vc_column').each(function () {
            var $this = $(this);
            var $vc_column = $this.prev('.wpb_column:not(.nk-awb)');
            var $vc_row = $vc_column.parents('.vc_row:eq(0)');

            if ($vc_column.length) {
                var $children = $this.children('.nk-awb-wrap');

                // remove stretch option from AWB if stretch enabled on ROW
                if ($vc_row.is('[data-vc-stretch-content=true]')) {
                    $children.removeAttr('data-awb-stretch');
                }

                // insert AWB in row
                $vc_column.addClass('nk-awb');
                $vc_column.append($children);
            }

            $this.remove();
        });


        // stretch
        stretch_awb();


        // init jarallax
        if (typeof $.fn.jarallax === 'undefined') {
            return '';
        }

        $('.nk-awb .nk-awb-wrap:not(.nk-awb-rendered)').each(function () {
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
            if (type === 'image' || type === 'yt_vm_video' || type === 'video') {
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

            $this.children('.nk-awb-inner').jarallax(jarallaxParams);
        });
    };


    // init immediately
    window.nk_awb_init();

    // init after dom ready
    $(function () {
        window.nk_awb_init();
    });

    // init stretch
    stretch_awb();
    $wnd.on('resize orientationchange load', stretch_awb);
})(jQuery);