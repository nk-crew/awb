/*!
 * Name    : Advanced WordPress Backgrounds
 * Author  : nK https://nkdev.info
 */
(function ($) {
    // variables
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/g.test(navigator.userAgent || navigator.vendor || window.opera);
    const $wnd = $(window);
    const $doc = $(document);

    let wndW = 0;
    let wndH = 0;
    function getWndSize() {
        wndW = $wnd.width();
        wndH = $wnd.height();
    }
    getWndSize();
    $wnd.on('resize load orientationchange', getWndSize);

    // enable object-fit
    if (typeof objectFitImages !== 'undefined') {
        objectFitImages('.jarallax-img');
    }

    /**
     * In Viewport checker
     * return visible percent from 0 to 1
     */
    function isInViewport($item, returnRect) {
        const rect = $item[0].getBoundingClientRect();
        let result = 1;

        if (rect.right <= 0 || rect.left >= wndW) {
            result = 0;
        } else if (rect.bottom < 0 && rect.top <= wndH) {
            result = 0;
        } else {
            const beforeTopEnd = Math.max(0, rect.height + rect.top);
            const beforeBottomEnd = Math.max(0, rect.height - (rect.top + rect.height - wndH));
            const afterTop = Math.max(0, -rect.top);
            const beforeBottom = Math.max(0, rect.top + rect.height - wndH);

            if (rect.height < wndH) {
                result = 1 - (afterTop || beforeBottom) / rect.height;
            } else if (beforeTopEnd <= wndH) {
                result = beforeTopEnd / wndH;
            } else if (beforeBottomEnd <= wndH) {
                result = beforeBottomEnd / wndH;
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
    let $parallaxMouseList = false;
    let parallaxMouseTimeout;
    let parallaxMouseFirstRun = 1;

    // run parallax animation
    function parallaxMouseRun(x, y, deviceOrientation) {
        let data;
        let itemX;
        let itemY;
        $parallaxMouseList.each(function () {
            const $this = $(this);
            data = $this.data('awb-mouse-data');

            // don't animate if block isn't in viewport
            if (typeof data !== 'object' || !data.is_in_viewport && !(deviceOrientation && parallaxMouseFirstRun)) {
                return;
            }

            // device acceleration calculate
            if (deviceOrientation) {
                itemX = -data.size * x;
                itemY = -data.size * y;

            // mouse calculate
            } else {
                itemX = (data.rect.width - (x - data.rect.left)) / data.rect.width;
                itemY = (data.rect.height - (y - data.rect.top)) / data.rect.height;
                if (itemX > 1 || itemX < 0 || itemY > 1 || itemY < 0) {
                    itemX = 0.5;
                    itemY = 0.5;
                }
                itemX = data.size * (itemX - 0.5) * 2;
                itemY = data.size * (itemY - 0.5) * 2;
            }

            // if first run orientation on device, set default values without animation
            if (deviceOrientation && parallaxMouseFirstRun) {
                $this.css({
                    transform: `translateX(${itemX}px) translateY(${itemY}px) translateZ(0)`,
                });
            } else {
                $this.css({
                    transition: `transform ${deviceOrientation ? 2 : data.speed}s  cubic-bezier(0.22, 0.63, 0.6, 0.88)`,
                    transform: `translateX(${itemX}px) translateY(${itemY}px) translateZ(0)`,
                });
            }
        });
        parallaxMouseFirstRun = 0;
    }

    function parallaxMouseInit(force) {
        function run() {
            const $newParallax = $('.nk-awb .nk-awb-wrap.nk-awb-mouse-parallax').children('.nk-awb-inner');
            if ($newParallax.length) {
                // add new parallax blocks
                if ($parallaxMouseList) {
                    $parallaxMouseList = $newParallax;

                    // first init parallax
                } else {
                    $parallaxMouseList = $newParallax;

                    if (isMobile && window.DeviceOrientationEvent) {
                        $wnd.on('deviceorientation', (event) => {
                            requestAnimationFrame(() => {
                                parallaxMouseRun(event.gamma / 90, event.beta / 180, true);
                            });
                        });

                    // no smooth on firefox
                    } else {
                        $wnd.on('mousemove', (event) => {
                            requestAnimationFrame(() => {
                                parallaxMouseRun(event.clientX, event.clientY);
                            });
                        });
                    }
                }
            }

            // update data for parallax blocks
            if ($parallaxMouseList) {
                $parallaxMouseList.each(function () {
                    const $this = $(this);
                    const $parent = $this.parent();
                    const size = parseFloat($parent.attr('data-awb-mouse-parallax-size')) || 30;
                    const speed = parseFloat($parent.attr('data-awb-mouse-parallax-speed')) || 10000;

                    $this.data('awb-mouse-data', {
                        is_in_viewport: isInViewport($parent) ? $parent.is(':visible') : 0,
                        rect: $parent[0].getBoundingClientRect(),
                        size,
                        speed: speed / 1000,
                    });
                    $this.css({
                        left: -size,
                        right: -size,
                        top: -size,
                        bottom: -size,
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
    $wnd.on('resize scroll orientationchange load', parallaxMouseInit);
    setInterval(parallaxMouseInit, 3000);


    /**
     * Stretch Background
     */
    function stretchAwb() {
        $('.nk-awb:not(.wpb_column)').children('.nk-awb-wrap[data-awb-stretch="true"]').each(function () {
            const $this = $(this);
            const rect = this.getBoundingClientRect();
            const left = rect.left;
            const right = wndW - rect.right;

            const ml = parseFloat($this.css('margin-left') || 0);
            const mr = parseFloat($this.css('margin-right') || 0);
            $this.css({
                'margin-left': ml - left,
                'margin-right': mr - right,
            });
        });

        // column stretch
        $('.nk-awb.wpb_column').children('.nk-awb-wrap[data-awb-stretch="true"]').each(function () {
            const $this = $(this);
            const $row = $this.closest('.vc_row');
            const $col = $this.closest('.wpb_column');
            const rectAWB = this.getBoundingClientRect();
            const rectRow = $row[0].getBoundingClientRect();
            const rectCol = $col[0].getBoundingClientRect();
            const leftAWB = rectAWB.left;
            const rightAWB = wndW - rectAWB.right;
            const leftRow = rectRow.left + (parseFloat($row.css('padding-left')) || 0);
            const rightRow = wndW - rectRow.right + (parseFloat($row.css('padding-right')) || 0);
            const leftCol = rectCol.left;
            const rightCol = wndW - rectCol.right;
            const css = {
                'margin-left': 0,
                'margin-right': 0,
            };

            // We need to round numbers because in some situations the same blocks have different offsets, for example
            // Row right is 68
            // Col right is 68.015625
            // I don't know why :(
            if (Math.round(leftRow) === Math.round(leftCol)) {
                const ml = parseFloat($this.css('margin-left') || 0);
                css['margin-left'] = ml - leftAWB;
            }

            if (Math.round(rightRow) === Math.round(rightCol)) {
                const mr = parseFloat($this.css('margin-right') || 0);
                css['margin-right'] = mr - rightAWB;
            }

            $this.css(css);
        });
    }

    /**
     * Fix for VC stretch.
     */
    $doc.on('vc-full-width-row', function () {
        const args = Array.prototype.slice.call(arguments, 1);

        if (args.length) {
            args.forEach((item) => {
                $(item).find('.nk-awb-rendered > .nk-awb-inner').each(function () {
                    if (this.jarallax) {
                        // Check if container exists
                        // On mobile with Visual Composer this container is undefined
                        // and onResize showed console error
                        if (this.jarallax.image && this.jarallax.image.$container) {
                            this.jarallax.onResize();
                        }
                        this.jarallax.onScroll();
                    }
                });
            });
        }
    });


    /**
     * Main AWB Init
     */
    window.nkAwbInit = function () {
        // init mouse parallax
        $('.nk-awb .nk-awb-wrap[data-awb-mouse-parallax-size]').addClass('nk-awb-mouse-parallax');
        parallaxMouseInit(true);

        // prepare vc_row
        $('.nk-awb-after-vc_row').each(function () {
            const $this = $(this);
            let $vcClearfix = $this.prev('.vc_clearfix');
            $vcClearfix = $vcClearfix.length ? $vcClearfix : false;
            const $vcRow = ($vcClearfix || $this).prev('.vc_row:not(.nk-awb)');

            if ($vcRow.length) {
                const $children = $this.children('.nk-awb-wrap');

                // remove stretch option from AWB if stretch enabled on ROW
                if ($vcRow.is('[data-vc-full-width=true]')) {
                    $children.removeAttr('data-awb-stretch');
                }

                // insert AWB in row
                $vcRow.addClass('nk-awb');
                $vcRow.append($children);
            }

            $this.remove();
        });

        // prepare vc_column
        $('.nk-awb-after-vc_column').each(function () {
            const $this = $(this);
            const $vcColumn = $this.prev('.wpb_column:not(.nk-awb)');
            const $vcRow = $vcColumn.closest('.vc_row');

            if ($vcColumn.length) {
                const $children = $this.children('.nk-awb-wrap');

                // remove stretch option from AWB if stretch enabled on ROW
                if ($vcRow.is('[data-vc-stretch-content=true]')) {
                    $children.removeAttr('data-awb-stretch');
                }

                // insert AWB in row
                $vcColumn.addClass('nk-awb');
                $vcColumn.append($children);
            }

            $this.remove();
        });


        // stretch
        stretchAwb();


        // init jarallax
        if (typeof $.fn.jarallax === 'undefined') {
            return;
        }

        $('.nk-awb .nk-awb-wrap:not(.nk-awb-rendered)').each(function () {
            const $this = $(this).addClass('nk-awb-rendered');
            const type = $this.attr('data-awb-type');
            const imageBgSize = $this.attr('data-awb-image-background-size');
            const imageBgPosition = $this.attr('data-awb-image-background-position');
            let video = false;
            let videoStartTime = 0;
            let videoEndTime = 0;
            let videoVolume = 0;
            let videoAlwaysPlay = true;
            let videoMobile = false;
            const parallax = $this.attr('data-awb-parallax');
            const parallaxSpeed = $this.attr('data-awb-parallax-speed');
            const parallaxMobile = $this.attr('data-awb-parallax-mobile') !== 'false';

            // video type
            if (type === 'yt_vm_video' || type === 'video') {
                video = $this.attr('data-awb-video');
                videoStartTime = parseFloat($this.attr('data-awb-video-start-time')) || 0;
                videoEndTime = parseFloat($this.attr('data-awb-video-end-time')) || 0;
                videoVolume = parseFloat($this.attr('data-awb-video-volume')) || 0;
                videoAlwaysPlay = $this.attr('data-awb-video-always-play') === 'true';
                videoMobile = $this.attr('data-awb-video-mobile') !== 'false';
            }

            // prevent if no parallax and no video
            if (!parallax && !video) {
                return;
            }

            const jarallaxParams = {
                automaticResize: true,
                type: parallax,
                speed: parallaxSpeed,
                disableParallax: parallaxMobile ? false : /iPad|iPhone|iPod|Android/,
                disableVideo: videoMobile ? false : /iPad|iPhone|iPod|Android/,
                imgSize: imageBgSize || 'cover',
                imgPosition: imageBgPosition || '50% 50%',
            };

            if (imageBgSize === 'pattern') {
                jarallaxParams.imgSize = 'auto';
                jarallaxParams.imgRepeat = 'repeat';
            }

            if (video) {
                jarallaxParams.speed = parallax ? parallaxSpeed : 1;
                jarallaxParams.videoSrc = video;
                jarallaxParams.videoStartTime = videoStartTime;
                jarallaxParams.videoEndTime = videoEndTime;
                jarallaxParams.videoVolume = videoVolume;
                jarallaxParams.videoPlayOnlyVisible = !videoAlwaysPlay;
            }

            $this.children('.nk-awb-inner').jarallax(jarallaxParams);
        });
    };


    // init immediately
    window.nkAwbInit();

    // init after dom ready and load
    $doc.on('DOMContentLoaded load', () => {
        window.nkAwbInit();
    });

    // init stretch
    $wnd.on('resize orientationchange', stretchAwb);
}(jQuery));
