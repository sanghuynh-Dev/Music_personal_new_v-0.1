const userService = require('../services/userService');
const songService = require('../services/songService');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

class UserController {
    async showProfile(req, res) {
        try {
            const targetUserId = req.params.id || req.session.userID;
            const currentUserId = req.session.userID;

            if (!targetUserId) {
                return res.redirect('/login');
            }

            const profileData = await userService.getUserProfile(targetUserId, currentUserId);
            if (!profileData) {
                return res.status(404).send('User not found');
            }

            const isOwnProfile = targetUserId.toString() === currentUserId?.toString();

            res.render('users/profile', {
                title: `${profileData.username}'s Profile`,
                profileUser: profileData,
                isOwnProfile,
                tracks: profileData.tracks
            });
        } catch (error) {
            console.error('Profile controller error:', error);
            res.status(500).send(error.message);
        }
    }

    async updateAvatar(req, res) {
        try {
            const userId = req.session.userID;
            const imageFile = req.files?.image?.[0];

            if (!imageFile) {
                return res.status(400).send('No image file uploaded');
            }

            const user = await User.findById(userId);
            if (user.avatar?.public_id) {
                await cloudinary.uploader.destroy(user.avatar.public_id);
            }

            user.avatar = {
                url: imageFile.path,
                public_id: imageFile.filename
            };

            await user.save();
            res.redirect(`/profile/${userId}`);
        } catch (error) {
            console.error('Update avatar error:', error);
            res.status(500).send(error.message);
        }
    }

    async updateHeader(req, res) {
        try {
            const userId = req.session.userID;
            const imageFile = req.files?.image?.[0];

            if (!imageFile) {
                return res.status(400).send('No image file uploaded');
            }

            const user = await User.findById(userId);
            if (user.background?.public_id) {
                await cloudinary.uploader.destroy(user.background.public_id);
            }

            user.background = {
                url: imageFile.path,
                public_id: imageFile.filename
            };

            await user.save();
            res.redirect(`/profile/${userId}`);
        } catch (error) {
            console.error('Update header error:', error);
            res.status(500).send(error.message);
        }
    }

    async showFavorites(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.redirect('/login');

            const favoriteSongs = await songService.getFavoriteSongs(userId);
            res.render('users/favorites', {
                title: 'Favorite Songs',
                songs: favoriteSongs
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async toggleFavorite(req, res) {
        try {
            const songId = req.params.songId;
            const userId = req.session.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await songService.toggleFavorite(songId, userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async showHistory(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.redirect('/login');

            const history = await userService.getListeningHistory(userId);
            res.render('users/history', {
                title: 'Listening History',
                history
            });
        } catch (error) {
            res.status(500).send(error.message);
        }
    }

    async followArtist(req, res) {
        try {
            const targetArtistId = req.params.id;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await userService.toggleFollow(userId, targetArtistId, 'follow');
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async unfollowArtist(req, res) {
        try {
            const targetArtistId = req.params.id;
            const userId = req.session.userID;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await userService.toggleFollow(userId, targetArtistId, 'unfollow');
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UserController();
