require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const db = require('./config/db');
const { setUserLocal } = require('./middlewares/authMiddleware');
const playlistService = require('./services/playlistService');
const route = require('./routes');
const cors = require('cors');

// Connect to MongoDB
db.connect();

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    app.set('trust proxy', 1);
}

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Middlewares
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
// Strip NoSQL injection keys ($, .) from body/query/params
app.use(mongoSanitize());

// Rate limiting (Phase 0A minimal)
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const searchLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/search', searchLimiter);

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && isProd) {
    throw new Error('SESSION_SECRET is required in production.');
}
app.use(session({
    secret: sessionSecret || 'dev_only_secret_change_me',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    store: process.env.MONGO_URI ? MongoStore.create({ mongoUrl: process.env.MONGO_URI }) : undefined,
    cookie: {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}));

// Set session global variables
app.use(setUserLocal);

// Sidebar playlists loader (skip for API JSON to save queries)
app.use(async (req, res, next) => {
    if (req.session?.userID && !(req.headers.accept || '').includes('json') && !req.xhr) {
        try {
            res.locals.userPlaylists = await playlistService.getUserPlaylists(req.session.userID);
        } catch (error) {
            console.error('Error loading playlists for sidebar:', error.message);
            res.locals.userPlaylists = [];
        }
    } else {
        res.locals.userPlaylists = [];
    }
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://music-personal-new-v-0-1.vercel.app',
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 86400,
    credentials: true
}));

// Health check (no auth)
app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    res.json({
        success: true,
        uptime: process.uptime(),
        db: mongoose.connection.readyState === 1 ? 'up' : 'down'
    });
});

// Wiring routes
route(app);

// 404 handler (JSON-safe)
app.use((req, res) => {
    if ((req.headers.accept || '').includes('json') || req.xhr) {
        return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.status(404).json({ success: false, error: 'Not found' });
});

// Global error handler (never leak internals)
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err.message);
    // Multer/file errors -> 400 with message (safe, whitelisted)
    if (err.message && /Invalid (image|audio|file)|too large|only .* allowed/i.test(err.message)) {
        return res.status(400).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: 'Internal server error.' });
});



// Listen on Port (only when run directly — supertest imports the app without binding)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running successfully on port ${PORT}`);
    });
}

module.exports = app;
