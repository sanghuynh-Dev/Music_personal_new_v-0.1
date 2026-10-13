const playlistService = require('../services/playlistService');
const { cleanText, isValidObjectId } = require('../middlewares/validate');

class PlaylistController {
    async createPlaylist(req, res) {
        try {
            const userId = req.session.userID;
            const name = cleanText(req.body.name, 100);
            const isPrivate = req.body.isPrivate === true;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const playlist = await playlistService.createPlaylist(name, userId, isPrivate);

            return res.json({ success: true, playlist });
        } catch (error) {
            console.error('Create playlist error:', error.message);
            return res.status(400).json({ error: error.message });
        }
    }

    async updatePlaylist(req, res) {
        try {
            const playlistId = req.params.id;
            const userId = req.session.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(playlistId)) {
                return res.status(400).json({ error: 'Invalid playlist id' });
            }
            const name = req.body.name !== undefined ? cleanText(req.body.name, 100) : undefined;
            const playlist = await playlistService.updatePlaylist(playlistId, userId, {
                name,
                isPrivate: req.body.isPrivate
            });
            res.json({ success: true, playlist });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async showPlaylist(req, res) {
        try {
            const playlistId = req.params.id;
            if (!isValidObjectId(playlistId)) {
                return res.status(400).json({ error: 'Invalid playlist id' });
            }
            const userId = req.session?.userID;

            const playlist = await playlistService.getPlaylistById(playlistId, userId);
            if (!playlist) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            const isOwner = userId && String(playlist.user._id) === String(userId);
            const isAdmin = res.locals.user?.role === 'admin';
            // Private playlists are invisible to non-owners (admins excepted for moderation)
            if (playlist.isPrivate && !isOwner && !isAdmin) {
                return res.status(404).json({ error: 'Playlist not found' });
            }

            res.json({
                title: playlist.name,
                playlist,
                isOwner,
                songs: playlist.songs
            });
        } catch (error) {
            console.error('Show playlist error:', error.message);
            res.status(500).json({ error: 'Unable to load playlist.' });
        }
    }

    async addSong(req, res) {
        try {
            const playlistId = req.params.id;
            const { songId } = req.body;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(playlistId) || !isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid id' });
            }

            await playlistService.addSongToPlaylist(playlistId, songId, userId);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async removeSong(req, res) {
        try {
            const playlistId = req.params.id;
            const { songId } = req.body;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(playlistId) || (songId && !isValidObjectId(songId))) {
                return res.status(400).json({ error: 'Invalid id' });
            }

            await playlistService.removeSongFromPlaylist(playlistId, songId, userId);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async deletePlaylist(req, res) {
        try {
            const playlistId = req.params.id;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(playlistId)) {
                return res.status(400).json({ error: 'Invalid playlist id' });
            }

            await playlistService.deletePlaylist(playlistId, userId);

            return res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new PlaylistController();
