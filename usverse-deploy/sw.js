const CACHE_NAME = 'usverse-app-v3';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch(err => {
                // Nếu CDN lỗi, vẫn cache được file local
                console.warn('Cache addAll partial fail:', err);
                return cache.addAll(['./index.html', './manifest.json', './css/style.css']);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Network first, fallback to cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Cache bản mới nhất
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});