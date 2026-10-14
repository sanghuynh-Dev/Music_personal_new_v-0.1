const songService = require('../services/songService');
const Song = require('../models/Song');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { cloudinary } = require('../config/cloudinary');
const { sanitizeUser, cleanText, isValidObjectId } = require('../middlewares/validate');

class SongController {
    async showUpload(req, res) {
        // User must be authenticated, which is checked by middleware.
        const user = await User.findById(req.session?.userID).select('-password').lean();
        res.json({
            title: 'Upload Song',
            user
         });
    }

    async showSongDetail(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            const userId = req.session?.userID;

            const song = await songService.getSongById(songId, userId);
            if (!song) {
                return res.status(404).render('errors/404', { title: '404 - Not Found' });
            }

            res.json({
                title: `${song.title} - Song Details`,
                song
            });
        } catch (error) {
            console.error('Show song detail error:', error.message);
            res.status(500).json({ error: 'Unable to load song.' });
        }
    }

    async uploadSong(req, res) {
        let uploadedFiles = [];
        try {
            const userId = req.session.userID;
            const title = cleanText(req.body.title, 200);
            const artist = cleanText(req.body.artist, 200);
            const genre = cleanText(req.body.genre, 100);
            const description = cleanText(req.body.description, 2000);

            const audioFile = req.files?.file?.[0];
            const imageFile = req.files?.image?.[0];

            if (!audioFile || !imageFile) {
                return res.status(400).json({ error: 'Missing files for upload. Audio and Image are required.' });
            }
            uploadedFiles = [audioFile, imageFile];
            // 5MB image cap (multer caps 20MB per file for audio)
            if (imageFile.size && imageFile.size > 5 * 1024 * 1024) {
                throw new Error('Image too large (max 5MB).');
            }
            if (!title || !artist) {
                throw new Error('Title and artist are required.');
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

            res.json({ success: true, songId: song._id });
        } catch (error) {
            // Cleanup orphan files on Cloudinary if DB save failed
            for (const f of uploadedFiles) {
                try {
                    if (f?.filename) {
                        const rt = f.mimetype?.startsWith('audio') ? { resource_type: 'video' } : {};
                        await cloudinary.uploader.destroy(f.filename, rt);
                    }
                } catch (e) { console.error('Orphan cleanup failed:', e.message); }
            }
            console.error('Upload controller error:', error.message);
            res.status(400).json({ error: error.message || 'Upload failed.' });
        }
    }

    async getSongInfo(req, res) {
        try {
            if (!isValidObjectId(req.params.id)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            const song = await songService.getSongById(req.params.id, req.session?.userID);
            if (!song) {
                return res.status(404).json({ error: 'Song not found' });
            }
            res.json(song);
        } catch (error) {
            res.status(500).json({ error: 'Unable to load song.' });
        }
    }

    async getQueue(req, res) {
        try {
            const { currentSongId } = req.query;
            if (!currentSongId) {
                return res.status(400).json({ error: 'Missing currentSongId parameter' });
            }
            if (!isValidObjectId(currentSongId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            const queue = await songService.getSongQueue(currentSongId, req.session?.userID);
            res.json(queue);
        } catch (error) {
            console.error('Queue controller error:', error.message);
            res.status(500).json({ error: 'Unable to load queue.' });
        }
    }

    async playMusic(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            await songService.registerPlay(songId, req.session?.userID);
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Unable to register play.' });
        }
    }

    async toggleLike(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }

            const resultLike = await songService.toggleLike(songId, userId);
            const resultFavorite = await songService.toggleFavorite(songId, userId);
            res.json({
                ...resultLike,
                ...resultFavorite
            });
        } catch (error) {
            res.status(500).json({ error: 'Unable to update like.' });
        }
    }

    async addComment(req, res) {
        try {
            const songId = req.params.id;
            const userId = req.session.userID;
            const content = cleanText(req.body.content, 1000);

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            if (!content || content.trim() === '') {
                return res.status(400).json({ error: 'Comment content cannot be empty' });
            }

            const comment = new Comment({
                user: userId,
                song: songId,
                content
            });

            await comment.save();

            const populatedComment = await Comment.findById(comment._id).populate('user', 'username avatar');
            res.json({ success: true, comment: populatedComment });
        } catch (error) {
            res.status(500).json({ error: 'Unable to add comment.' });
        }
    }

    async getComments(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
            const comments = await Comment.find({ song: songId })
                .populate('user', 'username avatar')
                .sort({ createdAt: -1 })
                .limit(limit);
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: 'Unable to load comments.' });
        }
    }

    async deleteSong(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
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
            // Drop dangling refs so favorites/history never crash on populate.
            await User.updateMany(
                { favoriteSongs: songId },
                { $pull: { favoriteSongs: songId } }
            ).catch(() => {});
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: 'Unable to delete song.' });
        }
    }

    async showEditSong(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
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
            console.error('Show edit song error:', error.message);
            res.status(500).json({ error: 'Unable to load song.' });
        }
    }

    async editSong(req, res) {
        try {
            const songId = req.params.id;
            if (!isValidObjectId(songId)) {
                return res.status(400).json({ error: 'Invalid song id' });
            }
            const userId = req.session.userID;
            const userRole = res.locals.user?.role;
            const title = cleanText(req.body.title, 200);
            const genre = cleanText(req.body.genre, 100);
            const description = cleanText(req.body.description, 2000);

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
            console.error('Edit song error:', error.message);
            res.status(500).json({ error: 'Edit failed.' });
        }
    }
}

module.exports = new SongController();
