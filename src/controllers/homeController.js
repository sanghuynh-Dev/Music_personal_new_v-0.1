const Song = require('../models/Song');
const User = require('../models/User');
const Follow = require('../models/Follow');
const userService = require('../services/userService');
const songService = require('../services/songService');

class HomeController {
    async index(req, res) {
        try {
            const userId = req.session.userID;

            // Fetch a pool of songs for the home screen (e.g., up to 16)
            const songs = await Song.find()
                .populate('uploadedBy', 'username')
                .limit(16)
                .lean();

            // Map liked state
            const formattedSongs = songs.map(song => ({
                ...song,
                liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
            }));

            // Suggest artists (up to 5 random users with role 'user' or 'artist' that the current user isn't already following)
            let suggestedArtists = [];
            const query = { role: { $in: ['user', 'artist'] } };
            if (userId) {
                query._id = { $ne: userId };
                
                // Get list of followed artist IDs
                const followings = await Follow.find({ follower: userId }).lean();
                const followedIds = followings.map(f => f.artist.toString());
                if (followedIds.length > 0) {
                    query._id = { $ne: userId, $nin: followedIds };
                }
            }

            suggestedArtists = await User.find(query).limit(5).lean();

            // Get recently played songs for the logged-in user
            let recentlyPlayed = [];
            if (userId) {
                recentlyPlayed = await userService.getListeningHistory(userId);
                // Limit to top 6 for the home page layout
                recentlyPlayed = recentlyPlayed.slice(0, 6);
            }

            res.render('home/index', {
                title: 'Home',
                songs: formattedSongs,
                suggestedArtists,
                recentlyPlayed
            });
        } catch (error) {
            console.error('Home controller error:', error);
            res.status(500).send(error.message);
        }
    }
}

module.exports = new HomeController();
