const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// One-time tokens for email verification / password reset.
// Only the SHA-256 hash is stored; raw tokens are never persisted.
const authTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['verify', 'reset'], required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

// Auto-delete expired tokens
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthToken', authTokenSchema);
