const optionsContainerKey = 'options-container';
const domainListKey = 'domainListKey';
const domainKey = 'domainKey';
const onOffKey = 'onOffKey';
const autoPlayKey = 'autoPlayKey';
const listenKey = 'listenKey';

const optionsContainer = document.getElementById(optionsContainerKey);
const selectDomainList = document.getElementById(domainListKey);
const inputTextDomain = document.getElementById(domainKey);
const checkboxOnOff = document.getElementById(onOffKey);
const checkboxAutoPlay = document.getElementById(autoPlayKey);
const checkboxListen = document.getElementById(listenKey);


(function () {
    // Récupère datas enregistrées
    chrome.storage.sync.get({ domainKey: '' }, function (data) {
        inputTextDomain.value = data.domainKey;
    });

    chrome.storage.sync.get({ onOffKey: true }, function (data) {
        checkboxOnOff.checked = data.onOffKey ? 'checked' : '';
        disableInputs(data.onOffKey);
    });

    chrome.storage.sync.get({ autoPlayKey: false }, function (data) {
        checkboxAutoPlay.checked = data.autoPlayKey ? 'checked' : '';
    });

    chrome.storage.sync.get({ listenKey: false }, function (data) {
        checkboxListen.checked = data.listenKey ? 'checked' : '';
    });

    chrome.storage.local.get({ domainListKey: [] }, function (data) {
        if (data.domainListKey.length === 0 || dateHasExpired(data.domainListKey[0].updatedAt)) {
            fetchInvidiousDomains().then(result => {
                chrome.storage.local.set({domainListKey: result});
                injectDataInHTMLSelect(result);
            });
        } else {
            injectDataInHTMLSelect(data.domainListKey);
        }
    });


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

    selectDomainList.addEventListener('change', function () {
        const value = selectDomainList.value;
        inputTextDomain.value = value;
        chrome.storage.sync.set({ domainKey: value });
    });
})();


// Rend toutes les options de paramètres "disable"
function disableInputs(bool) {
    if (bool) {
        optionsContainer.removeAttribute('disabled');
    } else {
        optionsContainer.setAttribute('disabled', 'disabled');
    }
    checkboxAutoPlay.disabled = bool ? '' : 'disabled';
    checkboxListen.disabled = bool ? '' : 'disabled';
    inputTextDomain.disabled = bool ? '' : 'disabled';
    selectDomainList.disabled = bool ? '' : 'disabled';
}

// Récupère tous les domaines disponible d'Invidious
function fetchInvidiousDomains() {
    return fetch('https://api.invidious.io/instances.json?sort_by=health')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error loading Invidious domains');
            }
            return response.json();
        })
        .then(result => {
            const now = Date.now();
            return result
                .map((e) => {
                    return {
                        'domain': e[0],
                        'metadata': e[1],
                        'health': +(!!e[1].monitor ? e[1].monitor.dailyRatios[0].ratio : 90),
                        'updatedAt': now
                    };
                })
                .filter((e) => e.metadata.type === 'https' && e.health > 0)
                .sort((a, b) => b.health - a.health);
        })
        .catch(error => {
            console.error('Error :', error);
        });
}

// Vérifie si la date est dépassée
function dateHasExpired(date) {
    const differenceInMilliseconds = new Date() - new Date(date);
    const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60);
    return differenceInDays > 6;
}

// Injecte les données dans l'input select
function injectDataInHTMLSelect(datas) {
    datas?.forEach(item => {
        const option = document.createElement('option');
        option.value = item.domain;
        option.textContent = `${item.metadata.flag} ${item.domain} - ${Math.round(item.health * 10) / 10}%`;
        option.selected = item.domain === inputTextDomain.value;
        selectDomainList.appendChild(option);
    });
}
