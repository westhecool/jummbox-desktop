ipc.on('song', (name, data) => {
    window.location.hash = `#${data}`;
});
function reloadsongs() {
    const m = document.getElementById('songs');
    const md = document.getElementById('songs-div');
    md.innerHTML = '';
    m.innerHTML = '<button onclick="w3_close()" class="w3-bar-item w3-large">Close &times;</button>';
    ipc.send('songlist');
    ipc.once('songlist', (songs) => {
        songs.forEach(s => {
            const song = atob(s);
            const id = 'song-' + s.replace(/\=/g, 'A').replace(/\+/g, 'A').replace(/\//g, 'A');
            console.log('song:', song, 'id:', s, 'html id:', id);
            m.innerHTML += `<a style="cursor: pointer;" onclick="w3_close();document.getElementById('${id}').style.display = 'block'" class="w3-bar-item w3-button">${song}</a>`;
            md.innerHTML += `<div class="sidebar w3-sidebar w3-bar-block w3-border-right w3-animate-left"
            style="display:none;left:0;position:absolute;z-index:11;color:#fff;background-color:#000;" id="${id}">
                <button onclick="w3_close()" class="w3-bar-item w3-large">Close &times;</button>
                <a style="cursor: pointer;" onclick="load('${s}')" class="w3-bar-item w3-button">Load</a>
                <a style="cursor: pointer;" onclick="sdelete('${s}')" class="w3-bar-item w3-button">Delete</a>
            </div>`;
        });
    });
}
reloadsongs();
function share() {
    ipc.send('open', `https://jummbus.bitbucket.io/player/${window.location.hash}`);
    w3_close();
}
function save() {
    var name = document.getElementsByClassName('version-area')[0].childNodes[0].childNodes[0].value;
    if (document.getElementsByClassName('pauseButton')[0].style.display != 'none') document.getElementsByClassName('pauseButton')[0].click(); // pause the song
    setTimeout(() => {
        ipc.send('songsave', btoa(name), window.location.hash.substring(1));
        w3_close();
        alert(`saved song "${document.getElementsByClassName('version-area')[0].childNodes[0].childNodes[0].value}" successfully`);
        reloadsongs();
    }, 100); // ensure that the song has been stopped before saving (otherwise it will repeat the same note over and over again until you dismiss the save notification)
}
function load(id) {
    ipc.send('loadsong', id);
    w3_close();
}
function sdelete(id) {
    ipc.send('deletesong', id);
    reloadsongs();
}