require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const db = require('./config/db');
const { setUserLocal } = require('./middlewares/authMiddleware');
const playlistService = require('./services/playlistService');
const route = require('./routes');
const cors = require('cors');

// Connect to MongoDB
db.connect();

const app = express();
const PORT = process.env.PORT || 3000;

// Set template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// app.set('trust proxy', 1);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_123',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        secure: false,
        // sameSite: "none",
        // httpOnly: true 
    } // false for local HTTP dev
}));

// Set session global variables
app.use(setUserLocal);

// Sidebar playlists loader global middleware
app.use(async (req, res, next) => {
    if (req.session.userID) {
        try {
            res.locals.userPlaylists = await playlistService.getUserPlaylists(req.session.userID);
        } catch (error) {
            console.error('Error loading playlists for sidebar:', error);
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
        "https://music-personal-new-v-0-1.vercel.app"
    ],

    credentials: true
}));

// Wiring routes
route(app);

// 404 handler
app.use((req, res) => {
    res.status(404).render('errors/404', { title: '404 - Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).render('errors/500', { 
        title: '500 - Server Error',
        message: err.message || 'An unexpected error occurred.'
    });
});



// Listen on Port
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
});
