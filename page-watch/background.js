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
  var hashCode = 0, i, char;
    if (s.length == 0) return hashCode;
    for (i = 0, l = s.length; i < l; i++) {
        char  = s.charCodeAt(i);
        hashCode  = ((hashCode<<5)-hashCode)+char;
        hashCode |= 0; // Convert to 32bit integer
    }
  return hashCode;             
}

function updateWatchers() {
  var checkWebsites = function(items) {
    websites = items.watchedWebsites;
    for (var site in websites) {
      console.log(site);
      var handleContents = function(contents) {
        source = contents.target.response;
        console.log(source);
        if (hash(source) != websites) {
          //update website's new hash
          websites[site] = hash(source);
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