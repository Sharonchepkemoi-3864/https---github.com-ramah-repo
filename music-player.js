function renderSongs(songs) {
    const songsContainer = document.getElementById('songsContainer');
    songsContainer.innerHTML = '';
    songs.forEach(song => {
      const imageUrl = song.cover?.trim() !== '' ? song.cover : 'https://via.placeholder.com/300x300/0000ff/ffffff?text=No+Cover';
      const title = song.title || 'Unknown Title';
      const artist = song.artist || 'Unknown Artist';
      const audioFile = song.audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

      const card = document.createElement('div');
      card.className = 'music-card';
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${imageUrl}" alt="Album Art" class="card-image">
        </div>
        <h3 class="card-title">${title}</h3>
        <p class="card-subtitle">${artist}</p>
        <button onclick="playSong('${encodeURIComponent(audioFile)}', '${encodeURIComponent(title)}')">▶ Play</button>
      `;
      songsContainer.appendChild(card);
    });

  function playSong(audioSrc, title) {
    const audio = document.getElementById('audio');
    const nowTitle = document.getElementById('nowTitle');

    audio.src = decodeURIComponent(audioSrc);
    audio.play();
    nowTitle.textContent = "Now Playing: " + decodeURIComponent(title);
  }
}

