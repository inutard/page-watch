var storage = chrome.storage.local;
var refreshTime = 300; // refresh time in seconds
function doInCurrentTab(tabCallback) {
  chrome.tabs.query(
    { currentWindow: true, active: true },
    function (tabArray) { tabCallback(tabArray[0]); }
  );
}

//add a watcher to a website
function toggleWatcher(url) {
  var addWebsite = function(websites, url) {
    websites[url] = 0;
    storage.set({'watchedWebsites' : websites}, function() {
      //alert('Page at ' + url + ' added!');
      doInCurrentTab(function(tab) { changeBadge({tabId: tab.id}) });
      updateWatchers();
    });
  }
  
  var removeWebsite = function(websites, url) {
    delete websites[url];
    storage.set({'watchedWebsites' : websites}, function() {
      //alert('Page at ' + url + ' removed!');
      doInCurrentTab(function(tab) { changeBadge({tabId: tab.id}) });
    });
  }
  
  var toggleWebsite = function(items) {
    websites = items.watchedWebsites;
    if (url in websites) {
      removeWebsite(websites, url);
    } else {
      addWebsite(websites, url);
    }
  }
  storage.get('watchedWebsites', toggleWebsite);
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

function createContentHandler(url, websites) {
  var retval = function(contents) {
                source = contents.target.response;
                if (hash(source) != websites[url]) {
                  //update website's new hash
                  var oldHash = websites[url];
                  websites[url] = hash(source);
                  if (oldHash != 0) {
                    //do a diff between old site and new site
                    //chrome.extension.sendMessage({url: site}, function() {});
                    var options = {
                      type: "basic",
                      title: "",
                      message: url + " has changed!",
                      iconUrl: "noun-project-glasses.png",
                    }
                    chrome.notifications.create(url, options, function() {});
                  }
                  storage.set({'watchedWebsites' : websites}, function(items) {});
                }
              };
  return retval;
}

function updateWatchers() {
  var checkWebsites = function(items) {
    websites = items.watchedWebsites;
    for (var url in websites) {
      //have to wrap it in another function since we need to bind
      //the url variable to another scope.
      var handleContents = createContentHandler(url, websites);
      var req = new XMLHttpRequest();
      //append random ending to stop pesky caching
      req.open("GET", url+"?rand="+Math.random(), true);
      req.onload = handleContents;
      req.send();
    }
  }
  storage.get('watchedWebsites', checkWebsites);
}

window.setInterval(function() {
  updateWatchers();
}, refreshTime*1000);

//open new tab of page when notification is clicked
//decided not to clear notification after click
//since for my specific use case, i may want to leave
//the notification there to remind myself to do homework
//later.
function notificationClicked(url) {
  chrome.tabs.create(
    {url : url},
    function(tab) { chrome.tabs.reload(tab.id, {bypassCache: true}); }
  );
}
chrome.notifications.onClicked.addListener(notificationClicked);

//add page to watch list when clicked
function watchPage(tab) {
  toggleWatcher(tab.url);
}
chrome.browserAction.onClicked.addListener(watchPage);

//add red box to icon if tab changes or url changes
function changeBadge(changeInfo) {
  var toggleBadge = function(items) {
    websites = items.watchedWebsites;
    chrome.tabs.get(changeInfo.tabId, function(tab) {
      if (tab.url in websites) {
        chrome.browserAction.setBadgeText({text: " "});
      } else {
        chrome.browserAction.setBadgeText({text: ""});
      }
    });
  }
  storage.get('watchedWebsites', toggleBadge);
}

chrome.tabs.onUpdated.addListener(changeBadge);
chrome.tabs.onActivated.addListener(changeBadge);