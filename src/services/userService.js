const User = require('../models/User');
const Song = require('../models/Song');
const Follow = require('../models/Follow');
const ListeningHistory = require('../models/ListeningHistory');

class UserService {
    async getUserProfile(targetUserId, currentUserId = null) {
        const user = await User.findById(targetUserId).lean();
        if (!user) return null;

        // Get uploaded tracks
        const tracks = await Song.find({ uploadedBy: targetUserId })
            .populate('uploadedBy', 'username')
            .lean();

        // Map liked status for songs
        const formattedTracks = tracks.map(song => ({
            ...song,
            liked: currentUserId ? song.likes.some(id => id.toString() === currentUserId.toString()) : false
        }));

        // Get follower and following counts
        const followerCount = await Follow.countDocuments({ artist: targetUserId });
        const followingCount = await Follow.countDocuments({ follower: targetUserId });

        // Get uploader tracks count
        const tracksCount = formattedTracks.length;

        // Calculate total play counts
        const totalPlays = formattedTracks.reduce((sum, track) => sum + (track.playCount || 0), 0);

        // Check if current user is following target user
        let isFollowing = false;
        if (currentUserId && currentUserId.toString() !== targetUserId.toString()) {
            const follow = await Follow.findOne({ follower: currentUserId, artist: targetUserId });
            isFollowing = !!follow;
        }

        return {
            ...user,
            tracks: formattedTracks,
            tracksCount,
            followerCount,
            followingCount,
            totalPlays,
            isFollowing
        };
    }

    async toggleFollow(currentUserId, targetArtistId, action) {
        if (currentUserId.toString() === targetArtistId.toString()) {
            throw new Error('You cannot follow yourself');
        }

        const artist = await User.findById(targetArtistId);
        if (!artist) throw new Error('Artist not found');

        const currentUser = await User.findById(currentUserId);
        if (!currentUser) throw new Error('User not found');

        if (action === 'follow') {
            // Create follow relationship
            await Follow.findOneAndUpdate(
                { follower: currentUserId, artist: targetArtistId },
                { follower: currentUserId, artist: targetArtistId },
                { upsert: true }
            );

            // Update user following arrays
            await User.updateOne(
                { _id: currentUserId },
                { $addToSet: { followingArtists: targetArtistId } }
            );
        } else if (action === 'unfollow') {
            // Delete follow relationship
            await Follow.deleteOne({ follower: currentUserId, artist: targetArtistId });

            // Update user following arrays
            await User.updateOne(
                { _id: currentUserId },
                { $pull: { followingArtists: targetArtistId } }
            );
        }

        const count = await Follow.countDocuments({ artist: targetArtistId });
        return { success: true, count };
    }

    async getListeningHistory(userId) {
        const history = await ListeningHistory.find({ user: userId })
            .populate({
                path: 'song',
                populate: { path: 'uploadedBy', select: 'username' }
            })
            .sort({ listenedAt: -1 })
            .limit(50)
            .lean();

        // Format and map liked status
        return history.filter(h => h.song).map(h => ({
            ...h,
            song: {
                ...h.song,
                liked: h.song.likes.some(id => id.toString() === userId.toString())
            }
        }));
    }

    async getFollowings(userId) {
        const follows = await Follow.find({ follower: userId }).populate('artist').lean();
        return follows.map(f => f.artist).filter(Boolean);
    }

    async getFollowers(userId) {
        const follows = await Follow.find({ artist: userId }).populate('follower').lean();
        return follows.map(f => f.follower).filter(Boolean);
    }
}



module.exports = new UserService();
