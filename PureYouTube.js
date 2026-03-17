// ==UserScript==
// @name         PureYouTube
// @namespace    https://github.com/wandersons13/PureYouTube
// @version      0.4
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

    const trackerRegex = /(analytics|doubleclick|log_event|stats\/ads|ptracking|v1\/log_event|pings|monitoring|sentry|feedback|notification)/i;

    window.fetch = new Proxy(window.fetch, {
        apply(target, thisArg, args) {
            const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
            if (trackerRegex.test(url)) return Promise.resolve(new Response("", { status: 204 }));
            return Reflect.apply(target, thisArg, args);
        }
    });

    const nativeXHR = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (trackerRegex.test(url)) {
            this.send = () => {};
            return;
        }
        return nativeXHR.apply(this, arguments);
    };

    document.documentElement.setAttribute('dark', 'true');
    document.documentElement.style.backgroundColor = '#000';

    ['https://s.ytimg.com', 'https://i.ytimg.com', 'https://googlevideo.com'].forEach(url => {
        const p = document.createElement('link');
        p.rel = 'preconnect';
        p.href = url;
        document.head.appendChild(p);
    });

    const noop = () => {};
    window.ytcsi = { tick: noop, span: noop, info: noop, setTick: noop, lastTick: noop };
    window.ytStats = noop; window.ytpStats = noop;
    if (!window.yt) window.yt = {};
    window.yt.logging = { log: noop, warn: noop, error: noop };
    try { navigator.sendBeacon = () => true; } catch(e) {}

    const css = `
        *, *::before, *::after {
            transition: none !important;
            animation: none !important;
            scroll-behavior: auto !important;
        }

        #chat, #masthead-ad, ytd-ad-slot-renderer, ytd-merch-shelf-renderer, ytd-banner-promo-renderer,
        .ytp-ad-overlay-container, #player-ads, #cinematics, .ytp-glow-effect, .ytp-glow-canvas-container,
        ytd-companion-slot-renderer, .ytp-cued-thumbnail-overlay-image, .ytp-size-button {
            display: none !important;
        }

        body.is-watch-page {
            --ytd-masthead-height: 0px !important;
            background-color: #000 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
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
            padding-top: 100vh !important;
            margin: 0 !important;
            display: block !important;
        }

        body.is-watch-page #columns.ytd-watch-flexy {
            margin: 0 !important;
            padding: 20px !important;
            background: #0f0f0f !important;
        }

        body.is-watch-page.user-inactive #player-theater-container,
        body.is-watch-page.user-inactive video {
            cursor: none !important;
        }
        body.is-watch-page.user-inactive .ytp-chrome-bottom,
        body.is-watch-page.user-inactive .ytp-chrome-top,
        body.is-watch-page.user-inactive .ytp-gradient-bottom,
        body.is-watch-page.user-inactive .ytp-gradient-top {
            opacity: 0 !important;
            transition: opacity 0.3s ease !important;
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    let hideTimeout;

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
            setupAutoHide();
        }
    };

    const setupAutoHide = () => {
        const resetTimer = () => {
            document.body.classList.remove('user-inactive');
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => {
                document.body.classList.add('user-inactive');
            }, 2000);
        };

        ['mousemove', 'mousedown', 'keydown', 'touchstart'].forEach(e => {
            window.addEventListener(e, resetTimer, { passive: true });
        });
    };

    window.addEventListener('yt-navigate-finish', () => {
        window.scrollTo(0, 0);
        requestAnimationFrame(apply);
        setTimeout(() => requestAnimationFrame(apply), 100);
    });

    const init = () => {
        apply();
        const app = document.querySelector('ytd-app');
        if (app) new MutationObserver(() => requestAnimationFrame(apply)).observe(app, { attributes: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    setInterval(() => {
        if (location.pathname === '/watch' && document.body && !document.body.classList.contains('is-watch-page')) {
            requestAnimationFrame(apply);
        }
    }, 1000);
})();
