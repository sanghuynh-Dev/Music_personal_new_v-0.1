const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const listeningHistorySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    song: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
    listenedAt: { type: Date, default: Date.now }
});

listeningHistorySchema.index({ user: 1, listenedAt: -1 });

module.exports = mongoose.model('ListeningHistory', listeningHistorySchema);
