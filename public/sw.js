// Karnex Service Worker for PWA Offline Support
const CACHE_NAME = 'karnex-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/signup',
  '/manifest.json',
  '/logo-dark.png',
  '/logo-light.png',
  '/pattern.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls (always fetch fresh)
  if (url.pathname.startsWith('/api/')) return;

  // Skip Firebase/external URLs
  if (!url.origin.includes(self.location.origin)) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but update in background
        event.waitUntil(
          fetch(request).then((freshResponse) => {
            if (freshResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, freshResponse);
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // Not in cache, try network
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok && url.pathname !== '/') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/') || new Response(
            '<html><body><h1>آفلاین هستید</h1><p>لطفاً اتصال اینترنت خود را بررسی کنید.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Background sync for offline mutations (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    console.log('[SW] Background sync triggered');
  }
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  const data = event.data?.json() || { title: 'کارنکس', body: 'پیام جدید' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo-dark.png',
      badge: '/logo-dark.png'
    })
  );
});
