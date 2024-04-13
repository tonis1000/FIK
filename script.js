// scripts.js

function loadMyPlaylist() {
    // Hier wird die My Playlist geladen
    fetch('/my_playlist')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadExternalPlaylist() {
    // Hier wird die External Playlist geladen
    fetch('https://raw.githubusercontent.com/gluk03/iptvgluk/dd9409c9f9029f6444633267e3031741efedc381/TV.m3u')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function loadSportPlaylist() {
    // Hier wird die Sport Playlist geladen
    fetch('/sport_playlist')
        .then(response => response.text())
        .then(data => updateSidebar(data));
}

function updateSidebar(data) {
    const sidebar = document.getElementById('sidebar');
    // Hier kannst du den erhaltenen Daten verwenden, um die Sidebar zu aktualisieren
    sidebar.innerHTML = data; // Beispiel: Einfügen der erhaltenen Daten in die Sidebar
}
