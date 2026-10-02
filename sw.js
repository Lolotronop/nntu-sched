const CACHE_VERSION = 6;
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

const APP_ROUTES =
    [
        "/",
        "/index.html",
        "/app.js",
        "/style.css",
        "/modern-normalize.css",
    ];

/**
 * @param {URL} url 
 */
function is_app_url(url) {
    if (url.origin !== self.location.origin) return false;
    if (APP_ROUTES.includes(url.pathname)) return true;
    if (url.pathname.startsWith("/group")) return true;
    if (url.pathname.startsWith("/teacher")) return true;
    return false;
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CURRENT_CACHES.app).then(cache => {
            return cache.addAll(APP_ROUTES)
        })
    )
})

self.addEventListener("fetch", (event) => {
    /** @type {Request} */
    const req = event.request;
    const url = new URL(req.url);

    event.respondWith(
        caches.open(CURRENT_CACHES.app).then(async (cache) => {
            let cached = await cache.match(event.request);
            if (!cached && is_app_url(url)) {
                cached = await cache.match("/index.html");
            }

            const networkFetch = fetch(event.request)
                .then((response) => {
                    if (response.ok && APP_ROUTES.includes(url)) {
                        cache.put(event.request, response.clone());
                    }

                    return response;
                });

            return cached || networkFetch;
        })
    );
});
