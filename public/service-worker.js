/**
 * Service Worker for PWA
 * Handles caching and offline functionality
 * Version: 3.0.0
 */

const CACHE_NAME = 'thesundaybite-v3.0.0';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/src/css/main.css',
    '/src/js/main.js',
    '/src/assets/images/Product2.jpg',
    '/src/assets/images/Product3.jpg',
    '/src/assets/images/Product.1jpg.jpg',
    '/src/assets/images/Certificate.jpg',
    '/public/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing v3.0.0...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating v3.0.0...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - Network First for HTML, Cache First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except for specific CDNs)
  if (url.origin !== location.origin) {
    // Allow Tailwind CDN, fonts, etc.
    if (!url.hostname.includes('cdn.tailwindcss.com') && 
        !url.hostname.includes('fonts.googleapis.com') &&
        !url.hostname.includes('fonts.gstatic.com')) {
      return;
    }
  }

  event.respondWith(
    (async () => {
      // Network First for HTML documents
      if (request.headers.get('accept')?.includes('text/html')) {
        try {
          const networkResponse = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          // Return offline page if available
          return caches.match('/offline.html') || new Response('Offline');
        }
      }

      // Cache First for assets (CSS, JS, images)
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        return new Response('Network error', { status: 408 });
      }
    })()
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'Sản phẩm mới từ DeltaDev Link!',
    icon: '/src/assets/images/icon-192.png',
    badge: '/src/assets/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      url: data.url || '/'
    },
    actions: [
      { action: 'explore', title: 'Xem ngay' },
      { action: 'close', title: 'Đóng' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('DeltaDev Link', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there's already a window open
          for (let client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Open new window if none exists
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen);
          }
        })
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

// Sync form data function
async function syncFormData() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const requests = await cache.keys();
    const formRequests = requests.filter(req => req.url.includes('/api/contact'));
    
    for (const request of formRequests) {
      try {
        await fetch(request.clone());
        await cache.delete(request);
        console.log('[Service Worker] Form data synced');
      } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync operation failed:', error);
  }
}

// Message event - communicate with clients
self.addEventListener('message', (event) => {
  if (event.data?.action === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data?.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});
  console.log('🔄 Syncing orders...');
}

console.log('✅ Service Worker loaded successfully');
