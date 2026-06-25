const songService = require('../services/songService');

class SearchController {
    async search(req, res) {
        try {
            const query = req.query.q || '';
            const userId = req.session.userID;
            console.log(query);
            if (query.trim() === '') {
                if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                    return res.json({ songs: [] });
                }
                return res.json({ title: 'Search', songs: [], query });
            }

            const songs = await songService.searchSongs(query, userId);

            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ songs });
            }

            res.json({
                success: true,
                title: `Search Results for "${query}"`,
                songs,
                query
            });
        } catch (error) {
            console.error('Search controller error:', error);
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ error: error.message });
            }
            res.status(500).send(error.message);
        }
    }
}

module.exports = new SearchController();
