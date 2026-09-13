/**
 * @fileoverview Service Worker â€” offline-first caching strategy for
 *               the AI Legal Assistance & Access platform.
 * Strategy:
 *   - Static shell (HTML, CSS, JS) â†’ Cache First
 *   - Gemini API calls             â†’ Network Only
 *   - Google Fonts                 â†’ Stale-While-Revalidate
 *
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

const CACHE_NAME  = 'legal-ai-v1.0.0';
const OFFLINE_URL = '/index.html';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/ui.js',
  '/js/gemini.js',
  '/js/document.js',
  '/js/analysis.js',
  '/js/checklist.js',
  '/js/app.js',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.hostname === 'generativelanguage.googleapis.com') { return; }
  if (url.hostname.includes('google-analytics.com') || url.hostname.includes('googletagmanager.com')) { return; }

  if (request.method === 'GET' && (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') || url.pathname.endsWith('.html'))) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) { return cached; }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') { return response; }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  if (url.hostname === 'fonts.gstatic.com' || url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
