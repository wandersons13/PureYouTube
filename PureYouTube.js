// ==UserScript==
// @name         PureYouTube
// @namespace    https://github.com/wandersons13/PureYouTube
// @version      0.6
// @description  Cinematic layout, bloat-free performance and instant loading.
// @author       wandersons13
// @match        *://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// @license      GNU
// ==/UserScript==

(function () {
    'use strict';

    const noop = () => {};
    window.ytcsi = {
        tick: noop,
        span: noop,
        info: noop,
        setTick: noop,
        lastTick: noop
    };
    window.ytStats = noop;

    const root = document.head || document.documentElement;

    const preconnect = [
        'https://www.youtube.com',
        'https://i.ytimg.com',
        'https://s.ytimg.com',
        'https://rr1---sn.googlevideo.com',
        'https://rr2---sn.googlevideo.com',
        'https://youtubei.googleapis.com'
    ];

    preconnect.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        root.appendChild(link);
    });

    const css = `
        #chat, #masthead-ad, ytd-ad-slot-renderer, ytd-merch-shelf-renderer,
        ytd-banner-promo-renderer, .ytp-ad-overlay-container, #player-ads,
        #cinematics, .ytp-glow-effect, .ytp-glow-canvas-container,
        ytd-companion-slot-renderer, .ytp-cued-thumbnail-overlay-image,
        .ytp-size-button { display: none !important; }

        body.is-watch-page {
            --ytd-masthead-height: 0px !important;
            background-color: #000 !important;
            overflow-x: hidden !important;
        }

        body.is-watch-page #page-manager {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        body.is-watch-page #masthead-container {
            position: absolute !important;
            top: 100vh !important;
            left: 0 !important;
            width: 100% !important;
            z-index: 50 !important;
        }

        body.is-watch-page #player-theater-container,
        body.is-watch-page #full-bleed-container,
        body.is-watch-page #player-container-outer,
        body.is-watch-page #player-container-inner,
        body.is-watch-page #player-container,
        body.is-watch-page #player,
        body.is-watch-page ytd-player#ytd-player,
        body.is-watch-page video.html5-main-video {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 2001 !important;
            background: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            object-fit: contain !important;
        }

        body.is-watch-page ytd-watch-flexy {
            padding-top: calc(100vh + 20px) !important;
            margin-top: 0 !important;
            display: block !important;
        }

        body.is-watch-page #columns.ytd-watch-flexy {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        * { box-shadow: none !important; text-shadow: none !important; }
    `;

    const style = document.createElement('style');
    style.id = 'pure-yt-final';
    style.textContent = css;
    root.appendChild(style);

    const applyFix = () => {
        const isWatch = location.pathname === '/watch';
        if (document.body) {
            document.body.classList.toggle('is-watch-page', isWatch);
        }
        if (isWatch) {
            window.dispatchEvent(new Event('resize'));
        }
    };

    const earlyApply = () => {
        if (location.pathname === '/watch' && document.documentElement) {
            document.documentElement.classList.add('is-watch-page');
        }
    };

    document.addEventListener('yt-navigate-start', () => {
        earlyApply();

        const v = document.querySelector('video');
        if (v) {
            v.pause();
            setTimeout(() => v.play().catch(() => {}), 150);
        }
    }, true);

    window.addEventListener('yt-navigate-finish', () => {
        applyFix();
        setTimeout(applyFix, 100);
        setTimeout(applyFix, 500);
    });

    const init = () => {
        earlyApply();
        applyFix();

        const app = document.querySelector('ytd-app');
        if (app) {
            new MutationObserver(applyFix).observe(app, {
                attributes: true
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setInterval(() => {
        if (location.pathname === '/watch' && document.body && !document.body.classList.contains('is-watch-page')) {
            applyFix();
        }
    }, 1000);

})();
