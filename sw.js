const CACHE_NAME = 'notify-khutabari-v1';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'manifest.json',
  'icon-ns.png' // Apne icon ka sahi naam yahan confirm karein
];

// --- Install Event ---
// Saari static files ko pehli baar mein hi save kar leta hai
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('PWA: Caching Static Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Naye worker ko turant active karne ke liye
});

// --- Activate Event ---
// Purane cache ko clear karta hai jab aap version update (v1 se v2) karenge
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Turant control lene ke liye
});

// --- Fetch Event ---
// Static files cache se aayengi, Database requests network se hi rahengi
self.addEventListener('fetch', (event) => {
  // Firestore requests (google.com/firebase) ko cache nahi karna hai
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('firebasejs')) {
    return; // Firebase SDK isey khud handle karta hai
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Agar cache mein hai toh wahan se load karo, varna network se mangao
      return cachedResponse || fetch(event.request);
    })
  );
});
