const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
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
    followingArtists: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
