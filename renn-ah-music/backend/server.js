const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/songs', express.static(path.join(__dirname, 'public/songs')));

const songs = [
  {
    title: 'Ocean Eyes',
    artist: 'Billie Eilish',
    file: 'ocean-eyes.mp3',
    cover: 'https://i.imgur.com/k5fV0yn.jpg'
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    file: 'blinding-lights.mp3',
    cover: 'https://i.imgur.com/J0vT6xF.jpg'
  },
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    file: 'shape-of-you.mp3',
    cover: 'https://i.imgur.com/C1aOQzB.jpg'
  }
];

app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = songs.filter(song =>
    song.title.toLowerCase().includes(query) ||
    song.artist.toLowerCase().includes(query)
  );
  res.json(results);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
