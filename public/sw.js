// This file is intentionally left as a placeholder.
// next-pwa will automatically generate the service worker code 
// during the build process and replace this file.
// It will handle caching strategies, offline capabilities, etc.

self.addEventListener('install', function(event) {
  console.log('Service worker installed');
});

self.addEventListener('activate', function(event) {
  console.log('Service worker activated');
});

self.addEventListener('fetch', function(event) {
  // Default fetch handling
  event.respondWith(
    fetch(event.request)
      .catch(function() {
        // Return a fallback if offline
        return caches.match('/offline.html');
      })
  );
}); 