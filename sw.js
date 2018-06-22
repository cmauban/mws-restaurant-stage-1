var cacheID = "mws-restaurant-001";

// Install serviceWorker
self.addEventListener('install', event => {
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
