chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.url) {
            chrome.tabs.sendMessage(tabId, {content: "urlHasChanged"}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('chrome.runtime.lastError');
                }
            });
        }
    }
);
