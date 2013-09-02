//game plan:
//background.js will poll monitored websites every 5 minutes
//if any new updates occur. a message is sent to popup.js with
//the information, and an alert is sent to the user

//listening for background requests
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.url);
    alert(request.url + " has changed!");
  }
);