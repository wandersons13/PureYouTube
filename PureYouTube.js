// ==UserScript==
// @name         PureYouTube
// @namespace    https://github.com/wandersons13/PureYouTube
// @version      0.1
// @description  Cinematic layout, bloat-free performance and instant loading.
// @author       wandersons13
// @match        *://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @run-at       document-start
// @license      GNU
// ==/UserScript==

(function() {
    'use strict';

    const noop = () => {};
    window.ytcsi = { tick: noop, span: noop, info: noop, setTick: noop, lastTick: noop };
    window.ytStats = noop;

    const css = `
        #chat, #masthead-ad, ytd-ad-slot-renderer, ytd-merch-shelf-renderer,
        ytd-banner-promo-renderer, .ytp-ad-overlay-container, #player-ads,
        #cinematics, .ytp-glow-effect, .ytp-glow-canvas-container,
        ytd-companion-slot-renderer, .ytp-cued-thumbnail-overlay-image { display: none !important; }

        body.is-watch-page {
            --ytd-masthead-height: 0px !important;
            background-color: #000 !important;
            overflow-x: hidden !important;
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
            transform: none !important;
            object-fit: contain !important;
            transition: all 0.1s ease !important;
        }

        body.is-watch-page #masthead-container {
            position: absolute !important;
            top: 100vh !important;
            left: 0 !important;
            width: 100% !important;
            z-index: 50 !important;
            display: block !important;
        }

        body.is-watch-page ytd-watch-flexy {
            padding-top: calc(100vh + 56px) !important;
            margin: 0 !important;
            position: relative !important;
            display: block !important;
        }

        body.is-watch-page #columns.ytd-watch-flexy {
            display: flex !important;
            width: 100% !important;
            max-width: 1280px !important;
            margin: 0 auto !important;
        }

        body.is-watch-page #primary.ytd-watch-flexy { flex: 1 !important; padding-right: 24px !important; }
        body.is-watch-page #secondary.ytd-watch-flexy { width: 380px !important; }

        * { box-shadow: none !important; text-shadow: none !important; }
    `;

    const style = document.createElement('style');
    style.id = 'pure-yt-final';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    const applyFix = () => {
        const isWatch = location.pathname === '/watch';
        if (document.body) {
            document.body.classList.toggle('is-watch-page', isWatch);
        }

        if (isWatch) {
            window.dispatchEvent(new Event('resize'));
            const theaterBtn = document.querySelector('.ytp-size-button');
            const watch = document.querySelector('ytd-watch-flexy');
            if (theaterBtn && watch && !watch.hasAttribute('theater')) {
                theaterBtn.click();
            }
        }
    };

    window.addEventListener('yt-navigate-finish', applyFix);
    window.addEventListener('yt-page-type-changed', applyFix);

    const init = () => {
        applyFix();
        const app = document.querySelector('ytd-app');
        if (app) {
            new MutationObserver(applyFix).observe(app, { attributes: true, attributeFilter: ['theater'] });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
