// Simulated content for demonstration
const songs = [
  { title: "Top Song 1", url: "music/top1.mp3" },
  { title: "Top Song 2", url: "music/top2.mp3" },
  { title: "Pop Hits", url: "music/pop1.mp3" },
  { title: "Hip-Hop", url: "music/hiphop1.mp3" },
  { title: "Recently Played 1", url: "music/recent1.mp3" },
];

// 🎯 DOM elements
const searchInput = document.getElementById("searchInput");
const favoritesBtn = document.getElementById("favoritesBtn");
const logoutBtn = document.getElementById("logoutBtn");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const favoritesSection = document.getElementById("favoritesSection");
const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const audioPlayer = document.getElementById("audioPlayer");

// 🔍 Search filtering (basic simulation)
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  document.querySelectorAll(".music-card").forEach(card => {
    const isVisible = card.textContent.toLowerCase().includes(query);
    card.style.display = isVisible ? "block" : "none";
  });
});

// ❤️ Toggle Favorites section
favoritesBtn.addEventListener("click", () => {
  favoritesSection.style.display =
    favoritesSection.style.display === "none" ? "block" : "none";
});

// 🚪 Logout (simulated)
logoutBtn.addEventListener("click", () => {
  alert("You have been logged out.");
  window.location.href = "login.html"; // Update if your login page is named differently
});

// ➕ Create new playlist
createPlaylistBtn.addEventListener("click", () => {
  const playlistName = prompt("Enter a name for your new playlist:");
  if (playlistName) {
    const newCard = document.createElement("div");
    newCard.className = "music-card";
    newCard.textContent = playlistName;
    document.getElementById("userPlaylists").appendChild(newCard);
  }
});

// ▶️ Song click - update Now Playing
function setupMusicCardEvents() {
  const cards = document.querySelectorAll(".music-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const title = card.textContent;
      const song = songs.find(song => title.includes(song.title));
      if (song) {
        nowPlayingTitle.textContent = `Now Playing: ${song.title}`;
        audioPlayer.src = song.url;
        audioPlayer.play();
      } else {
        nowPlayingTitle.textContent = `Now Playing: ${title}`;
        audioPlayer.src = "";
      }
    });
  });
}

// 🛠 Initialize
document.addEventListener("DOMContentLoaded", setupMusicCardEvents);
// Store all local songs globally
localStorage.setItem("rennAllSongs", JSON.stringify(localSongs));

// Create new playlist function
function createPlaylist(name) {
  const data = getUserData();
  data.playlists = data.playlists || {};
  if (data.playlists[name]) {
    alert("Playlist already exists.");
    return;
  }
  data.playlists[name] = [];
  saveUserData(data);
  alert(`Playlist "${name}" created!`);
}

// Add song to a specific playlist
function addToPlaylist(song, playlistName) {
  const data = getUserData();
  data.playlists = data.playlists || {};
  if (!data.playlists[playlistName]) {
    data.playlists[playlistName] = [];
  }
  data.playlists[playlistName].push(song);
  saveUserData(data);
  alert(`Added to ${playlistName}`);
}

// Open artist profile page
function viewArtistProfile(artist) {
  location.href = `artist.html?name=${encodeURIComponent(artist)}`;
}
