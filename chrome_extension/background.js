function onClickHandler(info, tab){
  var postUrl = 'http://localhost:8080/chrome/new_card/card?text='+encodeURIComponent('"'+info.selectionText+'"')+'&url='+info.pageUrl;
  chrome.windows.create({"url":postUrl, "type":"popup", "height":300,"width":600, "top": 100, "left":100});
}

chrome.contextMenus.onClicked.addListener(onClickHandler);

var contexts = ["page","selection","link","image"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Make flash card from " + context;
  var id = chrome.contextMenus.create({"title": title, "contexts":[context], "id": context});
}

chrome.browserAction.onClicked.addListener(function(tab) {
  var postUrl = "http://localhost:8080/chrome/";
  chrome.windows.create({"url":postUrl, "type":"popup", "height":300,"width":600, "top": 100, "left":100});
});