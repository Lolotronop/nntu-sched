const CACHE_VERSION = 1;
const CURRENT_CACHES = {
    app: `app-v${CACHE_VERSION}`,
};

self.addEventListener("activate", (event) => {
    // Delete all caches that aren't named in CURRENT_CACHES.
    // While there is only one cache in this example, the same logic
    // will handle the case where there are multiple versioned caches.
    const expectedCacheNamesSet = new Set(Object.values(CURRENT_CACHES));
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!expectedCacheNamesSet.has(cacheName)) {
                        // If this cache name isn't present in the set of
                        // "expected" cache names, then delete it.
                        console.log("Deleting out of date cache:", cacheName);
                        return caches.delete(cacheName);
                    }
                    return undefined;
                }),
            ),
        ),
    );
})

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CURRENT_CACHES.app).then(cache => {
            cache.addAll(
                [
                    "/",
                    "/index.html",
                    "/app.js",
                    "/sw.js",
                    "/style.css",
                    "/modern-normalize.css",
                ]
            )
        })
    )
})

self.addEventListener("fetch", (event) => {
    console.log("Handling fetch event for", event.request.url);

    event.respondWith(
        caches
            .open(CURRENT_CACHES.app)
            .then((cache) => cache.match(event.request))
            .then((response) => {
                if (response) return response;
                else return fetch(event.request);
            })
            .catch((error) => {
                console.error("  Error in fetch handler:", error);
                throw error;
            }),
    );
});
