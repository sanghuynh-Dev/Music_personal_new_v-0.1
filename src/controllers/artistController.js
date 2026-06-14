const Song = require('../models/Song');
const Follow = require('../models/Follow');

class ArtistController {
    async showDashboard(req, res) {
        try {
            const userId = req.session.userID;

            // 1. Total songs uploaded
            const totalSongs = await Song.countDocuments({ uploadedBy: userId });

            // 2. Aggregate total plays
            const songs = await Song.find({ uploadedBy: userId }).lean();
            const totalPlays = songs.reduce((sum, song) => sum + (song.playCount || 0), 0);

            // 3. Total followers
            const totalFollowers = await Follow.countDocuments({ artist: userId });

            // 4. Top songs by playCount
            const topSongs = await Song.find({ uploadedBy: userId })
                .sort({ playCount: -1 })
                .limit(5)
                .lean();

            // 5. Recently uploaded songs
            const recentSongs = await Song.find({ uploadedBy: userId })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            res.render('artists/dashboard', {
                title: 'Artist Dashboard',
                stats: {
                    totalSongs,
                    totalPlays,
                    totalFollowers
                },
                topSongs,
                recentSongs
            });
        } catch (error) {
            console.error('Artist dashboard error:', error);
            res.status(500).send(error.message);
        }
    }

    async getStatistics(req, res) {
        try {
            const userId = req.session.userID;

            const totalSongs = await Song.countDocuments({ uploadedBy: userId });
            const songs = await Song.find({ uploadedBy: userId }).select('title playCount likes').lean();
            const totalPlays = songs.reduce((sum, song) => sum + (song.playCount || 0), 0);
            const totalFollowers = await Follow.countDocuments({ artist: userId });

            // Format play count distribution for client analytics
            const songChartData = songs.map(s => ({
                title: s.title,
                playCount: s.playCount || 0,
                likeCount: s.likes?.length || 0
            }));

            res.json({
                success: true,
                stats: {
                    totalSongs,
                    totalPlays,
                    totalFollowers
                },
                songs: songChartData
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new ArtistController();
