const Report = require('../models/Report');
const Song = require('../models/Song');
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Comment = require('../models/Comment');
const { cleanText, isValidObjectId } = require('../middlewares/validate');

const TARGET_MODELS = { song: Song, user: User, playlist: Playlist, comment: Comment };

class ReportController {
    async create(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

            const targetType = String(req.body.targetType || '');
            const targetId = req.body.targetId;
            const type = String(req.body.type || 'other');
            const reason = cleanText(req.body.reason, 1000);

            if (!['song', 'user', 'playlist', 'comment'].includes(targetType)) {
                return res.status(400).json({ success: false, error: 'Invalid targetType' });
            }
            if (!isValidObjectId(targetId)) {
                return res.status(400).json({ success: false, error: 'Invalid targetId' });
            }
            const Model = TARGET_MODELS[targetType];
            const exists = await Model.findById(targetId).select('_id').lean();
            if (!exists) {
                return res.status(404).json({ success: false, error: 'Reported content not found' });
            }

            // One pending report per reporter + target — no pile-ons, no spam.
            const pending = await Report.findOne({ reporter: userId, targetType, targetId, status: 'pending' }).lean();
            if (pending) {
                return res.json({ success: true, duplicate: true, report: pending });
            }

            const report = await Report.create({
                reporter: userId,
                targetType,
                targetId,
                type: ['copyright', 'inappropriate', 'spam', 'impersonation', 'other'].includes(type) ? type : 'other',
                reason: reason || ''
            });
            res.json({ success: true, report });
        } catch (error) {
            console.error('Create report error:', error.message);
            res.status(500).json({ success: false, error: 'Unable to submit report.' });
        }
    }

    async mine(req, res) {
        try {
            const userId = req.session.userID;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            const reports = await Report.find({ reporter: userId }).sort({ createdAt: -1 }).limit(50).lean();
            res.json({ success: true, reports });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Unable to load reports.' });
        }
    }
}

module.exports = new ReportController();
