// Real database functions
async function searchSongs(query) {
    try {
        const response = await fetch(`/api/songs?q=${query}`);
        return await response.json();
    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
}

async function addSong(songData) {
    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(songData)
        });
        return await response.json();
    } catch (error) {
        console.error('Add song failed:', error);
        return null;
    }
}