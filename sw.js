var cacheID = "mws-restaurant-001";

// Install serviceWorker
self.addEventListener('install', event => {
  // Wait until you open the cache and open all items
  event.waitUntil(
    caches.open(cacheID).then(cache => {
      return cache
      .addAll([
        "/",
        "/restaurant.html",
        "css/styles.css",
        "/data/restaurant.json",
        "/js/",
        "/js/main.js",
        "/js/restaurant_info.js",
        "/img/",
        "/js/register.js"
      ])
      .catch(error => {
        console.log("Caches open failed: " + error);
      });
    })
  );
});

// After installation, listen for fetched item.
self.addEventListener('fetch', event => {
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
    caches.match(cacheRequest).then(response => {
      return (
        response ||
        fetch(event.request)
          // If its not in the cache, fetch from the internet.
          .then(fetchResponse => {
            return caches.open(cacheID).then(cache => {
              // Put fetch in cache.
              cache.put(event.request, fetchResponse.clone());
              // Return response.
              return fetchResponse;
            });
          })
          // If there's an error, return backup image.
          .catch(error => {
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
