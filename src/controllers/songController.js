const songService = require('../services/songService');
const Song = require('../models/Song');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');

class SongController {
    async showUpload(req, res) {
        // User must be authenticated, which is checked by middleware.
        res.render('songs/upload', { title: 'Upload Song' });
    }

    async uploadSong(req, res) {
        try {
            const userId = req.session.userID;
            const { title, artist, genre, description } = req.body;

            const audioFile = req.files?.file?.[0];
            const imageFile = req.files?.image?.[0];

            if (!audioFile || !imageFile) {
                return res.status(400).send('Missing files for upload. Audio and Image are required.');
            }

            const song = new Song({
                title,
                artist,
                genre,
                description,
                imageUrl: {
                    url: imageFile.path,
                    public_id: imageFile.filename
                },
                audioUrl: {
                    url: audioFile.path,
                    public_id: audioFile.filename
                },
                uploadedBy: userId,
                likes: [],
                playCount: 0
            });

            await song.save();

            // Optionally update user's tracks count if keeping that field
            // user.tracksCount = ... (we can also compute tracksCount dynamically from DB)

            res.redirect('/');
        } catch (error) {
            console.error('Upload controller error:', error);
            res.status(500).send('Upload failed: ' + error.message);
        }
    }

    async getSongInfo(req, res) {
        try {
            const song = await songService.getSongById(req.params.id, req.session.userID);
            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }
            res.json(song);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getQueue(req, res) {
        try {
            const { currentSongId } = req.query;
            if (!currentSongId) {
                return res.status(400).json({ error: 'Missing currentSongId parameter' });
            }

            const queue = await songService.getSongQueue(currentSongId, req.session.userID);
            res.json(queue);
        } catch (error) {
            console.error('Queue controller error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async playMusic(req, res) {
        try {
            const songId = req.params.id;
            await songService.registerPlay(songId, req.session.userID);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async toggleLike(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await songService.toggleLike(songId, userId);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async addComment(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            const { content } = req.body;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!content || content.trim() === '') {
                return res.status(400).json({ error: 'Comment content cannot be empty' });
            }

            const comment = new Comment({
                user: userId,
                song: songId,
                content: content.trim()
            });

            await comment.save();

            const populatedComment = await Comment.findById(comment._id).populate('user', 'username avatar');
            res.json({ success: true, comment: populatedComment });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getComments(req, res) {
        try {
            const songId = req.params.id;
            const comments = await Comment.find({ song: songId })
                .populate('user', 'username avatar')
                .sort({ createdAt: -1 });
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async deleteSong(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            const userRole = res.locals.user?.role;

            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }

            // Check permissions: Owner of song or Admin can delete
            if (song.uploadedBy.toString() !== userId.toString() && userRole !== 'admin') {
                return res.status(403).json({ error: 'Permission denied' });
            }

            // Delete assets from Cloudinary
            if (song.imageUrl?.public_id) {
                await cloudinary.uploader.destroy(song.imageUrl.public_id);
            }
            if (song.audioUrl?.public_id) {
                await cloudinary.uploader.destroy(song.audioUrl.public_id, { resource_type: 'video' });
            }

            await Song.deleteOne({ _id: songId });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new SongController();
