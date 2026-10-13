const User = require('../models/User');
const Song = require('../models/Song');
const Follow = require('../models/Follow');
const Playlist = require('../models/Playlist');
const Comment = require('../models/Comment');
const ListeningHistory = require('../models/ListeningHistory');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const AuthToken = require('../models/AuthToken');
const { cloudinary } = require('../config/cloudinary');

// Shared destructive cascade used by admin delete AND self-service account deletion.
async function deleteUserCascade(userId) {
    const songs = await Song.find({ uploadedBy: userId }).select('_id imageUrl audioUrl').lean();
    for (const s of songs) {
        try {
            if (s.imageUrl?.public_id) await cloudinary.uploader.destroy(s.imageUrl.public_id);
            if (s.audioUrl?.public_id) await cloudinary.uploader.destroy(s.audioUrl.public_id, { resource_type: 'video' });
        } catch (e) { console.error('User-delete asset cleanup failed:', e.message); }
    }
    const songIds = songs.map((s) => s._id);
    await Song.deleteMany({ uploadedBy: userId });
    await Playlist.deleteMany({ user: userId });
    await Comment.deleteMany({ user: userId });
    await ListeningHistory.deleteMany({ user: userId });
    await Follow.deleteMany({ $or: [{ follower: userId }, { artist: userId }] });
    if (songIds.length) {
        await Playlist.updateMany({}, { $pull: { songs: { $in: songIds } } });
        await User.updateMany({}, { $pull: { favoriteSongs: { $in: songIds } } });
        await Song.updateMany({}, { $pull: { likes: userId } });
        await Comment.deleteMany({ song: { $in: songIds } });
        await ListeningHistory.deleteMany({ song: { $in: songIds } });
    }
    await User.updateMany({}, { $pull: { followingArtists: userId } });
    await Report.deleteMany({ reporter: userId });
    await Notification.deleteMany({ recipient: userId });
    await AuthToken.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });
}

module.exports = { deleteUserCascade };
