//game plan:
//background.js will poll monitored websites every 5 minutes
//if any new updates occur. a message is sent to popup.js with
//the information, and an alert is sent to the user

//listening for popup requests
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getUpdates") {
      //get updates to websites
      updateInfo = createUpdateInfo();
      sendResponse({updates: updateInfo});
    } else if (request.method == "addWebsite") {
      //set websites, give update watchers some info
      addWatcher("www.google.com");
    }
});