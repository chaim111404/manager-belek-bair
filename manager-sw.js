const CACHE_NAME = ‘manager-v1’;
const STATIC = [
‘./manager.html’,
‘./manager-manifest.json’,
‘./manager-icon.svg’,
‘https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap’
];

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE_NAME).then(c => c.addAll(STATIC).catch(() => {}))
);
self.skipWaiting();
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, e => {
// Network first for Firebase, cache first for static
if (e.request.url.includes(‘firebase’) || e.request.url.includes(‘googleapis.com/identitytoolkit’)) {
e.respondWith(fetch(e.request).catch(() => new Response(’’, { status: 503 })));
return;
}

e.respondWith(
caches.match(e.request).then(cached => {
if (cached) return cached;
return fetch(e.request).then(res => {
if (res.ok) {
const clone = res.clone();
caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
}
return res;
}).catch(() => cached || new Response(‘אין חיבור לאינטרנט’, { status: 503 }));
})
);
});