const CACHE_NAME = 'kwikmusic-cache-v1';

// Add URLs of resources to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/css/responsive.css',
  '/Images/bg.png',
  '/Images/Phonebg.jpeg',
  '/Images/KwikmusicLogo.png',
  '/Images/oldmusic.jpg',
  '/Images/anzar.jpg',
  '/Images/Khamishq.png',
  '/Images/Dilkiduniya.png',
  '/Images/Moonshine.png',
  '/Images/apple-touch-icon.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache failed to open:', error);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response from cache
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();
        
        // Audio files shouldn't always be cached due to their size
        if (fetchRequest.url.includes('/music/')) {
          return fetch(fetchRequest);
        }
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
      .catch((error) => {
        console.log('Fetch failed; returning offline page instead.', error);
        // You could return a custom offline page here
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle media session updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MEDIA_SESSION_UPDATE') {
    // Process media session updates from the main thread
    const { title, artist, album, artwork } = event.data;
    // Could be used for notifications or other service worker features
  }
});
