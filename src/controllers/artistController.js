const mongoose = require('mongoose');
const Song = require('../models/Song');
const Follow = require('../models/Follow');
const { escapeRegExp } = require('../middlewares/validate');

const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));

class ArtistController {
    async showDashboard(req, res) {
        try {
            const userId = req.session.userID;

            const [counts] = await Song.aggregate([
                { $match: { uploadedBy: toObjectId(userId) } },
                { $group: { _id: null, totalSongs: { $sum: 1 }, totalPlays: { $sum: { $ifNull: ['$playCount', 0] } }, totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } } } }
            ]).catch(() => []);

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

            res.json({
                title: 'Artist Dashboard',
                stats: {
                    totalSongs: counts?.totalSongs || 0,
                    totalPlays: counts?.totalPlays || 0,
                    totalLikes: counts?.totalLikes || 0,
                    totalFollowers
                },
                topSongs,
                recentSongs
            });
        } catch (error) {
            console.error('Artist dashboard error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load dashboard.' });
        }
    }

    async mySongs(req, res) {
        try {
            const userId = req.session.userID;
            const q = String(req.query.q || '').slice(0, 100);
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
            const sortKey = String(req.query.sort || 'newest');

            const filter = { uploadedBy: userId };
            if (q.trim()) {
                filter.title = new RegExp(escapeRegExp(q.trim()), 'i');
            }
            const sort = sortKey === 'plays' ? { playCount: -1 }
                : sortKey === 'oldest' ? { createdAt: 1 }
                : { createdAt: -1 };

            const [total, songs] = await Promise.all([
                Song.countDocuments(filter),
                Song.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean()
            ]);
            const withLikes = songs.map((s) => ({ ...s, likeCount: (s.likes || []).length }));

            res.json({ success: true, songs: withLikes, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
        } catch (error) {
            console.error('Artist songs error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load songs.' });
        }
    }

    async myFollowers(req, res) {
        try {
            const userId = req.session.userID;
            const page = Math.max(1, parseInt(req.query.page, 10) || 1);
            const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
            const [total, follows] = await Promise.all([
                Follow.countDocuments({ artist: userId }),
                Follow.find({ artist: userId })
                    .populate('follower', 'username avatar')
                    .sort({ createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean()
            ]);
            res.json({
                success: true,
                followers: follows.map((f) => f.follower).filter(Boolean),
                total, page, totalPages: Math.max(1, Math.ceil(total / limit))
            });
        } catch (error) {
            console.error('Artist followers error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load followers.' });
        }
    }

    async getStatistics(req, res) {
        try {
            const userId = req.session.userID;

            const [counts] = await Song.aggregate([
                { $match: { uploadedBy: toObjectId(userId) } },
                { $group: { _id: null, totalSongs: { $sum: 1 }, totalPlays: { $sum: { $ifNull: ['$playCount', 0] } } } }
            ]).catch(() => []);
            const songs = await Song.find({ uploadedBy: userId }).select('title playCount likes createdAt').lean();
            const totalFollowers = await Follow.countDocuments({ artist: userId });

            // Format play count distribution for client analytics
            const songChartData = songs.map(s => ({
                _id: s._id,
                title: s.title,
                playCount: s.playCount || 0,
                likeCount: s.likes?.length || 0,
                createdAt: s.createdAt
            }));

            res.json({
                success: true,
                stats: {
                    totalSongs: counts?.totalSongs || 0,
                    totalPlays: counts?.totalPlays || 0,
                    totalFollowers
                },
                songs: songChartData
            });
        } catch (error) {
            console.error('Artist statistics error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load statistics.' });
        }
    }
}

module.exports = new ArtistController();
