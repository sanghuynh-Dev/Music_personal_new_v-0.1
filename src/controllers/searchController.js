const songService = require('../services/songService');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const { escapeRegExp } = require('../middlewares/validate');

class SearchController {
    async search(req, res) {
        try {
            const query = String(req.query.q || '').slice(0, 100);
            const userId = req.session?.userID;
            if (query.trim() === '') {
                return res.json({ songs: [], artists: [], playlists: [] });
            }

            const safe = escapeRegExp(query);
            const regex = new RegExp(safe, 'i');
            const [songs, artists, playlists] = await Promise.all([
                songService.searchSongs(query, userId),
                User.find({ $or: [{ username: regex }, { email: regex }], role: { $in: ['artist', 'user'] } })
                    .select('username avatar role')
                    .limit(5)
                    .lean(),
                Playlist.find({ name: regex })
                    .populate('user', 'username')
                    .limit(5)
                    .lean()
            ]);

            const result = { songs, artists, playlists };
            if (req.xhr || (req.headers.accept || '').includes('json')) {
                return res.json(result);
            }

            res.json({ success: true, ...result, query });
        } catch (error) {
            console.error('Search controller error:', error.message);
            res.status(500).json({ error: 'Search failed.' });
        }
    }
}

module.exports = new SearchController();
