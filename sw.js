// import idb from "./idb";

const cacheID = "restaurant-v2";

// const dbPromise = idb.open("mws-restaurant-stage-1", 1, upgradeDB => {
//   switch (upgradeDB.oldVersion) {
//     case 0:
//       upgradeDB.createObjectStore("restaurants", {keyPath: "id"});
//   }
// });

let filesToCache = [
  "/",
  "/restaurant.html",
  "/css/styles.css",
  "/js/main.js",
  "/js/restaurant_info.js",
  "/img/",
  "/js/dbhelper.js",
  "/js/register.js",
  "/js/all.js"
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

  // Added to get rid of cors issue.
  // If its running locally, setting request mode to no cors.
  if (cacheUrlObj.hostname !== 'localhost') {
    event.request.mode = 'no-cors';
  }

  // If its in the cache, return cache.
  event.respondWith(
    caches.match(cacheRequest).then(function(response) {
      return (
        response || fetch(event.request)
          // If its not in the cache, fetch from the internet.
          .then(function(fetchResponse) {
            return caches.open(cacheID).then(function(cache) {
              // Put fetch in cache.
              cache.put(event.request, fetchResponse.clone());
              // Return response.
              return fetchResponse;
            });
          })
          // If there's an error, return backup image.
          .catch(function(error) {
            if (event.request.url.indexOf('.jpg') > -1) {
              return caches.match('/img/no-image.png');
            }
            return new Response('Application is not connected to the internet', {
              status: 404,
              statusText: "Application is not connected to the internet"
            });
          })
      );
    })
  );
});
