const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Email OTP codes for signup verification.
// Only the SHA-256 hash is stored; raw 6-digit codes are never persisted.
// Expired / superseded docs are auto-removed by the TTL index.
const emailOtpSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    otpHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    superseded: { type: Boolean, default: false, index: true },
    // Explicit send timestamp for the 60s resend cooldown.
    lastSentAt: { type: Date, default: Date.now },
    // True once the code was actually handed to SMTP. Login reuses an
    // active code only when emailed=true; otherwise it mints a fresh one
    // (e.g. SMTP was down at signup and the inbox has nothing).
    emailed: { type: Boolean, default: false },
    // Validity is enforced by querying expiresAt; cleanup runs off deleteAt
    // (~70min) so recent send history survives for the hourly spam cap.
    deleteAt: { type: Date, required: true }
}, {
    timestamps: { createdAt: true, updatedAt: true }
});

// Auto-delete old codes (Mongo TTL monitor, ~60s granularity).
emailOtpSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOtp', emailOtpSchema);
