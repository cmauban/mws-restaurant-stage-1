// import idb from "js/idb.js";

const cacheID = "restaurant-v2";

let filesToCache = [
  "/",
  "/restaurant.html",
  "/css/styles.css",
  "/js/idb.js",
  "/sw.js",
  "/js/main.js",
  "/js/restaurant_info.js",
  "/img/",
  "/js/dbhelper.js",
  "/js/register.js"
];


// Install serviceWorker
self.addEventListener('install', function(event) {
  // Wait until you open the cache and open all items
  event.waitUntil(
    caches.open(cacheID).then(function(cache) {
      return cache
      .addAll(filesToCache)
      .catch(error => {
        console.log("Caches open failed: " + error);
      });
    })
  );
});

// After installation, listen for fetched item.
self.addEventListener('fetch', function(event) {
  let cacheRequest = event.request;
  let cacheUrlObj = new URL(event.request.url);

  // Check to see if fetched item is in cache.
  if (event.request.url.indexOf('restaurant.html') > -1) {
    const cacheURL = 'restaurant.html';
    cacheRequest = new Request(cacheURL);
  }

  event.respondWith(
    caches.match(cacheRequest).then(function(response) {
      // If its in the cache, return cache.
      if (response) {
        return response;
      }

      return fetch(cacheRequest).then(function(response) {

        // clone the response
        var responseToCache = response.clone();

        // if its not in the cache, fetch from the internet.
        caches.open(cacheID).then(function(cache) {
          // Put fetch in cache.
          cache.put(cacheRequest, responseToCache);
        });

        return response;
      });

    })
  );


});
