const optionsContainerKey = 'options-container';
const domainKey = 'domainKey';
const onOffKey = 'onOffKey';
const autoPlayKey = 'autoPlayKey';
const listenKey = 'listenKey';

const optionsContainer = document.getElementById(optionsContainerKey);
const inputTextDomain = document.getElementById(domainKey);
const checkboxOnOff = document.getElementById(onOffKey);
const checkboxAutoPlay = document.getElementById(autoPlayKey);
const checkboxListen = document.getElementById(listenKey);

// Sauvegarde nouvelles datas
inputTextDomain.addEventListener('input', function () {
    const value = inputTextDomain.value;
    chrome.storage.sync.set({ domainKey: value }, function () {
        // window.close();
    });
});

checkboxOnOff.addEventListener('click', function () {
    const value = checkboxOnOff.checked;
    chrome.storage.sync.set({ onOffKey: value }, function () {
        disableInputs(value);
        // window.close();
    });
});

checkboxAutoPlay.addEventListener('click', function () {
    const value = checkboxAutoPlay.checked;
    chrome.storage.sync.set({ autoPlayKey: value }, function () {
        // window.close();
    });
});

checkboxListen.addEventListener('click', function () {
    const value = checkboxListen.checked;
    chrome.storage.sync.set({ listenKey: value }, function () {
        // window.close();
    });
});

// Récupère datas enregistrées
chrome.storage.sync.get(domainKey, function (data) {
    if (data) {
        inputTextDomain.value = data.domainKey;
    }
});

chrome.storage.sync.get(onOffKey, function (data) {
    if (data) {
        checkboxOnOff.checked = data.onOffKey ? 'checked' : '';
        disableInputs(data.onOffKey);
    }
});

chrome.storage.sync.get(autoPlayKey, function (data) {
    if (data) {
        checkboxAutoPlay.checked = data.autoPlayKey ? 'checked' : '';
    }
});

chrome.storage.sync.get(listenKey, function (data) {
    if (data) {
        checkboxListen.checked = data.listenKey ? 'checked' : '';
    }
});

function disableInputs(bool) {
    if (bool) {
        optionsContainer.removeAttribute('disabled');
    } else {
        optionsContainer.setAttribute('disabled', 'disabled');
    }
    checkboxAutoPlay.disabled = bool ? '' : 'disabled';
    checkboxListen.disabled = bool ? '' : 'disabled';
    inputTextDomain.disabled = bool ? '' : 'disabled';
}
