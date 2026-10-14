const User = require('../models/User');

const setUserLocal = async (req, res, next) => {
    res.locals.userID = req.session?.userID || null;
    res.locals.user = null;
    req.sessionRevoked = false;

    if (req.session?.userID) {
        try {
            const user = await User.findById(req.session.userID).select('status role activeSessionId').lean();
            if (user) {
                if (user.status === 'banned') {
                    req.session?.destroy?.(() => {});
                    res.locals.userID = null;
                    res.locals.user = null;
                } else if (user.activeSessionId && user.activeSessionId !== req.sessionID) {
                    // Logged in on another device — revoke this stale session.
                    req.sessionRevoked = true;
                    res.locals.userID = null;
                    res.locals.user = null;
                    const stale = req.session;
                    // Destroy async; don't block the response on store errors.
                    try {
                        await new Promise((resolve) => stale.destroy(() => resolve()));
                    } catch (e) { /* ignore */ }
                } else {
                    res.locals.user = user;
                }
            } else {
                // Session contains invalid ID
                req.session?.destroy?.(() => {});
            }
        } catch (error) {
            console.error('Error fetching user for locals:', error.message);
        }
    }
    next();
};

const wantsJson = (req) => req.xhr || (req.headers.accept || '').includes('json') || (req.path || '').startsWith('/api');

const requireAuth = (req, res, next) => {
    if (req.sessionRevoked) {
        res.clearCookie('connect.sid');
        if (wantsJson(req) || (req.headers.accept || '').includes('json')) {
            return res.status(401).json({ success: false, code: 'SESSION_REVOKED', error: 'Your account was logged in on another device.' });
        }
        return res.redirect('/login?reason=session-revoked');
    }
    if (!req.session?.userID) {
        if (wantsJson(req) || (req.headers.accept || '').includes('json')) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        return res.redirect('/login');
    }
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (req.sessionRevoked) {
            res.clearCookie('connect.sid');
            if ((req.headers.accept || '').includes('json') || req.xhr) {
                return res.status(401).json({ success: false, code: 'SESSION_REVOKED', error: 'Your account was logged in on another device.' });
            }
            return res.redirect('/login?reason=session-revoked');
        }
        if (!req.session?.userID) {
            if ((req.headers.accept || '').includes('json') || req.xhr) {
                return res.status(401).json({ success: false, error: 'Unauthorized' });
            }
            return res.redirect('/login');
        }

        const userRole = res.locals.user ? res.locals.user.role : null;
        if (!userRole || !roles.includes(userRole)) {
            if ((req.headers.accept || '').includes('json') || req.xhr) {
                return res.status(403).json({ success: false, error: 'Forbidden' });
            }
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        next();
    };
};

module.exports = {
    setUserLocal,
    requireAuth,
    requireRole
};
