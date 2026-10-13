const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware: reject invalid ObjectId params with 400 instead of CastError 500
const validateObjectId = (paramName = 'id') => (req, res, next) => {
    const val = req.params[paramName];
    if (val !== undefined && !isValidObjectId(val)) {
        return res.status(400).json({ success: false, error: `Invalid ${paramName}` });
    }
    next();
};

const validateBodyId = (field) => (req, res, next) => {
    const val = req.body && req.body[field];
    if (val !== undefined && val !== null && val !== '' && !isValidObjectId(val)) {
        return res.status(400).json({ success: false, error: `Invalid ${field}` });
    }
    next();
};

// Strip all HTML for plain-text fields (titles, names, comments)
const cleanText = (value, maxLen = 1000) => {
    if (value === undefined || value === null) return value;
    const s = sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} }).trim();
    return s.slice(0, maxLen);
};

const escapeRegExp = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);

const sanitizeUser = (user) => {
    if (!user) return null;
    const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};

module.exports = {
    isValidObjectId,
    validateObjectId,
    validateBodyId,
    cleanText,
    escapeRegExp,
    sanitizeUser,
};
