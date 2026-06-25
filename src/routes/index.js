const authRoutes = require('./authRoutes');
const songRoutes = require('./songRoutes');
const userRoutes = require('./userRoutes');
const playlistRoutes = require('./playlistRoutes');
const searchRoutes = require('./searchRoutes');
const artistRoutes = require('./artistRoutes');
const adminRoutes = require('./adminRoutes');
const homeController = require('../controllers/homeController');

function route(app) {
    // Auth Routes (login, register, logout)
    app.use('/', authRoutes);

    // Home Page
    app.get('/', homeController.index);
    app.get('/test', homeController.test);
    app.get('/home', (req, res) => res.redirect('/'));

    // Songs & Streaming
    app.use('/songs', songRoutes);
    // Legacy support for reference client player scripts calling '/music'
    app.use('/music', songRoutes);

    // Playlists
    app.use('/playlists', playlistRoutes);

    // Search
    app.use('/search', searchRoutes);

    // Artist Dashboard
    app.use('/artist', artistRoutes);

    // Admin Panel
    app.use('/admin', adminRoutes);

    // User Profile, Favorites, History, Follows
    app.use('/', userRoutes);
}

module.exports = route;
