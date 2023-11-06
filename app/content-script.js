const dataStorage = {
    domainKey: 'yewtu.be',
    onOffKey: true,
    autoPlayKey: false,
    listenKey: false
};
const idIframeInvidious = 'iframeInvidious';
const idCinemaContainer = 'full-bleed-container';
const idClassicContainer = 'player';
const domainDefaultValue = 'yewtu.be';


(async function () {
    await loadDataStorage();
    initListeners();
    executeTasks();
})();


function executeTasks() {
    removeIframeInvidious();
    if (dataStorage.onOffKey && isOnWatchPage()) {
        setInterval(function () {
            if (videoYTisPlaying()) {
                simulateClickPauseYT();
            }
            removeHotkeysYT();
        }, 50);

        let count = 100;
        const interval = setInterval(function () {
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
    // doit avoir un container classic video youtube dans le DOM
    const hasPlayerContainer = document.getElementById(idClassicContainer);
    // doit avoir un container cinema video youtube dans le DOM
    const hasCinemaContainer = document.getElementById(idCinemaContainer);
    // doit avoir une video youtube dans le DOM
    const hasVideo = document.querySelector('video');
    // ne doit pas déjà contenir une iframe invidious
    const hasIframeInvidious = document.getElementById(idIframeInvidious);
    return hasPlayerContainer && hasCinemaContainer && hasVideo && !hasIframeInvidious;
}

// Vérifie si l'utilisateur est sur une page de vidéo Youtube
function isOnWatchPage() {
    return window.location.href.includes('/watch?');
}

// Supprime l'iframe Invidious
function removeIframeInvidious() {
    const iframe = document.getElementById(idIframeInvidious);
    if (iframe) {
        iframe.remove();
    }
}

// Supprime l'iframe Invidious
function removeHotkeysYT() {
    const element = document.querySelector('yt-hotkey-manager');
    if (element) {
        element.remove();
    }
}

// Cache tous les éléments contenu dans les containers vidéo Youtube
function hideChildsPlayerContainer() {
    const arrayPlayerContainer = [];
    arrayPlayerContainer.push(document.getElementById(idClassicContainer));
    arrayPlayerContainer.push(document.getElementById(idCinemaContainer));
    arrayPlayerContainer
        .filter((e) => e.children)
        .forEach((e) => {
            Array.from(e.children)
                .filter((e) => e.id !== idIframeInvidious)
                .forEach(function (child) {
                    child.style.display = 'none';
                });
        })
}

// Remplace la vidéo Youtube par la vidéo Invidious
function replaceFrame() {
    hideChildsPlayerContainer();
    const iframe = createIframe();
    insertFrame(videoYTisOnCinemaMode(), iframe);
}

// Crée une iframe Invidious
function createIframe() {
    const url = new URL(window.location);
    const paramsUrl = new URLSearchParams(url.search);

    const video = `${paramsUrl.get('v')}`;
    const time = paramsUrl.get('t') ? `&t=${paramsUrl.get('t')}` : '';
    const autoplay = `&autoplay=${dataStorage.autoPlayKey}`;
    const listen = dataStorage.listenKey ? '&listen=true' : '';

    const iframe = document.createElement('iframe');
    iframe.id = idIframeInvidious;
    iframe.src = `https://${dataStorage.domainKey}/embed/${video}?${time}${listen}${autoplay}`;
    if (dataStorage.autoPlayKey) {
        iframe.setAttribute('allow', 'autoplay');
    }
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('webkitallowfullscreen', 'true');
    iframe.setAttribute('mozallowfullscreen', 'true');
    return iframe;
}

// Set les dimensions de l'iframe Invidious
function setFrameSize(isOnCinemaMode, iframe) {
    iframe.width = '100%';
    iframe.height = isOnCinemaMode
        ? '100%'
        : (document.querySelector('video')?.style?.height || '600px');
}

// Vérifie si une vidéo Youtube est en 'Cinema mode'
function videoYTisOnCinemaMode() {
    const cinemaContainer = document.querySelector(`#${idCinemaContainer} video`);
    return !!cinemaContainer;
}

// Simule un click sur le bouton 'Cinema mode' du lecteur Youtube
function simulateClickCinemaModeYT() {
    const button = document.querySelector('button.ytp-size-button.ytp-button');
    if (button) {
        button.click();
    }
}

// Simule un click sur le bouton 'Pause' du lecteur de vidéo Youtube
function simulateClickPauseYT() {
    const video = document.querySelector('video');
    if (video) {
        video.pause();
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
    const video = document.querySelector('video');
    if (video) {
        return !video.paused;
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

// Switch vidéo mode
function switchVideoMode() {
    hideChildsPlayerContainer();
    const iframe = document.getElementById(idIframeInvidious);
    insertFrame(!videoYTisOnCinemaMode(), iframe);
    simulateClickCinemaModeYT();
}

// Ajoute/déplace l'iframe dans le DOM
function insertFrame(isOnCinemaMode, iframe) {
    const containerPlayer = isOnCinemaMode
        ? document.getElementById(idCinemaContainer)
        : document.getElementById(idClassicContainer);
    setFrameSize(isOnCinemaMode, iframe);
    containerPlayer.appendChild(iframe);
}

// Initialise les listeners (changements de params et réception message du service-worker)
function initListeners() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
            dataStorage[key] = newValue;
        }
    });

    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (dataStorage.onOffKey) {
            if (request.content === 'urlHasChanged') {
                executeTasks();
                sendResponse({content: "response"});
                return true;
            }
            if (request.content === 'cinema-mode') {
                switchVideoMode();
                sendResponse({content: "response"});
                return true;
            }
        }
    })
}
