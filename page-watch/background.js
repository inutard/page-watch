var storage = chrome.storage.local;

//listening for popup requests
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.type == "addWebsite") {
      //set websites, give update watchers some info
      addWatcher("www.google.com");
    }
});

//add a watcher to a website
function addWatcher(url) {
  var setWebsite = function(items) {
    items[url] = '';
    storage.set({'watchedWebsites' : items}, function() {
      message('Settings saved');
    });
  }
  storage.get({'watchedWebsites' : {}}, setWebsite(items));
}

function updateWatchers() {
  var checkWebsites = function(items) {
    for (var site in items) {
      var handleContents = function(contents) {
        if (hash(contents) != items[site]) {
          //update website's new hash
          items[site] = hash(contents);
          //do a diff between old site and new site
          chrome.extension.sendMessage({website: site}, function() {});
        }
      }
      
      var req = new XMLHttpRequest();
      req.open("GET", site, true);
      req.onload = handleContents;  
      req.send();
    }
  }
  storage.get({'watchedWebsites' : []}, checkWebsites(items));
}

window.setInterval(function(){
  updateWatchers();
}, 300);