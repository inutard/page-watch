chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getUpdates") {
      sendResponse({updates: localStorage["updates"]});
    } else if (request.method == "addWebsite") {
      //set websites, give update watchers some info
      addWatcher("www.google.com");
    }
});

window.setInterval(function(){
  updateWatchers();
}, 600);