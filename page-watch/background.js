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
    websites = items.watchedWebsites;
    if (url in websites) return;
    console.log(url);
    console.log(websites);
    websites[url] = '';
    storage.set({'watchedWebsites' : websites}, function() {
      alert('Settings saved');
    });
  }
  storage.get('watchedWebsites', setWebsite);
}


function hash(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}

function updateWatchers() {
  var checkWebsites = function(items) {
    websites = items.watchedWebsites;
    for (var site in websites) {
      console.log(site);
      var handleContents = function(contents) {
        if (hash(contents) != websites) {
          //update website's new hash
          websites[site] = hash(contents);
          //do a diff between old site and new site
          chrome.extension.sendMessage({url: site}, function() {});
          storage.set({'watchedWebsites' : websites});
        }
      }
      
      var req = new XMLHttpRequest();
      req.open("GET", site, true);
      req.onload = handleContents;  
      req.send();
    }
  }
  storage.get('watchedWebsites', checkWebsites);
}

/*
window.setInterval(function(){
  updateWatchers();
}, 30000);
*/