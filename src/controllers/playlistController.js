const playlistService = require('../services/playlistService');

class PlaylistController {
    async createPlaylist(req, res) {
        try {
            const userId = req.session.userID;
            const { name } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const playlist = await playlistService.createPlaylist(name, userId);
            
            // Return JSON if AJAX, or redirect
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true, playlist });
            }
            res.redirect(`/playlists/${playlist._id}`);
        } catch (error) {
            console.error('Create playlist error:', error);
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(400).json({ error: error.message });
            }
            res.status(400).send(error.message);
        }
    }

    async showPlaylist(req, res) {
        try {
            const playlistId = req.params.id;
            const userId = req.session.userID;

            const playlist = await playlistService.getPlaylistById(playlistId, userId);
            if (!playlist) {
                return res.status(404).send('Playlist not found');
            }

            const isOwner = userId && playlist.user._id.toString() === userId.toString();

            res.render('playlists/detail', {
                title: playlist.name,
                playlist,
                isOwner,
                songs: playlist.songs
            });
        } catch (error) {
            console.error('Show playlist error:', error);
            res.status(500).send(error.message);
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

            await playlistService.deletePlaylist(playlistId, userId);
            
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true });
            }
            res.redirect('/');
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new PlaylistController();
