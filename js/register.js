if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function(regist) {
      console.log("service worker registration successful: " + reg.regist);
    })
    .catch(function(error) {
      console.log("Registration failed: " + error);
    });
}
