const User = require('../models/User');

const setUserLocal = async (req, res, next) => {
    res.locals.userID = req.session?.userID || null;
    res.locals.user = null;

    if (req.session?.userID) {
        try {
            const user = await User.findById(req.session.userID).select('-password').lean();
            if (user) {
                if (user.status === 'banned') {
                    req.session?.destroy?.(() => {});
                    res.locals.userID = null;
                    res.locals.user = null;
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
