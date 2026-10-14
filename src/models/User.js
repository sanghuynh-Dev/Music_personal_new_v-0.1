const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 100 },
    password: { type: String, required: true, select: false },
    emailVerified: { type: Boolean, default: false },
    artistVerified: { type: Boolean, default: false },
    avatar: {
        url: { type: String, default: '' },
        public_id: { type: String, default: '' }
    },
    background: {
        url: { type: String, default: '' },
        public_id: { type: String, default: '' }
    },
    role: {
        type: String,
        enum: ['user', 'artist', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['active', 'banned'],
        default: 'active'
    },
    favoriteSongs: [{ type: Schema.Types.ObjectId, ref: 'Song' }],
    followingArtists: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // Single-device login: stores the currently valid express-session ID.
    // Null = no active session. Old devices are revoked when this changes.
    activeSessionId: { type: String, default: null, index: true }
}, {
    timestamps: true
});

userSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('User', userSchema);
