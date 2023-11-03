const dataStorage = {
    domainKey: 'yewtu.be',
    onOffKey: false,
    autoPlayKey: false,
    listenKey: false
}
const iframeInvidious = 'iframeInvidious';
const domainDefaultValue = 'yewtu.be';
let videoYTurl = window.location.href;



initDatasStorage();

setInterval(function () {
    if (dataStorage.onOffKey && isOnWatchPage()) {
        if (videoYTisPlaying()) {
            simulateClickPauseYT();
        }
        if (videoYTmobileIsPlaying()) {
            simulateClickPauseYTmobile();
        }
    }
}, 50);

setInterval(function () {
    if (dataStorage.onOffKey && isOnWatchPage() && needForWork()) {
        main();
    }
}, 50);

setInterval(function () {
    if (dataStorage.onOffKey && videoYThasChange()) {
        removeIframeInvidious();
    }
}, 50);



function needForWork() {
    // doit être sur une page contenant une vidéo
    const isOnWatchPageBool = isOnWatchPage();
    // doit avoir un container video youtube dans le DOM
    const hasPlayerContainer = document.getElementById('player');
    // ne doit pas déjà contenir une iframe invidious
    const hasIframeInvidious = document.getElementById(iframeInvidious);
    return isOnWatchPageBool && hasPlayerContainer && !hasIframeInvidious;
}

function isOnWatchPage() {
    return window.location.href.includes('/watch?');
}

function videoYThasChange() {
    let videoYTurlHasChange = videoYTurl !== window.location.href;
    if (videoYTurlHasChange) {
        videoYTurl = window.location.href;
    }
    return videoYTurlHasChange;
}

function removeIframeInvidious() {
    const iframe = document.getElementById(iframeInvidious);
    if (iframe) {
        iframe.remove();
    }
}

function hideChildsPlayerContainer() {
    const playerContainer = document.getElementById('player');
    const children = playerContainer.children;
    if (children) {
        Array.from(children).forEach(function (child) {
            child.style.display = 'none';
        });
    }
}

function main() {
    // cache tous les éléments contenu dans le containerPlayer
    hideChildsPlayerContainer();

    const iframe = createIframe();

    // Ajoute l'iframe à l'élément 'player'
    document
        .getElementById('player')
        .appendChild(iframe);
}

// Crée un élément iframe
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

function simulateClickPauseYTmobile() {
    const button = document.querySelector('button.icon-button.player-control-play-pause-icon');
    if (button) {
        button.click();
    }
}

// Simule un click sur le bouton du lecteur de vidéo Invidious
function simulateClickPlayInvidious() {
    const iframe = document.getElementById(iframeInvidious);
    const button = iframe.contentWindow.document.querySelector('button.vjs-big-play-button');
    if (button) {
        button.click();
    }
}

// Vérifie si une vidéo Youtube est en cours de lecture
function videoYTisPlaying() {
    const button = document.querySelector('button.ytp-play-button');
    if (button) {
        const attribut = button.getAttribute('data-title-no-tooltip');
        return attribut === 'Pause';
    }
    return false;
}

function videoYTmobileIsPlaying() {
    const unmuteButton = document.querySelector('button.ytp-unmute.ytp-popup.ytp-button.ytp-unmute-animated.ytp-unmute-shrink');
    if (unmuteButton && unmuteButton.style.display !== 'none') {
        unmuteButton.click();
    }

    const button = document.querySelector('button.icon-button.player-control-play-pause-icon');
    if (button) {
        const attribut = button.getAttribute('aria-pressed');
        return attribut === 'true';
    }
    return false;
}

// Vérifie si une vidéo Invidious est en cours de lecture
function videoInvidiousIsPlaying() {
    const button = document.querySelector('button.vjs-big-play-button');
    if (button) {
        const attribut = button.getAttribute('title');
        return attribut === 'Pause';
    }
    return false;
}

function initDatasStorage() {
    chrome.storage.sync.get().then((datas) => {
        for (let [key, value] of Object.entries(datas)) {
            if (key === 'domainKey') {
                dataStorage[key] = value === '' ? domainDefaultValue : value;
                continue;
            }
            dataStorage[key] = value;
        }
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
            dataStorage[key] = newValue;
        }
    });
}
