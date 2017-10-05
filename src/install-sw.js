/* (function () {
	function a() {
		location.href = "cache.html?redirect_url=" + encodeURIComponent(location.href)
	}
	"https:" === location.protocol && ("serviceWorker" in navigator && !navigator.serviceWorker.controller ? navigator.serviceWorker.register("sw.js") : "applicationCache" in window && (null !== localStorage ? "1" !== localStorage.getItem("cached-by-gulp-sww") && a() : "#no-redirect" !== location.hash && a()))
})() */


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
