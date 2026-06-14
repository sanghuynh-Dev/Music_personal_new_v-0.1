const User = require('../models/User');
const Song = require('../models/Song');
const Follow = require('../models/Follow');
const { cloudinary } = require('../config/cloudinary');

class AdminController {
    async showDashboard(req, res) {
        try {
            const totalUsers = await User.countDocuments({ role: 'user' });
            const totalArtists = await User.countDocuments({ role: 'artist' });
            const totalSongs = await Song.countDocuments();

            const allSongs = await Song.find().select('playCount').lean();
            const totalPlays = allSongs.reduce((sum, s) => sum + (s.playCount || 0), 0);

            // Fetch recently registered users
            const recentUsers = await User.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            // Fetch recently uploaded songs
            const recentSongs = await Song.find()
                .populate('uploadedBy', 'username')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                stats: {
                    totalUsers,
                    totalArtists,
                    totalSongs,
                    totalPlays
                },
                recentUsers,
                recentSongs
            });
        } catch (error) {
            console.error('Admin dashboard error:', error);
            res.status(500).send(error.message);
        }
    }

    async showUsers(req, res) {
        try {
            const users = await User.find({ role: { $ne: 'admin' } })
                .sort({ createdAt: -1 })
                .lean();

            res.render('admin/users', {
                title: 'User Management',
                users
            });
        } catch (error) {
            console.error('Admin users view error:', error);
            res.status(500).send(error.message);
        }
    }

    async showArtists(req, res) {
        try {
            const artists = await User.find({ role: 'artist' })
                .sort({ createdAt: -1 })
                .lean();

            // Fetch follower counts for each artist
            const artistsWithStats = await Promise.all(artists.map(async (artist) => {
                const followerCount = await Follow.countDocuments({ artist: artist._id });
                const songs = await Song.find({ uploadedBy: artist._id }).lean();
                const songCount = songs.length;
                const totalPlays = songs.reduce((sum, s) => sum + (s.playCount || 0), 0);
                
                return {
                    ...artist,
                    followerCount,
                    songCount,
                    totalPlays
                };
            }));

            res.render('admin/artists', {
                title: 'Artist Management',
                artists: artistsWithStats
            });
        } catch (error) {
            console.error('Admin artists view error:', error);
            res.status(500).send(error.message);
        }
    }

    async showSongs(req, res) {
        try {
            const songs = await Song.find()
                .populate('uploadedBy', 'username')
                .sort({ createdAt: -1 })
                .lean();

            res.render('admin/songs', {
                title: 'Song Management',
                songs
            });
        } catch (error) {
            console.error('Admin songs view error:', error);
            res.status(500).send(error.message);
        }
    }

    async promoteUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            user.role = 'artist';
            await user.save();

            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true, user });
            }
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Promote user error:', error);
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ success: false, error: error.message });
            }
            res.status(500).send(error.message);
        }
    }

    async toggleBanUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (user.role === 'admin') {
                return res.status(403).json({ success: false, error: 'Cannot ban admin accounts' });
            }

            user.status = user.status === 'banned' ? 'active' : 'banned';
            await user.save();

            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true, user });
            }
            res.redirect('/admin/users');
        } catch (error) {
            console.error('Toggle ban error:', error);
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ success: false, error: error.message });
            }
            res.status(500).send(error.message);
        }
    }

    async deleteSong(req, res) {
        try {
            const songId = req.params.id;
            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).json({ success: false, error: 'Song not found' });
            }

            // Destroy files on Cloudinary
            if (song.imageUrl?.public_id) {
                await cloudinary.uploader.destroy(song.imageUrl.public_id);
            }
            if (song.audioUrl?.public_id) {
                await cloudinary.uploader.destroy(song.audioUrl.public_id, { resource_type: 'video' });
            }

            await Song.deleteOne({ _id: songId });

            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.json({ success: true });
            }
            res.redirect('/admin/songs');
        } catch (error) {
            console.error('Admin delete song error:', error);
            if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
                return res.status(500).json({ success: false, error: error.message });
            }
            res.status(500).send(error.message);
        }
    }
}

module.exports = new AdminController();
