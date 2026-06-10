const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    artist: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

followSchema.index({ follower: 1, artist: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
