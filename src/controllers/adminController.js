const User = require('../models/User');
const Song = require('../models/Song');
const Follow = require('../models/Follow');
const Playlist = require('../models/Playlist');
const Comment = require('../models/Comment');
const ListeningHistory = require('../models/ListeningHistory');
const Report = require('../models/Report');
const { deleteUserCascade } = require('../services/accountService');
const { notify } = require('../services/notifyService');
const { cloudinary } = require('../config/cloudinary');
const { sanitizeUser, isValidObjectId } = require('../middlewares/validate');

const escapeRx = (s) => new RegExp(String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const getPaging = (req, def = 20, max = 100) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(max, Math.max(1, parseInt(req.query.limit, 10) || def));
    return { page, limit, skip: (page - 1) * limit };
};

class AdminController {
    async showDashboard(req, res) {
        try {
            const [
                totalUsers,
                totalArtists,
                totalSongs,
                totalPlaylists,
                totalComments,
                pendingReports,
                bannedUsers,
                playAgg,
            ] = await Promise.all([
                User.countDocuments({ role: 'user' }),
                User.countDocuments({ role: 'artist' }),
                Song.countDocuments(),
                Playlist.countDocuments(),
                Comment.countDocuments(),
                Report.countDocuments({ status: 'pending' }),
                User.countDocuments({ status: 'banned' }),
                Song.aggregate([{ $group: { _id: null, total: { $sum: { $ifNull: ['$playCount', 0] } } } }]),
            ]);
            const totalPlays = playAgg[0]?.total || 0;

            // Fetch recently registered users
            const recentUsers = await User.find()
                .select('-password')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            // Fetch recently uploaded songs
            const recentSongs = await Song.find()
                .populate('uploadedBy', 'username')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            res.json({
                title: 'Admin Dashboard',
                stats: {
                    totalUsers,
                    totalArtists,
                    totalSongs,
                    totalPlaylists,
                    totalPlays,
                    totalComments,
                    pendingReports,
                    bannedUsers
                },
                recentUsers,
                recentSongs
            });
        } catch (error) {
            console.error('Admin dashboard error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load dashboard.' });
        }
    }

    async showUsers(req, res) {
        try {
            const q = String(req.query.q || '').trim().slice(0, 100);
            const { page, limit, skip } = getPaging(req);
            const filter = { role: { $ne: 'admin' } };
            const role = String(req.query.role || '');
            const status = String(req.query.status || '');
            if (['user', 'artist'].includes(role)) filter.role = role;
            if (['active', 'banned'].includes(status)) filter.status = status;
            if (q) filter.$or = [{ username: escapeRx(q) }, { email: escapeRx(q) }];

            const [total, users] = await Promise.all([
                User.countDocuments(filter),
                User.find(filter)
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);

            res.json({
                title: 'User Management',
                users,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            });
        } catch (error) {
            console.error('Admin users view error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load users.' });
        }
    }

    async showArtists(req, res) {
        try {
            const q = String(req.query.q || '').trim().slice(0, 100);
            const { page, limit, skip } = getPaging(req);
            const filter = { role: 'artist' };
            if (q) filter.$or = [{ username: escapeRx(q) }, { email: escapeRx(q) }];

            const [total, artists] = await Promise.all([
                User.countDocuments(filter),
                User.find(filter)
                    .select('-password')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            const ids = artists.map((a) => a._id);

            // 2 aggregates instead of N+1 queries per artist
            const [followAgg, songAgg] = await Promise.all([
                Follow.aggregate([
                    { $match: { artist: { $in: ids } } },
                    { $group: { _id: '$artist', count: { $sum: 1 } } },
                ]),
                Song.aggregate([
                    { $match: { uploadedBy: { $in: ids } } },
                    { $group: { _id: '$uploadedBy', songCount: { $sum: 1 }, totalPlays: { $sum: { $ifNull: ['$playCount', 0] } } } },
                ]),
            ]);
            const followersById = Object.fromEntries(followAgg.map((f) => [String(f._id), f.count]));
            const songsById = Object.fromEntries(songAgg.map((s) => [String(s._id), s]));

            const artistsWithStats = artists.map((artist) => {
                const key = String(artist._id);
                return {
                    ...artist,
                    followerCount: followersById[key] || 0,
                    songCount: songsById[key]?.songCount || 0,
                    totalPlays: songsById[key]?.totalPlays || 0,
                };
            });

            res.json({
                title: 'Artist Management',
                artists: artistsWithStats,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            });
        } catch (error) {
            console.error('Admin artists view error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load artists.' });
        }
    }

    async showSongs(req, res) {
        try {
            const q = String(req.query.q || '').trim().slice(0, 100);
            const { page, limit, skip } = getPaging(req);
            const filter = q
                ? { $or: [{ title: escapeRx(q) }, { artist: escapeRx(q) }] }
                : {};
            const [total, songs] = await Promise.all([
                Song.countDocuments(filter),
                Song.find(filter)
                    .populate('uploadedBy', 'username')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);

            res.json({
                title: 'Song Management',
                songs,
                total,
                page,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            });
        } catch (error) {
            console.error('Admin songs view error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load songs.' });
        }
    }

    async promoteUser(req, res) {
        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            if (user.role === 'admin') {
                return res.status(403).json({ success: false, error: 'Cannot change admin accounts' });
            }
            if (String(user._id) === String(req.session.userID)) {
                return res.status(403).json({ success: false, error: 'Cannot change your own role' });
            }

            user.role = 'artist';
            await user.save();

            return res.json({ success: true, user: sanitizeUser(user) });
        } catch (error) {
            console.error('Promote user error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to promote user.' });
        }
    }

    async toggleBanUser(req, res) {
        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (user.role === 'admin') {
                return res.status(403).json({ success: false, error: 'Cannot ban admin accounts' });
            }
            if (String(user._id) === String(req.session.userID)) {
                return res.status(403).json({ success: false, error: 'Cannot ban yourself' });
            }

            user.status = user.status === 'banned' ? 'active' : 'banned';
            await user.save();

            if (user.status === 'banned') {
                await notify({ recipient: user._id, type: 'ban', text: 'Your account has been banned by an administrator.' });
            }

            return res.json({ success: true, user: sanitizeUser(user) });
        } catch (error) {
            console.error('Toggle ban error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to update user status.' });
        }
    }

    async deleteSong(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ success: false, error: 'Invalid song id' });
            }
            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).json({ success: false, error: 'Song not found' });
            }

            // Destroy files on Cloudinary
            if (song.imageUrl?.public_id) {
                try { await cloudinary.uploader.destroy(song.imageUrl.public_id); } catch (e) { console.error('Cloudinary image cleanup failed:', e.message); }
            }
            if (song.audioUrl?.public_id) {
                try { await cloudinary.uploader.destroy(song.audioUrl.public_id, { resource_type: 'video' }); } catch (e) { console.error('Cloudinary audio cleanup failed:', e.message); }
            }

            await Song.deleteOne({ _id: songId });

            // Drop dangling refs so favorites never crash on populate.
            try {
                const User = require('../models/User');
                await User.updateMany(
                    { favoriteSongs: songId },
                    { $pull: { favoriteSongs: songId } }
                );
            } catch (e) { console.error('Favorite refs cleanup failed:', e.message); }

            return res.json({ success: true });
        } catch (error) {
            console.error('Admin delete song error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to delete song.' });
        }
    }

    async showPlaylists(req, res) {
        try {
            const q = String(req.query.q || '').slice(0, 100);
            const { page, limit, skip } = getPaging(req);
            const filter = q ? { name: escapeRx(q) } : {};
            const [total, playlists] = await Promise.all([
                Playlist.countDocuments(filter),
                Playlist.find(filter)
                    .populate('user', 'username email')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            const data = playlists.map((p) => ({
                ...p,
                songCount: (p.songs || []).length,
                songs: undefined
            }));
            res.json({ success: true, playlists: data, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
        } catch (error) {
            console.error('Admin playlists error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load playlists.' });
        }
    }

    async deletePlaylistAsAdmin(req, res) {
        try {
            const playlistId = req.params.id;
            if (!isValidObjectId(playlistId)) {
                return res.status(400).json({ success: false, error: 'Invalid playlist id' });
            }
            const result = await Playlist.deleteOne({ _id: playlistId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, error: 'Playlist not found' });
            }
            return res.json({ success: true });
        } catch (error) {
            console.error('Admin delete playlist error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to delete playlist.' });
        }
    }

    async showComments(req, res) {
        try {
            const q = String(req.query.q || '').slice(0, 100);
            const { page, limit, skip } = getPaging(req);
            const filter = q ? { content: escapeRx(q) } : {};
            const [total, comments] = await Promise.all([
                Comment.countDocuments(filter),
                Comment.find(filter)
                    .populate('user', 'username email')
                    .populate('song', 'title artist')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            res.json({ success: true, comments, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
        } catch (error) {
            console.error('Admin comments error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to load comments.' });
        }
    }

    async deleteComment(req, res) {
        try {
            const commentId = req.params.id;
            if (!isValidObjectId(commentId)) {
                return res.status(400).json({ success: false, error: 'Invalid comment id' });
            }
            const result = await Comment.deleteOne({ _id: commentId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ success: false, error: 'Comment not found' });
            }
            return res.json({ success: true });
        } catch (error) {
            console.error('Admin delete comment error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to delete comment.' });
        }
    }

    async showUserDetail(req, res) {
        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId).select('-password').lean();
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            const [songCount, playlistCount, followerCount, followingCount] = await Promise.all([
                Song.countDocuments({ uploadedBy: userId }),
                Playlist.countDocuments({ user: userId }),
                Follow.countDocuments({ artist: userId }),
                Follow.countDocuments({ follower: userId })
            ]);
            res.json({ success: true, user: sanitizeUser(user), stats: { songCount, playlistCount, followerCount, followingCount } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to load user.' });
        }
    }

    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId).select('_id role');
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            if (user.role === 'admin') {
                return res.status(403).json({ success: false, error: 'Cannot delete admin accounts' });
            }
            if (String(user._id) === String(req.session.userID)) {
                return res.status(403).json({ success: false, error: 'Cannot delete yourself' });
            }
            await deleteUserCascade(userId);
            return res.json({ success: true });
        } catch (error) {
            console.error('Admin delete user error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to delete user.' });
        }
    }

    async demoteArtist(req, res) {
        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            if (user.role !== 'artist') {
                return res.status(400).json({ success: false, error: 'Only artist accounts can be demoted' });
            }
            if (String(user._id) === String(req.session.userID)) {
                return res.status(403).json({ success: false, error: 'Cannot change your own role' });
            }

            user.role = 'user';
            user.artistVerified = false;
            await user.save();

            return res.json({ success: true, user: sanitizeUser(user) });
        } catch (error) {
            console.error('Demote artist error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to demote artist.' });
        }
    }

    async toggleVerifyArtist(req, res) {        try {
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                return res.status(400).json({ success: false, error: 'Invalid user id' });
            }
            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            if (user.role !== 'artist') {
                return res.status(400).json({ success: false, error: 'Only artist accounts can be verified' });
            }
            user.artistVerified = !user.artistVerified;
            await user.save();
            return res.json({ success: true, user: sanitizeUser(user) });
        } catch (error) {
            console.error('Verify artist error:', error.message);
            return res.status(500).json({ success: false, error: 'Unable to update verification.' });
        }
    }

    async showReports(req, res) {
        try {
            const status = String(req.query.status || '');
            const { page, limit, skip } = getPaging(req);
            const filter = ['pending', 'resolved', 'dismissed'].includes(status) ? { status } : {};
            const [total, reports] = await Promise.all([
                Report.countDocuments(filter),
                Report.find(filter)
                    .populate('reporter', 'username email')
                    .populate('handledBy', 'username')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
            ]);
            res.json({ success: true, reports, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to load reports.' });
        }
    }

    async reviewReport(req, res) {
        try {
            const reportId = req.params.id;
            const action = String(req.body.action || '');
            if (!isValidObjectId(reportId)) {
                return res.status(400).json({ success: false, error: 'Invalid report id' });
            }
            if (!['resolve', 'dismiss'].includes(action)) {
                return res.status(400).json({ success: false, error: 'Invalid action' });
            }
            const report = await Report.findById(reportId);
            if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
            report.status = action === 'resolve' ? 'resolved' : 'dismissed';
            report.handledBy = req.session.userID;
            report.handledAt = new Date();
            await report.save();
            await notify({
                recipient: report.reporter,
                type: 'report',
                text: `Your report (${report.type}) was ${report.status}.`
            });
            return res.json({ success: true, report });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to review report.' });
        }
    }

    async getAnalytics(req, res) {
        try {
            const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
            const start = new Date();
            start.setDate(start.getDate() - (days - 1));
            start.setHours(0, 0, 0, 0);
            const userGrowth = await User.aggregate([
                { $match: { createdAt: { $gte: start } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);
            const songGrowth = await Song.aggregate([
                { $match: { createdAt: { $gte: start } } },
                { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);
            res.json({ success: true, days, userGrowth, songGrowth });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to load analytics.' });
        }
    }
}

module.exports = new AdminController();
