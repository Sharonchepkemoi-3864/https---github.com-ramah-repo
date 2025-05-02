// Rename a playlist
router.put('/rename', auth, async (req, res) => {
    const { oldName, newName } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const playlist = user.playlists.find(p => p.name === oldName);
        if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });

        playlist.name = newName;
        await user.save();
        res.json({ msg: 'Playlist renamed', playlist });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Share public playlist by ID
router.get('/public/:userId/:playlistName', async (req, res) => {
    try {
        const { userId, playlistName } = req.params;
        const user = await User.findById(userId).populate('playlists.songs');
        const playlist = user.playlists.find(p => p.name === playlistName);
        if (!playlist) return res.status(404).json({ msg: 'Playlist not found' });
        res.json(playlist);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});
