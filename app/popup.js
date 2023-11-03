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
    chrome.storage.sync.set({ domainKey: value });
});

checkboxOnOff.addEventListener('click', function () {
    const value = checkboxOnOff.checked;
    chrome.storage.sync.set({ onOffKey: value }, function () {
        disableInputs(value);
    });
});

checkboxAutoPlay.addEventListener('click', function () {
    const value = checkboxAutoPlay.checked;
    chrome.storage.sync.set({ autoPlayKey: value });
});

checkboxListen.addEventListener('click', function () {
    const value = checkboxListen.checked;
    chrome.storage.sync.set({ listenKey: value });
});

// Récupère datas enregistrées
chrome.storage.sync.get({ domainKey : '' }, function (data) {
    inputTextDomain.value = data.domainKey;
});

chrome.storage.sync.get({ onOffKey : false }, function (data) {
    checkboxOnOff.checked = data.onOffKey ? 'checked' : '';
    disableInputs(data.onOffKey);
});

chrome.storage.sync.get({ autoPlayKey : false }, function (data) {
    checkboxAutoPlay.checked = data.autoPlayKey ? 'checked' : '';
});

chrome.storage.sync.get({ listenKey : false }, function (data) {
    checkboxListen.checked = data.listenKey ? 'checked' : '';
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
