const Playlist = require('../models/Playlist');
const Song = require('../models/Song');

class PlaylistService {
    async createPlaylist(name, userId) {
        if (!name || name.trim() === '') {
            throw new Error('Playlist name cannot be empty');
        }

        const playlist = new Playlist({
            name: name.trim(),
            user: userId,
            songs: []
        });

        return await playlist.save();
    }

    async getPlaylistById(playlistId, userId = null) {
        const playlist = await Playlist.findById(playlistId)
            .populate('user', 'username')
            .populate({
                path: 'songs',
                populate: { path: 'uploadedBy', select: 'username' }
            })
            .lean();

        if (!playlist) return null;

        // Map liked state for each song in the playlist
        if (playlist.songs && playlist.songs.length > 0) {
            playlist.songs = playlist.songs.map(song => ({
                ...song,
                liked: userId ? song.likes.some(id => id.toString() === userId.toString()) : false
            }));
        }

        return playlist;
    }

    async getUserPlaylists(userId) {
        return await Playlist.find({ user: userId }).sort({ createdAt: -1 }).lean();
    }

    async addSongToPlaylist(playlistId, songId, userId) {
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            throw new Error('Playlist not found or access denied');
        }

        const song = await Song.findById(songId);
        if (!song) {
            throw new Error('Song not found');
        }

        // Avoid duplicates
        if (playlist.songs.includes(songId)) {
            return playlist;
        }

        playlist.songs.push(songId);
        return await playlist.save();
    }

    async removeSongFromPlaylist(playlistId, songId, userId) {
        const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
        if (!playlist) {
            throw new Error('Playlist not found or access denied');
        }

        const index = playlist.songs.indexOf(songId);
        if (index > -1) {
            playlist.songs.splice(index, 1);
            await playlist.save();
        }

        return playlist;
    }

    async deletePlaylist(playlistId, userId) {
        const result = await Playlist.deleteOne({ _id: playlistId, user: userId });
        if (result.deletedCount === 0) {
            throw new Error('Playlist not found or access denied');
        }
        return { success: true };
    }
}

module.exports = new PlaylistService();
