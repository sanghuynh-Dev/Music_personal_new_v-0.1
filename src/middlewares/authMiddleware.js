const User = require('../models/User');

const setUserLocal = async (req, res, next) => {
    res.locals.userID = req.session.userID || null;
    res.locals.user = null;

    if (req.session.userID) {
        try {
            const user = await User.findById(req.session.userID).lean();
            if (user) {
                res.locals.user = user;
            } else {
                // Session contains invalid ID
                req.session.destroy();
            }
        } catch (error) {
            console.error('Error fetching user for locals:', error);
        }
    }
    next();
};

const requireAuth = (req, res, next) => {
    if (!req.session.userID) {
        return res.redirect('/login');
    }
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.userID) {
            return res.redirect('/login');
        }
        
        const userRole = res.locals.user ? res.locals.user.role : null;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).render('errors/403', {
                title: 'Forbidden',
                message: 'You do not have permission to access this resource.'
            });
        }
        next();
    };
};

module.exports = {
    setUserLocal,
    requireAuth,
    requireRole
};
