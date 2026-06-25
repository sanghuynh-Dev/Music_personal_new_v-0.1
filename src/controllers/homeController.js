const Song = require('../models/Song');
const User = require('../models/User');
const Follow = require('../models/Follow');
const userService = require('../services/userService');
const songService = require('../services/songService');

class HomeController {
    async index(req, res) {
        try {
            const userId = req.session.userID;
            const user = await User.findById(userId);

            // Fetch a pool of songs for the home screen (e.g., up to 16)
            const songs = await Song.aggregate([
                { $sample: { size: 16 } }
            ]);
            // Map liked state
            const formattedSongs = songs.map(song => ({
                ...song,
                liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
            }));

            // Fetch Top Songs sorted by playCount
            const topSongs = await Song.find()
                .populate('uploadedBy', 'username')
                .sort({ playCount: -1 })
                .limit(5)
                .lean();

            const formattedTopSongs = topSongs.map(song => ({
                ...song,
                liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
            }));

            // Fetch New Releases
            const newReleases = await songService.getNewReleases(userId);
            const formattedNewReleases = newReleases.slice(0, 6);

            // Fetch Top Artists (by follower count)
            const topFollows = await Follow.aggregate([
                { $group: { _id: '$artist', followerCount: { $sum: 1 } } },
                { $sort: { followerCount: -1 } },
                { $limit: 5 }
            ]);
            const topArtistIds = topFollows.map(f => f._id);
            let topArtists = await User.find({ _id: { $in: topArtistIds } }).lean();
            topArtists = topArtists.map(artist => {
                const followObj = topFollows.find(f => f._id.toString() === artist._id.toString());
                return {
                    ...artist,
                    followerCount: followObj ? followObj.followerCount : 0
                };
            }).sort((a, b) => b.followerCount - a.followerCount);

            if (topArtists.length < 5) {
                const existingIds = topArtists.map(a => a._id.toString());
                const extraArtists = await User.find({
                    role: 'artist',
                    _id: { $nin: existingIds }
                }).limit(5 - topArtists.length).lean();
                
                const extraWithCount = extraArtists.map(a => ({ ...a, followerCount: 0 }));
                topArtists = [...topArtists, ...extraWithCount];
            }

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

            const followingSet = new Set(
                (user?.followingArtists || []).map(id => id.toString())
            );

            suggestedArtists = await User.find(query).limit(5).lean();
            const newSuggestedArtists = suggestedArtists.map(artist => ({
                ...artist,
                isFollowing: userId ? followingSet.has(artist._id.toString()) : false
            }));

            // Get recently played songs for the logged-in user
            let recentlyPlayed = [];
            if (userId) {
                recentlyPlayed = await userService.getListeningHistory(userId);
                // Limit to top 6 for the home page layout
                recentlyPlayed = recentlyPlayed.slice(0, 6);
            }

            res.json({
                title: 'Home',
                songs: formattedSongs,
                topSongs: formattedTopSongs,
                newReleases: formattedNewReleases,
                topArtists,
                newSuggestedArtists,
                recentlyPlayed
            });
        } catch (error) {
            console.error('Home controller error:', error);
            res.status(500).send(error.message);
        }
    }

    test(req, res) {
        res.json( {massage: 'Hello World!'} );
    }
}

module.exports = new HomeController();
