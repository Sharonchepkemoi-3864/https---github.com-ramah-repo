const express = require('express');
const router = express.Router();
const {
    getAllSongs,
    getByGenre,
    getByArtist,
    addSong
} = require('../controllers/songController');

router.get('/', getAllSongs);
router.get('/genre/:genre', getByGenre);
router.get('/artist/:artist', getByArtist);
router.post('/', addSong); // Only use in dev/admin mode

module.exports = router;
