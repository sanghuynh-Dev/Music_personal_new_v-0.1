const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    isPrivate: { type: Boolean, default: false, index: true }
}, {
    timestamps: true
});

playlistSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Playlist', playlistSchema);
