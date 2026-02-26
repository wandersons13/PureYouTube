// ==UserScript==
// @name         PureYouTube
// @namespace    https://github.com/wandersons13/PureYouTube
// @version      0.3
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

    const dns = ['https://s.ytimg.com', 'https://i.ytimg.com', 'https://googlevideo.com'];
    dns.forEach(url => {
        const d = document.createElement('link');
        d.rel = 'dns-prefetch';
        d.href = url;
        const p = document.createElement('link');
        p.rel = 'preconnect';
        p.href = url;
        document.head.appendChild(d);
        document.head.appendChild(p);
    });

    try {
        const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
        Object.defineProperty(navigator, 'userAgent', {
            get: () => ua
        });
        Object.defineProperty(navigator, 'vendor', {
            get: () => "Google Inc."
        });
        navigator.sendBeacon = () => true;
    } catch (e) {}

    const noop = () => {};
    window.ytcsi = {
        tick: noop,
        span: noop,
        info: noop,
        setTick: noop,
        lastTick: noop
    };
    window.ytStats = noop;
    window.ytpStats = noop;
    if (!window.yt) window.yt = {};
    window.yt.logging = {
        log: noop,
        warn: noop,
        error: noop
    };

    const css = `
        *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            scroll-behavior: auto !important;
            box-shadow: none !important;
            text-shadow: none !important;
        }
        #chat, #masthead-ad, ytd-ad-slot-renderer, ytd-merch-shelf-renderer,
        ytd-banner-promo-renderer, .ytp-ad-overlay-container, #player-ads,
        #cinematics, .ytp-glow-effect, .ytp-glow-canvas-container,
        ytd-companion-slot-renderer, .ytp-cued-thumbnail-overlay-image {
            display: none !important;
            contain: layout !important;
        }
        body.is-watch-page {
            --ytd-masthead-height: 0px !important;
            background-color: #000 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
        }
        body.is-watch-page #page-manager { margin: 0 !important; padding: 0 !important; }
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
            padding-top: 100vh !important;
            margin: 0 !important;
            display: block !important;
        }
        body.is-watch-page #columns.ytd-watch-flexy {
            margin: 0 !important;
            padding: 20px !important;
            background: #0f0f0f !important;
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    const apply = () => {
        const isWatch = location.pathname === '/watch';
        if (document.body) document.body.classList.toggle('is-watch-page', isWatch);
        if (isWatch) {
            window.dispatchEvent(new Event('resize'));
            const w = document.querySelector('ytd-watch-flexy');
            const b = document.querySelector('.ytp-size-button');
            if (b && w && !w.hasAttribute('theater')) b.click();
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
            });
        }
    };

    const run = () => requestAnimationFrame(apply);

    window.addEventListener('yt-navigate-finish', () => {
        run();
        setTimeout(run, 100);
        setTimeout(run, 500);
    });

    const init = () => {
        apply();
        const app = document.querySelector('ytd-app');
        if (app) new MutationObserver(run).observe(app, { attributes: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setInterval(() => {
        if (location.pathname === '/watch' && document.body && !document.body.classList.contains('is-watch-page')) run();
    }, 1000);
})();
