const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songSchema = new Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    genre: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: {
        url: { type: String, default: '' },
        public_id: { type: String, default: '' }
    },
    audioUrl: {
        url: { type: String, default: '' },
        public_id: { type: String, default: '' }
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    playCount: { type: Number, default: 0, min: 0 },
    duration: { type: Number, default: 0, min: 0 } // duration in seconds
}, {
    timestamps: true
});

songSchema.index({ uploadedBy: 1 });
songSchema.index({ createdAt: -1 });
songSchema.index({ playCount: -1 });
songSchema.index({ title: 'text', artist: 'text', genre: 'text' });

module.exports = mongoose.model('Song', songSchema);
