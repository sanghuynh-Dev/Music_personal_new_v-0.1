const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['song', 'user', 'playlist', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    type: {
        type: String,
        enum: ['copyright', 'inappropriate', 'spam', 'impersonation', 'other'],
        default: 'other'
    },
    reason: { type: String, trim: true, maxlength: 1000, default: '' },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
    handledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    handledAt: { type: Date, default: null }
}, {
    timestamps: true
});

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
