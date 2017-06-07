//to inject into the page
var scripts = [
	"media/static/js/content_scripts/hotkey.min.js"
];

scripts.map(function(script) {
	var s = document.createElement('script');
	s.src = chrome.extension.getURL(script);
	s.onload = function() {
	    this.parentNode.removeChild(this);
	};
	(document.head||document.documentElement).appendChild(s);
});

//to communicate with our background
var port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
      port.postMessage(event.data);
    }
}, false);