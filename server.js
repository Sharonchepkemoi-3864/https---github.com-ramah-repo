require('dotenv').config();
const express = require('express');
const fs = require('fs');

const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const slugify = require('slugify');
const path = require('path');
const app = express();
const PORT = 3000;
// Removed duplicate declaration of PORT
app.use(cors());
app.use(express.json());

// ------------------ MySQL DB Connection ------------------

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
  }
});

// ------------------ Auth Routes ------------------

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  const password_hash = bcrypt.hashSync(password, 10);
  const sql = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
  db.query(sql, [username, email, password_hash], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Registration failed' });
    res.json({ success: true, message: 'User registered!' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password are required' });

  const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    if (results.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const user = results[0];
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    res.json({ success: true, message: 'Login successful' });
  });
});

// ------------------ Spotify Token Logic ------------------

let spotifyToken = null;
let tokenExpiresAt = null;

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
  if (spotifyToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return spotifyToken;
  }

  const tokenURL = 'https://accounts.spotify.com/api/token';
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await axios.post(tokenURL, 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    spotifyToken = res.data.access_token;
    tokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 10000;
    return spotifyToken;
  } catch (err) {
    console.error('❌ Failed to get Spotify token:', err.response?.data || err.message);
    return null;
  }
}

// ------------------ Last.fm Genre Logic ------------------

const lastFmApiKey = '0b4553bc1ee30314c309dcaba8a4d9d2';

async function fetchAndInsertGenres() {
  const url = `http://ws.audioscrobbler.com/2.0/?method=tag.getTopTags&api_key=${lastFmApiKey}&format=json`;

  try {
    const response = await axios.get(url);
    const tags = response.data?.toptags?.tag?.slice(0, 30) || [];

    for (const tag of tags) {
      const name = tag.name;
      const description = `Top tracks and artists tagged with ${name}`;
      const image_url = 'https://via.placeholder.com/150';
      const slug = slugify(name, { lower: true });

      const insertQuery = `
        INSERT INTO genres (name, description, image_url, slug)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = name
      `;

      db.query(insertQuery, [name, description, image_url, slug], (err) => {
        if (err) {
          console.error(`❌ Insert error for genre "${name}":`, err.message);
        } else {
          console.log(`✅ Inserted genre: ${name}`);
        }
      });
    }
  } catch (error) {
    console.error('❌ Failed to fetch genres from Last.fm:', error.message);
  }
}

app.get('/api/genres/update', async (req, res) => {
  try {
    await fetchAndInsertGenres();
    res.json({ success: true, message: 'Genres updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update genres' });
  }
});

app.get('/api/genres', (req, res) => {
  db.query('SELECT * FROM genres ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch genres' });
    res.json({ success: true, genres: results });
  });
});

// ------------------ Artist Image ------------------

async function getArtistImage(artistName) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${lastFmApiKey}&format=json`;

  try {
    const res = await axios.get(url);
    return res.data.artist?.image?.[3]?.['#text'] || 'images/default-artist.jpg';
  } catch {
    return 'images/default-artist.jpg';
  }
}

// ------------------ Spotify Tracks ------------------

app.get('/featured-tracks', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    if (!token) return res.status(500).json({ success: false, message: 'Spotify token error' });

    const playlistsRes = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const playlistId = playlistsRes.data.playlists.items[0].id;

    const tracksRes = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const formatted = tracksRes.data.items.map(item => ({
      song_title: item.track.name,
      artist_name: item.track.artists[0]?.name || 'Unknown Artist',
      preview_url: item.track.preview_url,
      album_image: item.track.album.images[0]?.url || ''
    }));

    res.json({ success: true, tracks: formatted });
  } catch (err) {
    console.error('❌ Error fetching featured tracks:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch tracks' });
  }
});

app.get('/all-songs', async (req, res) => {
  try {
    const token = await getSpotifyToken();
    if (!token) return res.status(500).json({ success: false, message: 'Spotify token error' });

    const playlistsRes = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const playlistId = playlistsRes.data.playlists.items[0].id;

    const tracksRes = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const formatted = tracksRes.data.items.map(item => ({
      song_title: item.track?.name || 'Unknown Title',
      artist_name: item.track?.artists?.[0]?.name || 'Unknown Artist',
      preview_url: item.track?.preview_url,
      album_image: item.track?.album?.images?.[0]?.url || ''
    }));

    res.json({ success: true, tracks: formatted });
  } catch (err) {
    console.error('❌ Error fetching all songs:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch songs' });
  }
});

// ------------------ Artists API ------------------

app.get('/api/artists', async (req, res) => {
  const { search = '', page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchQuery = `%${search}%`;

  const query = `SELECT artist_id, name, bio FROM artists WHERE name LIKE ? LIMIT ? OFFSET ?`;

  db.query(query, [searchQuery, parseInt(limit), offset], async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to fetch artists' });

    const withImages = await Promise.all(
      results.map(async artist => ({
        ...artist,
        image_url: await getArtistImage(artist.name)
      }))
    );

    res.json({ success: true, artists: withImages, hasMore: results.length === parseInt(limit) });
  });
});

// ------------------ DB Test ------------------

app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'DB not working' });
    res.json({ success: true, message: '✅ DB is working!', result: results[0].result });
  });
});

// ------------------ Fallback 404 & Error Middleware ------------------

// Enable CORS
// Load album data from a JSON file
const albums = JSON.parse(fs.readFileSync(path.join(__dirname, 'albums.json'), 'utf8'));

// Enable CORS
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// API route: paginated album data
app.get('/api/albums', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 40;
  const offset = (page - 1) * limit;

  const paginatedAlbums = albums.slice(offset, offset + limit);
  const hasMore = offset + limit < albums.length;

  res.json({ albums: paginatedAlbums, hasMore });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// Start the server
app.listen(PORT, () => {
  
});


// ------------------ Start Server ------------------

 app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
