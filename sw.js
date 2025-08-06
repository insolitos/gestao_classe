const CACHE_NAME = 'class-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/icons/icon.svg',
  '/images/icons/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberta');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

self.addEventListener('widgetinstall', event => {
  console.log('Widget installed', event);
  event.waitUntil(renderWidget(event.widget));
});

self.addEventListener('widgetuninstall', event => {
  console.log('Widget uninstalled', event);
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'my-sync-tag') {
    event.waitUntil(doSomeSync());
  }
});

function doSomeSync() {
  console.log('Background sync in progress');
  // Add your sync logic here
  return Promise.resolve();
}

async function renderWidget(widget) {
    // For now, we'll just log the widget object
    console.log('Rendering widget:', widget);
}
