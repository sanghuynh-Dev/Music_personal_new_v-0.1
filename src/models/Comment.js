const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

commentSchema.index({ song: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
