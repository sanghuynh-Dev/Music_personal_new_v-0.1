const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    content: { type: String, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model('Comment', commentSchema);
