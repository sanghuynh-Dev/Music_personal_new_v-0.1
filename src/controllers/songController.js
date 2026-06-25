const songService = require('../services/songService');
const Song = require('../models/Song');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');

class SongController {
    async showUpload(req, res) {
        // User must be authenticated, which is checked by middleware.
        const user = await User.findById(req.session.userID);
        res.json({ 
            title: 'Upload Song',
            user
         });
    }

    async showSongDetail(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;

            const song = await songService.getSongById(songId, userId);
            if (!song) {
                return res.status(404).render('errors/404', { title: '404 - Not Found' });
            }

            res.json({
                title: `${song.title} - Song Details`,
                song
            });
        } catch (error) {
            console.error('Show song detail error:', error);
            res.status(500).render('errors/500', {
                title: '500 - Server Error',
                message: error.message
            });
        }
    }

    async uploadSong(req, res) {
        try {
            const userId = req.session.userID;
            const { title, artist, genre, description} = req.body;

            const audioFile = req.files?.file?.[0];
            const imageFile = req.files?.image?.[0];
            console.log(req.body);

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

            res.json({ success: true });
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

            const resultLike = await songService.toggleLike(songId, userId);
            const resultFavorite = await songService.toggleFavorite(songId, userId);
            res.json({
                ...resultLike,
                ...resultFavorite
            });
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

    async showEditSong(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            const userRole = res.locals.user?.role;

            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).render('errors/404', { title: '404 - Not Found' });
            }

            // Check permissions
            if (song.uploadedBy.toString() !== userId.toString() && userRole !== 'admin') {
                return res.status(403).render('errors/403', {
                    title: 'Forbidden',
                    message: 'You do not have permission to edit this song.'
                });
            }

            res.json({
                title: `Edit Song - ${song.title}`,
                song
            });
        } catch (error) {
            console.error('Show edit song error:', error);
            res.status(500).render('errors/500', {
                title: '500 - Server Error',
                message: error.message
            });
        }
    }

    async editSong(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            const userRole = res.locals.user?.role;
            const { title, genre, description } = req.body;
            console.log(req.body);

            const song = await Song.findById(songId);
            if (!song) {
                return res.status(404).send('Song not found');
            }

            // Check permissions
            if (song.uploadedBy.toString() !== userId.toString() && userRole !== 'admin') {
                return res.status(403).send('Permission denied');
            }

            song.title = title || song.title;
            song.genre = genre || song.genre;
            song.description = description || song.description;

            await song.save();
            res.json({ success: true });
        } catch (error) {
            console.error('Edit song error:', error);
            res.status(500).send('Edit failed: ' + error.message);
        }
    }
}

module.exports = new SongController();
