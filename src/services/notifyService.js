const Notification = require('../models/Notification');

// Fire-and-forget helper: notification failures must never break main flows.
async function notify({ recipient, type = 'system', text, link = '' }) {
    try {
        if (!recipient || !text) return null;
        return await Notification.create({ recipient, type, text: String(text).slice(0, 300), link: String(link).slice(0, 300) });
    } catch (e) {
        console.error('Notify failed:', e.message);
        return null;
    }
}

async function listFor(userId, limit = 30) {
    const items = await Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .limit(Math.min(50, Math.max(1, limit)))
        .lean();
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });
    return { items, unreadCount };
}

module.exports = { notify, listFor };
