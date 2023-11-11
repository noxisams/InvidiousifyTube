chrome.storage.sync.get({ onOffKey: true }, function (data) {
    changeIcon(data.onOffKey);
});

chrome.storage.onChanged.addListener(function (changes, area) {
    if (changes.onOffKey) {
        changeIcon(changes.onOffKey.newValue);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo.url) {
            sendMessageToContentScript(tabId, 'urlHasChanged');
        }
    }
);

chrome.commands.onCommand.addListener(function (command) {
    if (command === "cinema-mode") {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            sendMessageToContentScript(tabs[0].id, 'cinema-mode');
        });
    }
});

function sendMessageToContentScript(tabId, message) {
    chrome.tabs.sendMessage(tabId, { content: message }, function(response) {
        if (chrome.runtime.lastError) {
            console.log('chrome.runtime.lastError');
        }
    });
}

function changeIcon(active) {
    const pathIcon = active
        ? './images/icons/icon-32.png'
        : './images/icons/icon-32-off.png';
    chrome.action.setIcon({ path: { 32: pathIcon } });
}
