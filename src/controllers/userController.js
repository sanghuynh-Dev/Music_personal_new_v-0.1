const userService = require('../services/userService');
const songService = require('../services/songService');
const playlistService = require('../services/playlistService');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { deleteUserCascade } = require('../services/accountService');
const { listFor } = require('../services/notifyService');
const { cloudinary } = require('../config/cloudinary');
const { sanitizeUser, isValidObjectId } = require('../middlewares/validate');

class UserController {
    async showProfile(req, res) {
        try {
            const targetUserId = req.params.id || req.session?.userID;
            const currentUserId = req.session?.userID;

            if (!targetUserId) {
                return res.redirect('/login');
            }
            if (!isValidObjectId(targetUserId)) {
                return res.status(400).json({ error: 'Invalid user id' });
            }

            const profileData = await userService.getUserProfile(targetUserId, currentUserId);
            if (!profileData) {
                return res.status(404).json({ error: 'User not found' });
            }

            const isOwnProfile = currentUserId ? targetUserId.toString() === currentUserId.toString() : false;

            res.json({
                title: `${profileData.username}'s Profile`,
                profileUser: sanitizeUser(profileData),
                isOwnProfile,
                tracks: profileData.tracks
            });
        } catch (error) {
            console.error('Profile controller error:', error.message);
            res.status(500).json({ error: 'Unable to load profile.' });
        }
    }

    async updateAvatar(req, res) {
        try {
            const userId = req.session.userID;
            const imageFile = req.files?.image?.[0];

            if (!imageFile) {
                return res.status(400).json({ error: 'No image file uploaded' });
            }

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            if (user.avatar?.public_id) {
                try { await cloudinary.uploader.destroy(user.avatar.public_id); } catch (e) { console.error('Avatar cleanup failed:', e.message); }
            }

            user.avatar = {
                url: imageFile.path,
                public_id: imageFile.filename
            };

            await user.save();
            res.json({ user: sanitizeUser(user) });
        } catch (error) {
            console.error('Update avatar error:', error.message);
            res.status(500).json({ error: 'Avatar update failed.' });
        }
    }

    async updateHeader(req, res) {
        try {
            const userId = req.session.userID;
            const imageFile = req.files?.image?.[0];

            if (!imageFile) {
                return res.status(400).json({ error: 'No image file uploaded' });
            }

            const user = await User.findById(userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            if (user.background?.public_id) {
                try { await cloudinary.uploader.destroy(user.background.public_id); } catch (e) { console.error('Header cleanup failed:', e.message); }
            }

            user.background = {
                url: imageFile.path,
                public_id: imageFile.filename
            };

            await user.save();
            res.json({ user: sanitizeUser(user) });
        } catch (error) {
            console.error('Update header error:', error.message);
            res.status(500).json({ error: 'Header update failed.' });
        }
    }

    async showFavorites(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.redirect('/login');

            const favoriteSongs = await songService.getFavoriteSongs(userId);
            res.json({
                title: 'Favorite Songs',
                songs: favoriteSongs
            });
        } catch (error) {
            res.status(500).json({ error: 'Unable to load favorites.' });
        }
    }

    async toggleFavorite(req, res) {
        try {
            const songId = req.params.songId;
            const userId = req.session.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }

            const result = await songService.toggleFavorite(songId, userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: 'Unable to update favorite.' });
        }
    }

    async showHistory(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.redirect('/login');

            const history = await userService.getListeningHistory(userId);
            res.json({
                title: 'Listening History',
                history
            });
        } catch (error) {
            res.status(500).json({ error: 'Unable to load history.' });
        }
    }

    async followArtist(req, res) {
        try {
            const targetArtistId = req.params.id;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(targetArtistId)) {
                return res.status(400).json({ error: 'Invalid artist id' });
            }

            const result = await userService.toggleFollow(userId, targetArtistId, 'follow');
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async unfollowArtist(req, res) {
        try {
            const targetArtistId = req.params.id;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(targetArtistId)) {
                return res.status(400).json({ error: 'Invalid artist id' });
            }

            const result = await userService.toggleFollow(userId, targetArtistId, 'unfollow');
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUser(req, res) {
        try {
            if (req.sessionRevoked) {
                res.clearCookie('connect.sid');
                return res.status(401).json({ success: false, code: 'SESSION_REVOKED', error: 'Your account was logged in on another device.' });
            }
            const userId = req.session?.userID;

            if (!userId) {
                return res.json(null);
            }
            const user = await User.findById(userId)
                .select('-password')
                .populate('followingArtists', 'username avatar role');
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Unable to load user.' });
        }
    }

    async getUserPlayList(req, res) {
        try {
            const userId = req.session?.userID;

            if (!userId) {
                return res.json([]);
            }
            const playlist = await playlistService.getUserPlaylists(userId);
            res.json(playlist);
        } catch (error) {
            res.status(500).json({ error: 'Unable to load playlists.' });
        }
    }

    async getNotifications(req, res) {
        try {
            const userId = req.session?.userID;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });
            const data = await listFor(userId, parseInt(req.query.limit, 10) || 30);
            res.json({ success: true, ...data });
        } catch (error) {
            res.status(500).json({ error: 'Unable to load notifications.' });
        }
    }

    async markNotificationRead(req, res) {
        try {
            const userId = req.session?.userID;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });
            const { id } = req.params;
            if (id) {
                if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid id' });
                await Notification.updateOne({ _id: id, recipient: userId }, { $set: { read: true } });
            } else {
                await Notification.updateMany({ recipient: userId, read: false }, { $set: { read: true } });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Unable to update notifications.' });
        }
    }

    // Self-service account deletion (GDPR-style right to erasure)
    async deleteMe(req, res) {
        try {
            const userId = req.session?.userID;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });
            const { password } = req.body;
            const user = await User.findById(userId).select('+password');
            if (!user) return res.status(404).json({ error: 'User not found' });
            if (user.role === 'admin') {
                return res.status(403).json({ error: 'Admin accounts cannot be self-deleted. Contact another admin.' });
            }
            const bcrypt = require('bcryptjs');
            const ok = await bcrypt.compare(String(password || ''), user.password);
            if (!ok) return res.status(400).json({ success: false, error: 'Password is incorrect.' });
            await deleteUserCascade(userId);
            req.session?.destroy?.(() => {});
            res.clearCookie('connect.sid');
            res.json({ success: true });
        } catch (error) {
            console.error('Delete account error:', error.message);
            res.status(500).json({ error: 'Unable to delete account.' });
        }
    }

    async getFollowings(req, res) {
        try {
            const userId = req.session?.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const followings = await userService.getFollowings(userId);
            res.json({ success: true, artists: followings });
        } catch (error) {
            res.status(500).json({ error: 'Unable to load followed artists.' });
        }
    }
}

module.exports = new UserController();
