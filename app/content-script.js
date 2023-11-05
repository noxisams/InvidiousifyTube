const dataStorage = {
    domainKey: 'yewtu.be',
    onOffKey: true,
    autoPlayKey: false,
    listenKey: false
};
const iframeInvidious = 'iframeInvidious';
const domainDefaultValue = 'yewtu.be';

(async function () {
    await loadDataStorage();
    initListeners();
    executeTasks();
})();

function executeTasks() {
    let count = 100;
    removeIframeInvidious();
    if (dataStorage.onOffKey && isOnWatchPage()) {
        const interval = setInterval(function () {
            if (videoYTisPlaying()) {
                simulateClickPauseYT();
            }
            if (prerequisitesBeforeReplacement()) {
                replaceFrame();
            }
            count--;
            if (count < 0) {
                clearInterval(interval);
            }
        }, 50);
    }
}

// Vérifie certaines conditions avant de remplacer la vidéo
function prerequisitesBeforeReplacement() {
    // doit avoir un container video youtube dans le DOM
    const hasPlayerContainer = document.getElementById('player');
    // ne doit pas déjà contenir une iframe invidious
    const hasIframeInvidious = document.getElementById(iframeInvidious);
    return hasPlayerContainer && !hasIframeInvidious;
}

// Vérifie si l'utilisateur est sur une page de vidéo Youtube
function isOnWatchPage() {
    return window.location.href.includes('/watch?');
}

// Supprime l'iframe Invidious
function removeIframeInvidious() {
    const iframe = document.getElementById(iframeInvidious);
    if (iframe) {
        iframe.remove();
    }
}

// Cache tous les éléments contenu dans le container Youtube
function hideChildsPlayerContainer() {
    const playerContainer = document.getElementById('player');
    const children = playerContainer.children;
    if (children) {
        Array.from(children).forEach(function (child) {
            child.style.display = 'none';
        });
    }
}

// Remplace la vidéo Youtube par la vidéo Invidious
function replaceFrame() {
    hideChildsPlayerContainer();
    const iframe = createIframe();
    document
        .getElementById('player')
        .appendChild(iframe);
}

// Crée une balise iframe Invidious
function createIframe() {
    const url = new URL(window.location);
    const paramsUrl = new URLSearchParams(url.search);

    const video = `${paramsUrl.get('v')}`;
    const time = paramsUrl.get('t') ? `&t=${paramsUrl.get('t')}` : '';
    const autoplay = dataStorage.autoPlayKey;
    const listen = dataStorage.listenKey ? '&listen=true' : '';

    const iframe = document.createElement('iframe');
    iframe.id = iframeInvidious;
    iframe.width = '100%';
    iframe.height = `600`;
    iframe.src = `https://${dataStorage.domainKey}/embed/${video}?${time}${listen}`;
    if (autoplay) {
        iframe.setAttribute('allow', 'autoplay');
    }
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');
    return iframe;
}

// Simule un click sur le bouton du lecteur de vidéo Youtube
function simulateClickPauseYT() {
    const button = document.querySelector('button.ytp-play-button');
    if (button) {
        button.click();
    }
}

// Simule un click sur le bouton du lecteur de vidéo Youtube mobile
// function simulateClickPauseYTmobile() {
//     const button = document.querySelector('button.icon-button.player-control-play-pause-icon');
//     if (button) {
//         button.click();
//     }
// }

// Vérifie si une vidéo Youtube est en cours de lecture
function videoYTisPlaying() {
    const button = document.querySelector('button.ytp-play-button');
    if (button) {
        const attribut = button.getAttribute('data-title-no-tooltip');
        return attribut === 'Pause';
    }
    return false;
}

// Vérifie si une vidéo Youtube mobile est en cours de lecture
// function videoYTmobileIsPlaying() {
//     const unmuteButton = document.querySelector('button.ytp-unmute.ytp-popup.ytp-button.ytp-unmute-animated.ytp-unmute-shrink');
//     if (unmuteButton && unmuteButton.style.display !== 'none') {
//         unmuteButton.click();
//     }
//
//     const button = document.querySelector('button.icon-button.player-control-play-pause-icon');
//     if (button) {
//         const attribut = button.getAttribute('aria-pressed');
//         return attribut === 'true';
//     }
//     return false;
// }

// Charge les données depuis le storage de Chrome
async function loadDataStorage() {
    const datas = await chrome.storage.sync.get();
    for (let [key, value] of Object.entries(datas)) {
        if (key === 'domainKey') {
            dataStorage[key] = value === '' ? domainDefaultValue : value;
            continue;
        }
        dataStorage[key] = value;
    }
}

// Initialise les listeners (changements de params et réception message du service-worker)
function initListeners() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
            dataStorage[key] = newValue;
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.content === 'urlHasChanged') {
            executeTasks();
            sendResponse({content: "response message"});
            return true;
        }
    })
}
