// Funktion zum Laden der Playlist.m3u und Aktualisieren der Sidebar
function loadMyPlaylist() {
    fetch('playlist.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der Playlist:', error));
}

// Funktion zum Laden der externen Playlist und Aktualisieren der Sidebar
function loadExternalPlaylist() {
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebarFromM3U(data))
        .catch(error => console.error('Fehler beim Laden der externen Playlist:', error));
}

// Funktion zum Laden der Sport-Playlist und Aktualisieren der Sidebar
function loadSportPlaylist() {
    alert("Funktionalität für Sport-Playlist wird implementiert...");
}






// Playlist Button
document.getElementById('playlist-button').addEventListener('click', function() {
    const playlistURL = document.getElementById('stream-url').value;
    if (playlistURL) {
        fetch(playlistURL)
            .then(response => response.text())
            .then(data => updateSidebarFromM3U(data))
            .catch(error => console.error('Fehler beim Laden der Playlist:', error));
    }
});


// Leeren Button
document.getElementById('clear-button').addEventListener('click', function() {
    document.getElementById('stream-url').value = ''; // Setzt den Wert des Eingabefelds auf leer
});




// Kopieren Button
document.getElementById('copy-button').addEventListener('click', function() {
    var streamUrlInput = document.getElementById('stream-url');
    streamUrlInput.select(); // Markiert den Text im Eingabefeld
    document.execCommand('copy'); // Kopiert den markierten Text in die Zwischenablage
});





// Globales Objekt für EPG-Daten
let epgData = {};

// Funktion zum Laden und Parsen der EPG-Daten
function loadEPGData() {
    fetch('https://ext.greektv.app/epg/epg.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "application/xml");
            const programmes = xmlDoc.getElementsByTagName('programme');
            Array.from(programmes).forEach(prog => {
                const channelId = prog.getAttribute('channel');
                const start = prog.getAttribute('start');
                const stop = prog.getAttribute('stop');
                const titleElement = prog.getElementsByTagName('title')[0];
                const descElement = prog.getElementsByTagName('desc')[0];
                if (titleElement) {
                    const title = titleElement.textContent;
                    const desc = descElement ? descElement.textContent : 'Keine Beschreibung verfügbar';
                    if (!epgData[channelId]) {
                        epgData[channelId] = [];
                    }
                    epgData[channelId].push({
                        start: parseDateTime(start),
                        stop: parseDateTime(stop),
                        title: title,
                        desc: desc
                    });
                }
            });
        })
        .catch(error => console.error('Fehler beim Laden der EPG-Daten:', error));
}

// Hilfsfunktion zum Umwandeln der EPG-Zeitangaben in Date-Objekte
function parseDateTime(epgTime) {
    if (!epgTime || epgTime.length < 19) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    const year = parseInt(epgTime.substr(0, 4), 10);
    const month = parseInt(epgTime.substr(4, 2), 10) - 1;
    const day = parseInt(epgTime.substr(6, 2), 10);
    const hour = parseInt(epgTime.substr(8, 2), 10);
    const minute = parseInt(epgTime.substr(10, 2), 10);
    const second = parseInt(epgTime.substr(12, 2), 10);
    const tzHour = parseInt(epgTime.substr(15, 3), 10);
    const tzMin = parseInt(epgTime.substr(18, 2), 10) * (epgTime[14] === '+' ? 1 : -1);

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second) || isNaN(tzHour) || isNaN(tzMin)) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    if (year < 0 || month < 0 || month > 11 || day < 1 || day > 31) {
        console.error('Ungültige EPG-Zeitangabe:', epgTime);
        return null;
    }

    const date = new Date(Date.UTC(year, month, day, hour - tzHour, minute - tzMin, second));
    return date;
}

// Funktion zum Finden des aktuellen Programms basierend auf der Uhrzeit
function getCurrentProgram(channelId) {
    const now = new Date();
    if (epgData[channelId]) {
        const currentProgram = epgData[channelId].find(prog => now >= prog.start && now < prog.stop);
        if (currentProgram) {
            const pastTime = now - currentProgram.start;
            const futureTime = currentProgram.stop - now;
            const totalTime = currentProgram.stop - currentProgram.start;
            const pastPercentage = (pastTime / totalTime) * 100;
            const futurePercentage = (futureTime / totalTime) * 100;
            const description = currentProgram.desc || 'Keine Beschreibung verfügbar';
            const start = currentProgram.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Startzeit des laufenden Programms
            const end = currentProgram.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Endzeit des laufenden Programms
            const title = currentProgram.title.replace(/\s*\[.*?\]\s*/g, '').replace(/[\[\]]/g, ''); // Titel ohne den Teil in eckigen Klammern



return {
    title: `${title} (${start} - ${end})`, // Verwende den bereinigten Titel ohne den Teil in eckigen Klammern
    description: description,
    pastPercentage: pastPercentage,
    futurePercentage: futurePercentage
};

        } else {
            return { title: 'Keine aktuelle Sendung verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
        }
    }
    return { title: 'Keine EPG-Daten verfügbar', description: 'Keine Beschreibung verfügbar', pastPercentage: 0, futurePercentage: 0 };
}



// Funktion zum Aktualisieren der nächsten Programme
function updateNextPrograms(channelId) {
    const nextProgramsContainer = document.getElementById('next-programs');
    nextProgramsContainer.innerHTML = ''; // Leert den Container, um die neuen Programme einzufügen

    if (epgData[channelId]) {
        const now = new Date();
        const upcomingPrograms = epgData[channelId]
            .filter(prog => prog.start > now) // Filtert nur Programme, die in der Zukunft liegen
            .slice(0, 4); // Begrenzt auf die nächsten 4 Programme

        upcomingPrograms.forEach(program => {
            const nextProgramDiv = document.createElement('div');
            nextProgramDiv.classList.add('next-program');

            const nextProgramTitle = document.createElement('h4');
            nextProgramTitle.classList.add('next-program-title'); // Korrigierte CSS-Klasse
            const start = program.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Startzeit des nächsten Programms
            const end = program.stop.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Endzeit des nächsten Programms
            const title = program.title.replace(/\s*\[.*?\]\s*/g, '').replace(/[\[\]]/g, ''); // Titel ohne den Teil in eckigen Klammern
            nextProgramTitle.textContent = `${title} (${start} - ${end})`;

            const nextProgramDesc = document.createElement('p');
            nextProgramDesc.classList.add('next-program-desc'); // Korrigierte CSS-Klasse
            nextProgramDesc.classList.add('expandable'); // Fügt die Klasse für das Aufklappen hinzu
            nextProgramDesc.textContent = program.desc || 'Keine Beschreibung verfügbar';

            nextProgramDiv.appendChild(nextProgramTitle);
            nextProgramDiv.appendChild(nextProgramDesc);

            nextProgramTitle.addEventListener('click', function() {
                // Toggle für das Aufklappen der Beschreibung
                nextProgramDesc.classList.toggle('expanded');
            });

            nextProgramsContainer.appendChild(nextProgramDiv);
        });
    }
}




// Im Event-Handler für den Klick auf einen Sender
const sidebarList = document.getElementById('sidebar-list');
sidebarList.addEventListener('click', function (event) {
    const channelInfo = event.target.closest('.channel-info');
    if (channelInfo) {
        const channelId = channelInfo.dataset.channelId;
        const programInfo = getCurrentProgram(channelId);

        // Aktualisiert den Player mit der aktuellen Sendung
        setCurrentChannel(channelInfo.querySelector('.sender-name').textContent, channelInfo.dataset.stream);
        playStream(channelInfo.dataset.stream);

        // Aktualisiert die Programmbeschreibung
        updatePlayerDescription(programInfo.title, programInfo.description);

        // Aktualisiert die nächsten Programme
        updateNextPrograms(channelId);

        // Zeigt das Logo des ausgewählten Senders an
        const logoContainer = document.getElementById('current-channel-logo');
        const logoImg = channelInfo.querySelector('.logo-container img').src;
        logoContainer.src = logoImg;
    }
});





// Funktion zum Aktualisieren des Players mit der Programmbeschreibung
function updatePlayerDescription(title, description) {
    document.getElementById('program-title').textContent = title;
    document.getElementById('program-desc').textContent = description;
}


// Funktion zum Extrahieren des Stream-URLs aus der M3U-Datei
function extractStreamURLs(data) {
    const lines = data.split('\n');
    const streamURLs = {};
    let currentChannelId = null;
    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            currentChannelId = idMatch && idMatch[1];
        } else if (currentChannelId && line.trim()) {
            streamURLs[currentChannelId] = streamURLs[currentChannelId] || [];
            streamURLs[currentChannelId].push(line.trim());
            currentChannelId = null;
        }
    });
    return streamURLs;
}


// Funktion zum Aktualisieren der Sidebar von einer M3U-Datei
function updateSidebarFromM3U(data) {
    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.innerHTML = '';

    const streamURLs = extractStreamURLs(data);
    const lines = data.split('\n');

    lines.forEach(line => {
        if (line.startsWith('#EXTINF')) {
            const idMatch = line.match(/tvg-id="([^"]+)"/);
            const channelId = idMatch && idMatch[1];
            const programInfo = getCurrentProgram(channelId);

            const nameMatch = line.match(/,(.*)$/);
            if (nameMatch && nameMatch.length > 1) {
                const name = nameMatch[1].trim();
                const imgMatch = line.match(/tvg-logo="([^"]+)"/);
                let imgURL = imgMatch && imgMatch[1] || 'default_logo.png';
                const streamURL = streamURLs[channelId] && streamURLs[channelId].shift(); // Nächste URL für den Channel

                if (streamURL) {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <div class="channel-info" data-stream="${streamURL}" data-channel-id="${channelId}">
                            <div class="logo-container">
                                <img src="${imgURL}" alt="${name} Logo">
                            </div>
                            <span class="sender-name">${name}</span>
                            <span class="epg-channel">
                                <span>${programInfo.title}</span>
                                <div class="epg-timeline">
                                    <div class="epg-past" style="width: ${programInfo.pastPercentage}%"></div>
                                    <div class="epg-future" style="width: ${programInfo.futurePercentage}%"></div>
                                </div>
                            </span>
                        </div>
                    `;
                    sidebarList.appendChild(listItem);
                }
            }
        }
    });

    checkStreamStatus();
}


// Funktion zum Überprüfen des Status der Streams und Markieren der gesamten Sidebar-Einträge
function checkStreamStatus() {
    const sidebarChannels = document.querySelectorAll('.channel-info');
    sidebarChannels.forEach(channel => {
        const streamURL = channel.dataset.stream;
        if (streamURL) {
            fetch(streamURL)
                .then(response => {
                    if (response.ok) {
                        channel.classList.add('online'); // Markiere den gesamten Sidebar-Eintrag
                        channel.querySelector('.sender-name').style.color = 'lightgreen'; // Ändere die Textfarbe des Sendernamens
                        channel.querySelector('.sender-name').style.fontWeight = 'bold'; // Ändere die Schriftstärke des Sendernamens
                    } else {
                        channel.classList.remove('online'); // Entferne die Markierung
                        channel.querySelector('.sender-name').style.color = ''; // Setze die Textfarbe des Sendernamens zurück
                        channel.querySelector('.sender-name').style.fontWeight = ''; // Setze die Schriftstärke des Sendernamens zurück
                    }
                })
                .catch(error => {
                    console.error('Fehler beim Überprüfen des Stream-Status:', error);
                    channel.classList.remove('online'); // Entferne die Markierung bei einem Fehler
                    channel.querySelector('.sender-name').style.color = ''; // Setze die Textfarbe des Sendernamens zurück
                    channel.querySelector('.sender-name').style.fontWeight = ''; // Setze die Schriftstärke des Sendernamens zurück
                });
        }
    });
}



// Ereignisbehandler für Klicks auf Sender
document.addEventListener('DOMContentLoaded', function () {
    loadEPGData();
    updateClock();
    setInterval(updateClock, 1000);
    document.getElementById('myPlaylist').addEventListener('click', loadMyPlaylist);
    document.getElementById('externalPlaylist').addEventListener('click', loadExternalPlaylist);
    document.getElementById('sportPlaylist').addEventListener('click', loadSportPlaylist);

    const sidebarList = document.getElementById('sidebar-list');
    sidebarList.addEventListener('click', function (event) {
        const channelInfo = event.target.closest('.channel-info');
        if (channelInfo) {
            const streamURL = channelInfo.dataset.stream;
            const channelId = channelInfo.dataset.channelId;
            const programInfo = getCurrentProgram(channelId);

            setCurrentChannel(channelInfo.querySelector('.sender-name').textContent, streamURL);
            playStream(streamURL);

            // Aktualisieren der Programmbeschreibung
            updatePlayerDescription(programInfo.title, programInfo.description);
        }
    });

    setInterval(checkStreamStatus, 60000);

    const playButton = document.getElementById('play-button');
    const streamUrlInput = document.getElementById('stream-url');

    const playStreamFromInput = () => {
        const streamUrl = streamUrlInput.value;
        if (streamUrl) {
            playStream(streamUrl);
        }
    };

    playButton.addEventListener('click', playStreamFromInput);

    streamUrlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            playStreamFromInput();
        }
    });
});



// Funktion zum Setzen des aktuellen Sendernamens und der URL
function setCurrentChannel(channelName, streamUrl) {
    const currentChannelName = document.getElementById('current-channel-name');
    const streamUrlInput = document.getElementById('stream-url');
    currentChannelName.textContent = channelName; // Nur der Sendername
    streamUrlInput.value = streamUrl;
}

// Aktualisierung der Uhrzeit
function updateClock() {
    const now = new Date();
    const tag = now.toLocaleDateString('de-DE', { weekday: 'long' });
    const datum = now.toLocaleDateString('de-DE');
    const uhrzeit = now.toLocaleTimeString('de-DE', { hour12: false });
    document.getElementById('tag').textContent = tag;
    document.getElementById('datum').textContent = datum;
    document.getElementById('uhrzeit').textContent = uhrzeit;
}



// Funktion zum Abspielen eines Streams im Video-Player
function playStream(streamURL, subtitleURL) {
    const videoPlayer = document.getElementById('video-player');
    const subtitleTrack = document.getElementById('subtitle-track');

    if (subtitleURL) {
        subtitleTrack.src = subtitleURL;
        subtitleTrack.track.mode = 'showing'; // Untertitel anzeigen
    } else {
        subtitleTrack.src = '';
        subtitleTrack.track.mode = 'hidden'; // Untertitel ausblenden
    }

    if (Hls.isSupported() && streamURL.endsWith('.m3u8')) {
        // HLS für Safari und andere Browser, die es unterstützen
        const hls = new Hls();
        hls.loadSource(streamURL);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            videoPlayer.play();
        });
    } else if (typeof dashjs !== 'undefined' && typeof dashjs.MediaPlayer !== 'undefined' && typeof dashjs.MediaPlayer().isTypeSupported === 'function' && dashjs.MediaPlayer().isTypeSupported('application/dash+xml') && streamURL.endsWith('.mpd')) {
        // MPEG-DASH für Chrome, Firefox und andere Browser, die es unterstützen
        const dashPlayer = dashjs.MediaPlayer().create();
        dashPlayer.initialize(videoPlayer, streamURL, true);
    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
        // Direktes HLS für Safari
        videoPlayer.src = streamURL;
        videoPlayer.addEventListener('loadedmetadata', function () {
            videoPlayer.play();
        });
    } else if (videoPlayer.canPlayType('video/mp4') || videoPlayer.canPlayType('video/webm')) {
        // Direktes MP4- oder WebM-Streaming für andere Browser
        videoPlayer.src = streamURL;
        videoPlayer.play();
    } else {
        console.error('Stream-Format wird vom aktuellen Browser nicht unterstützt.');
    }
}






// Funktion zum Lesen der SRT-Datei und Anzeigen der griechischen Untertitel
function handleSubtitleFile(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const srtContent = event.target.result;
        const vttContent = convertSrtToVtt(srtContent);
        const blob = new Blob([vttContent], { type: 'text/vtt' });
        const url = URL.createObjectURL(blob);
        const track = document.getElementById('subtitle-track');
        track.src = url;
        track.label = 'Griechisch';
        track.srclang = 'el';
        track.default = true;
    };
    reader.readAsText(file);
}

// Funktion zum Konvertieren von SRT in VTT
function convertSrtToVtt(srtContent) {
    // SRT-Untertitelzeilen in VTT-Format konvertieren
    const vttContent = 'WEBVTT\n\n' + srtContent
        // Ersetze Trennzeichen
        .replace(/\r\n|\r|\n/g, '\n')
        // Ersetze Zeitformate von SRT in VTT
        .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');

    return vttContent;
}



        // Event-Listener für den Play-Button und Datei-Eingabe
        document.addEventListener('DOMContentLoaded', function () {
            const playButton = document.getElementById('play-button');
            const streamUrlInput = document.getElementById('stream-url');
            const subtitleFileInput = document.getElementById('subtitle-file');

            const playStreamFromInput = () => {
                const streamUrl = streamUrlInput.value;
                const subtitleFile = subtitleFileInput.files[0];
                if (streamUrl) {
                    if (subtitleFile) {
                        handleSubtitleFile(subtitleFile);
                    }
                    playStream(streamUrl, subtitleFile ? document.getElementById('subtitle-track').src : null);
                }
            };

            playButton.addEventListener('click', playStreamFromInput);

            streamUrlInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    playStreamFromInput();
                }
            });

            subtitleFileInput.addEventListener('change', (event) => {
                const subtitleFile = event.target.files[0];
                if (subtitleFile) {
                    handleSubtitleFile(subtitleFile);
                }
            });
        });




// foothubhd-Wetter
function toggleContent(contentId) {
    const allContents = document.querySelectorAll('.content-body');
    allContents.forEach(content => {
        if (content.id === contentId) {
            content.classList.toggle('expanded');
        } else {
            content.classList.remove('expanded');
        }
    });
}















const TOKEN = '${{ secrets.PLAY_URLS }}';

async function loadText() {
  try {
    const response = await fetch(`https://api.github.com/repos/tonis1000/Tonis/contents/playlist-urls.txt`, {
      headers: {
        'Authorization': `token ${TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const urls = atob(data.content).split('\n');
      const listElement = document.getElementById('playlist-url-list');
      listElement.innerHTML = '';
      urls.forEach(url => {
        const listItem = document.createElement('li');
        listItem.textContent = url;
        listElement.appendChild(listItem);
      });
    } else if (response.status === 404) {
      console.log('Datei nicht gefunden');
    } else {
      console.error('Fehler beim Laden der Datei', response.statusText);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Datei', error.message);
  }
}

async function getSha(filename) {
  // Implementierung der Funktion
}
async function saveText(content) {
  try {
    const sha = await getSha('playlist-urls.txt');  // Stelle sicher, dass der SHA-Wert korrekt abgerufen wird
    console.log('SHA:', sha);  // Debugging-Ausgabe für den SHA-Wert

    const response = await fetch(`https://api.github.com/repos/tonis1000/Tonis/contents/playlist-urls.txt`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update playlist URLs',
        content: btoa(content),
        sha: sha
      })
    });

    console.log('API Response:', response);  // Debugging-Ausgabe für die API-Antwort

    if (response.ok) {
      alert('Text erfolgreich gespeichert!');
    } else {
      const errorData = await response.json();  // Versuche, detaillierte Fehlerinformationen zu erhalten
      console.error('Fehler beim Speichern des Textes:', errorData.message);
      alert('Fehler beim Speichern des Textes.');
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Textes:', error.message);
    alert('Fehler beim Speichern des Textes.');
  }
}


document.getElementById('insert-button').addEventListener('click', async () => {
  const streamUrl = document.getElementById('stream-url').value;
  const listElement = document.getElementById('playlist-url-list');
  const urls = Array.from(listElement.children).map(item => item.textContent);

  if (!urls.includes(streamUrl)) {
    const updatedContent = urls.concat(streamUrl).join('\n');
    await saveText(updatedContent);

    const listItem = document.createElement('li');
    listItem.textContent = streamUrl;
    listElement.appendChild(listItem);
  } else {
    alert('URL ist bereits in der Playlist.');
  }
});

document.getElementById('delete-button').addEventListener('click', async () => {
  const streamUrl = document.getElementById('stream-url').value;
  const listElement = document.getElementById('playlist-url-list');
  let urls = Array.from(listElement.children).map(item => item.textContent);

  if (urls.includes(streamUrl)) {
    urls = urls.filter(url => url !== streamUrl);
    const updatedContent = urls.join('\n');
    await saveText(updatedContent);

    Array.from(listElement.children).forEach(item => {
      if (item.textContent === streamUrl) {
        listElement.removeChild(item);
      }
    });
  } else {
    alert('URL ist nicht in der Playlist.');
  }
});

function toggleContent(id) {
  const element = document.getElementById(id);
  element.classList.toggle('expandable');
}

window.onload = loadText;
