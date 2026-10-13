const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['follow', 'like', 'ban', 'report', 'system'], default: 'system' },
    text: { type: String, required: true, trim: true, maxlength: 300 },
    link: { type: String, trim: true, maxlength: 300, default: '' },
    read: { type: Boolean, default: false, index: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
