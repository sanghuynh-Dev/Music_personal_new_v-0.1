const Song = require('../models/Song');
const User = require('../models/User');
const ListeningHistory = require('../models/ListeningHistory');

class SongService {
    async getSongById(songId, userId = null) {
        const song = await Song.findById(songId).populate('uploadedBy', 'username').lean();
        if (!song) return null;

        return {
            ...song,
            liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
        };
    }

    async getSongQueue(currentSongId, userId = null) {
        const currentSong = await Song.findById(currentSongId).populate('uploadedBy', 'username').lean();
        if (!currentSong) return [];

        currentSong.liked = userId ? currentSong.likes.some(id => id.toString() === userId.toString()) : false;

        // Get up to 5 other songs uploaded by the same artist
        let queue = await Song.find({
            uploadedBy: currentSong.uploadedBy._id,
            _id: { $ne: currentSongId }
        })
        .populate('uploadedBy', 'username')
        .limit(2)
        .lean();

        // Check likes for queue songs
        queue = queue.map(song => ({
            ...song,
            liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
        }));

        // If less than 5, fill with random songs from other uploaders
        if (queue.length < 10) {
            const need = 10 - queue.length;
            const randomSongs = await Song.aggregate([
                { $match: { uploadedBy: { $ne: currentSong.uploadedBy._id } } },
                { $sample: { size: need } }
            ]);

            // Populate uploader for aggregate results
            const populatedRandom = await Song.populate(randomSongs, { path: 'uploadedBy', select: 'username' });

            const formattedRandom = populatedRandom.map(song => ({
                ...song,
                liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
            }));

            queue = [...queue, ...formattedRandom];
        }

        return [currentSong, ...queue];
    }

    async registerPlay(songId, userId = null) {
        // Increment play count on the Song model
        await Song.updateOne({ _id: songId }, { $inc: { playCount: 1 } });

        // If logged in, save to listening history log (ListeningHistory collection)
        if (userId) {
            const history = await ListeningHistory.findOne({ user: userId, song: songId });
            if (history) {
                await ListeningHistory.updateOne({ user: userId, song: songId }, { $set: { listenedAt: Date.now() } });
                return;
            }
            await ListeningHistory.create({
                user: userId,
                song: songId
            });
        }
    }

    async toggleLike(songId, userId) {
        const song = await Song.findById(songId);
        if (!song) throw new Error('Song not found');

        const index = song.likes.indexOf(userId);
        let liked = false;

        if (index > -1) {
            // Already liked, so unlike it
            song.likes.splice(index, 1);
            liked = false;
        } else {
            // Like it
            song.likes.push(userId);
            liked = true;
        }

        await song.save();

        const count = song.likes.length;
        return { liked, count };
    }

    async toggleFavorite(songId, userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const index = user.favoriteSongs.indexOf(songId);
        let favorited = false;

        if (index > -1) {
            user.favoriteSongs.splice(index, 1);
            favorited = false;
        } else {
            user.favoriteSongs.push(songId);
            favorited = true;
        }

        await user.save();
        return { favorited };
    }

    async getFavoriteSongs(userId) {
        const user = await User.findById(userId).populate({
            path: 'favoriteSongs',
            populate: { path: 'uploadedBy', select: 'username' }
        }).lean();

        if (!user) return [];

        return user.favoriteSongs.map(song => ({
            ...song,
            liked: song.likes.some(id => id.toString() === userId.toString()),
            favorited: true
        }));
    }

    async searchSongs(query, userId = null) {
        const regex = new RegExp(query, 'i');
        // Search by title, artist name, or genre
        const songs = await Song.find({
            $or: [
                { title: regex },
                { artist: regex },
                { genre: regex }
            ]
        })
        .populate('uploadedBy', 'username')
        .limit(10)
        .lean();

        return songs.map(song => ({
            ...song,
            liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
        }));
    }

    async getNewReleases(userId = null) {
        const songs = await Song.find()
            .populate('uploadedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return songs.map(song => ({
            ...song,
            liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
        }));
    }
}

module.exports = new SongService();
