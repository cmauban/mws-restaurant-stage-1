if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(regist) {
      console.log("service worker registration successful: " + regist.scope);
    })
    .catch(function(error) {
      console.log("Registration failed: " + error);
    });
}
