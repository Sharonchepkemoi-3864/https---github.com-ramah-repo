// Function to display songs
function renderSongs() {
    const container = document.getElementById('songContainer');
    container.innerHTML = ''; // Clear previous content

    musicDatabase.songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-card';
        songElement.innerHTML = `
            <h3>${song.title}</h3>
            <p>Artist: ${song.artist}</p>
            <p>Album: ${song.album}</p>
            <button onclick="playSong(${song.id})">Play</button>
        `;
        container.appendChild(songElement);
    });
}

// Initial render
window.onload = renderSongs;