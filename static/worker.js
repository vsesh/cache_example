const CACHE_VERSION = 'v5';

self.addEventListener('install', (event) => {
    console.log('SW:: install');
    event.waitUntil(clearCache());
});

self.addEventListener('activate', (event) => {
    console.log('SW:: activate');
    event.waitUntil(activate());
});

self.addEventListener('fetch', function(event) {
    console.log('SW:: fetch');
    const url = event.request.url;
    if (url.includes('service-worker-fake')) {
        event.respondWith(getFakeResponse());
    } else if (url.includes('service-worker')) {
        event.respondWith(makeRequest(event.request));
    }
});

async function clearCache() {
    const cacheLists = await caches.keys();
    return Promise.all(
        cacheLists.map((cacheName) => {
            console.log(`Cache "${cacheName}" was removed`);
            // if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
            // }
        })
    );
}

async function activate() {
    return clients.claim();
}

async function makeRequest(request) {
    let value = await caches.match(request);
    if (!value) {
        const response = await fetch(request);
        if (response.ok) {
            console.log(`SW:: ${request.url} request`);
            caches.open(CACHE_VERSION).then((cache) => {
                cache.put(request, response);
            });
        }
        return response.clone();
    } else {
        console.log(`SW:: ${request.url} (from cache)`);
    }
    return value;
}

async function getFakeResponse() {
    return new Response('I AM ERROR');
}
